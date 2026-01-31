import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';

export enum WaitlistStatus {
    WAITING = 'waiting',
    OFFERED = 'offered',
    PURCHASED = 'purchased',
    EXPIRED = 'expired',
}

@Entity('waitlist')
export class Waitlist {
    @PrimaryGeneratedColumn('uuid')
    waitlist_id: string;

    @ManyToOne(() => Event, (event) => event.waitlists)
    @JoinColumn({ name: 'event_id' })
    event: Event;

    @ManyToOne(() => User, (user) => user.waitlists)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @CreateDateColumn()
    joined_at: Date;

    @Column({ nullable: true })
    notified_at: Date;

    @Column({
        type: 'enum',
        enum: WaitlistStatus,
        default: WaitlistStatus.WAITING,
    })
    status: WaitlistStatus;
}
