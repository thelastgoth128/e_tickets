import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('refunds')
export class Refund {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    transaction_id: number;

    @ManyToOne(() => Transaction, (transaction) => transaction.refunds)
    @JoinColumn({ name: 'transaction_id' })
    transaction: Transaction;

    @Column({ nullable: true })
    buyer_id: number; // ID of the buyer requesting refund

    @Column({ nullable: true })
    organizer_id: number; // ID of organizer (if organizer initiates refund)

    @Column('decimal', { precision: 10, scale: 2 })
    refund_amount: number; // Amount to be refunded

    @Column()
    reason: string; // Reason for refund request

    @Column({ default: 'PENDING' })
    status: string; // PENDING, APPROVED, REJECTED, COMPLETED

    @Column({ nullable: true })
    admin_notes: string; // Notes from admin when processing

    @Column({ nullable: true })
    processed_by: number; // Admin/Organizer ID who processed the refund

    @CreateDateColumn()
    requested_at: Date;

    @Column({ nullable: true })
    processed_at: Date;

    @Column({ nullable: true })
    refunded_at: Date; // When money was actually returned

    @UpdateDateColumn()
    updated_at: Date;
}
