import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
    @ApiProperty({ example: 'uuid-ticket-123', description: 'ID of the ticket being purchased' })
    ticketId: string;

    @ApiProperty({ example: 'uuid-event-123', description: 'ID of the event' })
    eventId: string;

    @ApiProperty({ example: 1, description: 'ID of the organizer' })
    organizerId: number;

    @ApiProperty({ example: 50.00, description: 'Amount to be paid' })
    amount: number;

    @ApiProperty({ example: 'mobile_money', description: 'Method of payment (e.g., mobile_money)' })
    paymentMethod: string;

    @ApiProperty({ example: 'buyer', description: 'Role of the payer' })
    payerRole: string; // e.g. buyer

    @ApiProperty({ example: '0999123456', description: 'Mobile number for payment' })
    mobile: string;

    @ApiProperty({ example: 'email@example.com', description: 'Email address of the payer', required: false })
    email?: string;

    @ApiProperty({ example: 'John Doe', description: 'First name of the payer', required: false })
    first_name?: string;

    @ApiProperty({ description: 'Transaction Reference', required: false })
    tx_ref?: string;
}
