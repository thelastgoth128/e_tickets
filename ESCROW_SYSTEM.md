# Event Ticketing - Escrow System Documentation

## Overview

The escrow system ensures secure handling of ticket payment funds by holding money in a neutral account until the event occurs, protecting both buyers and organizers.

---

## How Escrow Works

### 1. **Payment Flow (Money Enters Escrow)**

When a buyer purchases a ticket:

```
Buyer → Pays via PayChangu → Platform's Escrow Account
```

**Process:**
- `POST /transactions/make-payment`
- Money is temporarily held in escrow
- Transaction status: `COMPLETED`
- Escrow status: `HELD`

**Transaction Fields:**
- `escrow_status`: `HELD` (initial state)
- `escrow_held_at`: Timestamp when money entered escrow
- `organizer_id`: Linked to the event organizer
- `event_id`: Linked to the event
- `net_amount`: Amount after platform charges

---

### 2. **Money Release (After Event)**

After the event date passes successfully:

```
Escrow Account → Organizer's Mobile Money Account
```

**Process:**
- `POST /transactions/release-escrow/:transactionId`
- Admin verifies event completion
- Checks for pending refunds (cannot release if refunds exist)
- Updates transaction: `escrow_status = RELEASED`
- Calls payout endpoint to transfer to organizer

**Requirements:**
- No pending refunds
- Event date must have passed
- Admin authorization

**Response:**
```json
{
  "statusCode": 200,
  "message": "Escrow funds released to organizer",
  "data": {
    "transaction_id": 1,
    "net_amount": 47.50,
    "escrow_status": "RELEASED",
    "released_at": "2026-01-29T10:30:00Z"
  }
}
```

---

### 3. **Refund Process (Money Returns to Buyer)**

Buyers can request refunds before or after event date:

```
Escrow Account → Buyer's Mobile Money Account
```

#### 3.1 Request Refund
- `POST /refunds`
- Buyer submits refund request with reason
- Refund created with status: `PENDING`

**Request:**
```json
{
  "transaction_id": 1,
  "buyer_id": 5,
  "reason": "Event cancelled",
  "refund_amount": 50.00
}
```

**Validation:**
- Transaction must be `COMPLETED`
- No previous refunds on this transaction
- Transaction escrow not already `REFUNDED`

#### 3.2 Admin Reviews & Approves/Rejects

- `PATCH /refunds/:id`
- Admin can `APPROVE` or `REJECT` the refund
- If `APPROVED`:
  - Escrow status changes: `HELD` → `REFUNDED`
  - Refund status: `PENDING` → `COMPLETED`
  - `refunded_at` timestamp is set
  - Money is queued for return to buyer

**Request:**
```json
{
  "status": "APPROVED",
  "admin_notes": "Event cancelled by organizer",
  "processed_by": 10
}
```

#### 3.3 Money Returned to Buyer

- Backend calls PayChangu API
- Money transferred from escrow to buyer's account
- Refund marked as completed

---

## Escrow States

### State Diagram

```
         ┌─────────────────────────────────────┐
         │         HELD (Initial)              │
         │   Money in escrow account          │
         └────────────┬────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
    ┌─────▼────────┐        ┌────▼──────────┐
    │   RELEASED   │        │   REFUNDED    │
    │ (to organizer)        (to buyer)      │
    └──────────────┘        └───────────────┘
```

### State Transitions

| From | To | Trigger | Condition |
|------|--|----|----------|
| `HELD` | `RELEASED` | Event date passes + no refunds pending | Admin authorization |
| `HELD` | `REFUNDED` | Refund approved | Buyer/Organizer requests + admin approves |
| `RELEASED` | N/A | Cannot revert | Final state |
| `REFUNDED` | N/A | Cannot revert | Final state |

---

## Transaction Entity Fields

### New Escrow Fields

```typescript
@Column({ default: 'HELD' })
escrow_status: string; // HELD, RELEASED, REFUNDED

@Column({ nullable: true })
escrow_held_at: Date; // When money entered escrow

@Column({ nullable: true })
escrow_release_date: Date; // When money can be released

@Column({ nullable: true })
released_at: Date; // When money was released to organizer

// Foreign keys
@Column({ nullable: true })
organizer_id: number;

@Column({ nullable: true })
event_id: number;

@Column({ nullable: true })
ticket_id: number;

// Amount tracking
@Column('decimal', { precision: 10, scale: 2, default: 0 })
net_amount: number; // Amount after charges
```

---

## Refund Entity

```typescript
@Entity('refunds')
export class Refund {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    transaction_id: number; // Links to transaction

    @Column({ nullable: true })
    buyer_id: number;

    @Column({ nullable: true })
    organizer_id: number;

    @Column('decimal', { precision: 10, scale: 2 })
    refund_amount: number;

    @Column()
    reason: string;

    @Column({ default: 'PENDING' })
    status: string; // PENDING, APPROVED, REJECTED, COMPLETED

    @Column({ nullable: true })
    admin_notes: string;

    @Column({ nullable: true })
    processed_by: number;

    @CreateDateColumn()
    requested_at: Date;

    @Column({ nullable: true })
    processed_at: Date;

    @Column({ nullable: true })
    refunded_at: Date;
}
```

---

## API Endpoints

### Transactions (Escrow Management)

#### 1. Create Payment (Enter Escrow)
```http
POST /transactions/make-payment
Content-Type: application/json

{
  "amount": 50.00,
  "mobile": "0999123456",
  "ticketId": 1,
  "email": "buyer@example.com",
  "first_name": "John",
  "organizer_id": 1,
  "event_id": 5
}

Response: 201
{
  "statusCode": 200,
  "message": "Payment initiated successfully - Funds held in escrow",
  "data": {
    "escrow_status": "HELD",
    "net_amount": 47.50,
    "tx_ref": "TXN-xyz123"
  }
}
```

#### 2. Release Escrow to Organizer
```http
POST /transactions/release-escrow/1
Content-Type: application/json

{
  "organizer_mobile": "0999987654"
}

Response: 200
{
  "statusCode": 200,
  "message": "Escrow funds released to organizer",
  "data": {
    "transaction_id": 1,
    "net_amount": 47.50,
    "escrow_status": "RELEASED"
  }
}
```

#### 3. Refund from Escrow
```http
POST /transactions/refund-escrow/1
Content-Type: application/json

{
  "refund_amount": 50.00
}

Response: 200
{
  "statusCode": 200,
  "message": "Escrow funds refunded to buyer",
  "data": {
    "transaction_id": 1,
    "refund_amount": 50.00,
    "escrow_status": "REFUNDED"
  }
}
```

---

### Refunds (Refund Requests)

#### 1. Request Refund
```http
POST /refunds
Content-Type: application/json

{
  "transaction_id": 1,
  "buyer_id": 5,
  "reason": "Event cancelled",
  "refund_amount": 50.00
}

Response: 201
{
  "statusCode": 201,
  "message": "Refund request submitted successfully",
  "data": {
    "id": 1,
    "transaction_id": 1,
    "status": "PENDING",
    "refund_amount": 50.00,
    "requested_at": "2026-01-29T10:00:00Z"
  }
}
```

#### 2. List All Refunds
```http
GET /refunds

Response: 200
[
  {
    "id": 1,
    "transaction_id": 1,
    "status": "PENDING",
    "reason": "Event cancelled",
    "requested_at": "2026-01-29T10:00:00Z"
  }
]
```

#### 3. Get Refund by ID
```http
GET /refunds/1

Response: 200
{
  "id": 1,
  "transaction_id": 1,
  "buyer_id": 5,
  "reason": "Event cancelled",
  "status": "PENDING",
  "requested_at": "2026-01-29T10:00:00Z"
}
```

#### 4. Process Refund (Approve/Reject)
```http
PATCH /refunds/1
Content-Type: application/json

{
  "status": "APPROVED",
  "admin_notes": "Event was cancelled by organizer",
  "processed_by": 10
}

Response: 200
{
  "statusCode": 200,
  "message": "Refund approved and processed successfully",
  "data": {
    "id": 1,
    "transaction_id": 1,
    "status": "COMPLETED",
    "processed_at": "2026-01-29T11:30:00Z",
    "refunded_at": "2026-01-29T11:30:00Z"
  }
}
```

#### 5. Get Refunds by Transaction
```http
GET /refunds/transaction/1

Response: 200
[
  {
    "id": 1,
    "transaction_id": 1,
    "status": "COMPLETED",
    "refund_amount": 50.00
  }
]
```

#### 6. Get Refunds by Buyer
```http
GET /refunds/buyer/5

Response: 200
[
  {
    "id": 1,
    "buyer_id": 5,
    "transaction_id": 1,
    "status": "COMPLETED"
  }
]
```

#### 7. Get Refund Summary
```http
GET /refunds/summary

Response: 200
{
  "total": 10,
  "pending": 2,
  "approved": 6,
  "rejected": 2
}
```

---

## Security & Validation

### Payment Processing
- ✅ Validate mobile number format
- ✅ Verify PayChangu API responses
- ✅ Initialize escrow on successful payment
- ✅ Calculate net amount after charges

### Escrow Release
- ✅ Verify no pending refunds exist
- ✅ Check escrow status is `HELD`
- ✅ Require admin authorization
- ✅ Verify event date has passed

### Refund Processing
- ✅ Validate transaction exists and is `COMPLETED`
- ✅ Prevent duplicate refund requests
- ✅ Only admin can approve/reject
- ✅ Track admin who processed refund
- ✅ Record timestamps for all actions

---

## Error Scenarios

### 1. Cannot Release Escrow
```
Condition: Pending refunds exist
Response: 400 Bad Request
{
  "message": "Cannot release escrow - pending refunds exist"
}
```

### 2. Cannot Process Refund
```
Condition: Transaction status is not COMPLETED
Response: 400 Bad Request
{
  "message": "Transaction must be completed to request a refund"
}
```

### 3. Duplicate Refund Request
```
Condition: Pending refund already exists for transaction
Response: 400 Bad Request
{
  "message": "A refund request for this transaction is already pending"
}
```

### 4. Already Refunded
```
Condition: Transaction already marked as REFUNDED
Response: 400 Bad Request
{
  "message": "This transaction has already been refunded"
}
```

---

## Database Migrations Needed

```sql
-- Add escrow columns to transactions
ALTER TABLE transactions ADD COLUMN escrow_status VARCHAR(20) DEFAULT 'HELD';
ALTER TABLE transactions ADD COLUMN escrow_held_at TIMESTAMP;
ALTER TABLE transactions ADD COLUMN escrow_release_date TIMESTAMP;
ALTER TABLE transactions ADD COLUMN released_at TIMESTAMP;
ALTER TABLE transactions ADD COLUMN organizer_id INT;
ALTER TABLE transactions ADD COLUMN event_id INT;
ALTER TABLE transactions ADD COLUMN ticket_id INT;
ALTER TABLE transactions ADD COLUMN net_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE transactions ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Create refunds table
CREATE TABLE refunds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL,
    buyer_id INT,
    organizer_id INT,
    refund_amount DECIMAL(10, 2) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    admin_notes TEXT,
    processed_by INT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    refunded_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);
```

---

## Best Practices

### For Organizers
1. Ensure event date is set correctly in system
2. Monitor pending refund requests
3. Request escrow release only after event completion
4. Keep mobile money account active for payouts

### For Admins
1. Verify all refund requests before approving
2. Add detailed notes when rejecting refunds
3. Monitor escrow fund totals
4. Process payouts promptly after event

### For Buyers
1. Request refunds promptly if event is cancelled
2. Keep mobile account information current
3. Monitor refund status

---

## Audit Trail

All escrow and refund operations are logged with:
- **User** who initiated the action
- **Timestamp** of the action
- **Previous state** and **new state**
- **Reason** (for refunds and rejections)
- **Admin notes** for approvals/rejections

This is tracked through:
- `created_at`, `updated_at` on transactions
- `requested_at`, `processed_at`, `refunded_at` on refunds
- `processed_by` field to identify admin who processed
- `admin_notes` field for decision notes

---

## Future Enhancements

1. **Automated Escrow Release**: Schedule jobs to automatically release escrow after event date
2. **Partial Refunds**: Support partial refund amounts
3. **Refund Reasons**: Pre-defined refund reason categories
4. **Dispute Resolution**: Add dispute/escalation system
5. **Multi-currency**: Support multiple currencies beyond MWK
6. **Webhooks**: Notify organizers/buyers of escrow status changes
7. **Audit Reports**: Generate escrow movement reports
8. **Commission Tracking**: Detailed platform commission tracking

