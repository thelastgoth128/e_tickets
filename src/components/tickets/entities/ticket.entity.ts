import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { TicketTier } from '../../ticket_tiers/entities/ticket_tier.entity';
import { User } from '../../users/entities/user.entity';

export enum TicketStatus {
    ACTIVE = 'active',
    REFUNDED = 'refunded',
    REDEEMED = 'redeemed',
    TRANSFERRED = 'transferred',
}

@Entity('tickets')
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    ticket_id: string;

    @ManyToOne(() => Event, (event) => event.tickets)
    @JoinColumn({ name: 'event_id' })
    event: Event;

    @ManyToOne(() => TicketTier, (tier) => tier.tickets)
    @JoinColumn({ name: 'tier_id' })
    ticketTier: TicketTier;

    @ManyToOne(() => User, (user) => user.tickets, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ unique: true })
    QR_code: string;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.ACTIVE,
    })
    status: TicketStatus;

    @CreateDateColumn()
    issued_at: Date;

    @Column({ nullable: true })
    redeemed_at: Date;
}
