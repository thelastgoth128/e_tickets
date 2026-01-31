import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Organizer } from '../../organizers/entities/organizer.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Waitlist } from '../../waitlist/entities/waitlist.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { AuditLog } from '../../audit_log/entities/audit_log.entity';

export enum UserRole {
    GUEST = 'Guest',
    BUYER = 'Buyer',
    ORGANIZER = 'Organizer',
    VERIFIER = 'Verifier',
    ADMIN = 'Admin',
    SUPPORT = 'Support',
    AUDITOR = 'Auditor',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    user_id: string;

    @Column()
    full_name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone_number: string;

    @Column()
    password_hash: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.GUEST,
    })
    role: UserRole;

    @Column({ nullable: true })
    student_number: string;

    @Column({ default: false })
    student_verified: boolean;

    @Column({ default: false })
    verified: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToOne(() => Organizer, (organizer) => organizer.user)
    organizer: Organizer;

    @OneToMany(() => Ticket, (ticket) => ticket.user)
    tickets: Ticket[];

    @OneToMany(() => Waitlist, (waitlist) => waitlist.user)
    waitlists: Waitlist[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];

    @OneToMany(() => Feedback, (feedback) => feedback.user)
    feedback: Feedback[];

    @OneToMany(() => AuditLog, (audit_log) => audit_log.user)
    auditLogs: AuditLog[];
}
