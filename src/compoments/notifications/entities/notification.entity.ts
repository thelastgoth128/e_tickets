import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

export enum NotificationType {
    EMAIL = 'email',
    SMS = 'SMS',
    IN_APP = 'in-app',
}

export enum NotificationStatus {
    SENT = 'sent',
    PENDING = 'pending',
    FAILED = 'failed',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    notification_id: string;

    @ManyToOne(() => User, (user) => user.notifications)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Event, (event) => event.notifications, { nullable: true })
    @JoinColumn({ name: 'event_id' })
    event: Event;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column('text')
    message_content: string;

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.PENDING,
    })
    status: NotificationStatus;

    @CreateDateColumn()
    created_at: Date;
}
