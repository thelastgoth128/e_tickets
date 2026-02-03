import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Organizer } from '../../organizers/entities/organizer.entity';
import { TicketTier } from '../../ticket_tiers/entities/ticket_tier.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Waitlist } from '../../waitlist/entities/waitlist.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { AuditLog } from '../../audit_log/entities/audit_log.entity';

export enum EventStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
}

@Entity('events')
export class Event {
    @PrimaryGeneratedColumn('uuid')
    event_id: string;

    @ManyToOne(() => Organizer, (organizer) => organizer.events)
    @JoinColumn({ name: 'organizer_id' })
    organizer: Organizer;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column()
    venue: string;

    @Column()
    date_time: Date;

    @Column()
    capacity: number;

    @Column({
        type: 'enum',
        enum: EventStatus,
        default: EventStatus.DRAFT,
    })
    status: EventStatus;

    @Column({ nullable: true })
    image_url: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => TicketTier, (tier) => tier.event)
    ticketTiers: TicketTier[];

    @OneToMany(() => Ticket, (ticket) => ticket.event)
    tickets: Ticket[];

    @OneToMany(() => Waitlist, (waitlist) => waitlist.event)
    waitlists: Waitlist[];

    @OneToMany(() => Notification, (notification) => notification.event)
    notifications: Notification[];

    @OneToMany(() => Feedback, (feedback) => feedback.event)
    feedback: Feedback[];

    @OneToMany(() => AuditLog, (audit_log) => audit_log.event)
    auditLogs: AuditLog[];
}
