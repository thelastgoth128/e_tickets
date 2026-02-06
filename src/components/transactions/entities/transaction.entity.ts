import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn } from 'typeorm';
import { Refund } from '../../refunds/entities/refund.entity';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    tx_ref: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    net_amount: number; // Amount after charges

    @Column()
    currency: string;

    @Column()
    mobile: string;

    @Column({ default: 'PENDING' })
    status: string; // PENDING, COMPLETED, FAILED

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    charges: number;

    // Escrow fields
    @Column({ default: 'HELD' })
    escrow_status: string; // HELD, RELEASED, REFUNDED

    @Column({ nullable: true })
    escrow_held_at: Date; // When money entered escrow

    @Column({ nullable: true })
    escrow_release_date: Date; // When money can be released (event date)

    @Column({ nullable: true })
    released_at: Date; // When money was released to organizer

    // Foreign keys
    @Column({ nullable: true, type: 'varchar' })
    organizer_id: string;

    @Column({ nullable: true })
    event_id: string;

    @Column({ nullable: true })
    tier_id: string;

    @Column({ default: 1 })
    quantity: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ nullable: true })
    completed_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Relations
    @OneToMany(() => Refund, (refund) => refund.transaction, { cascade: ['soft-remove'] })
    refunds: Refund[];

    // Placeholder for User relation
    // @ManyToOne(() => User, (user) => user.transactions)
    // user: User;
}
