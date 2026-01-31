import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('ticket_tiers')
export class TicketTier {
    @PrimaryGeneratedColumn('uuid')
    tier_id: string;

    @ManyToOne(() => Event, (event) => event.ticketTiers)
    @JoinColumn({ name: 'event_id' })
    event: Event;

    @Column()
    tier_name: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column()
    capacity: number;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => Ticket, (ticket) => ticket.ticketTier)
    tickets: Ticket[];
}
