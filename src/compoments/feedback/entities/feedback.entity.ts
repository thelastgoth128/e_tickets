import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';

@Entity('feedback')
export class Feedback {
    @PrimaryGeneratedColumn('uuid')
    feedback_id: string;

    @ManyToOne(() => Event, (event) => event.feedback)
    @JoinColumn({ name: 'event_id' })
    event: Event;

    @ManyToOne(() => User, (user) => user.feedback)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'int' })
    rating: number;

    @Column('text')
    comment: string;

    @CreateDateColumn()
    submitted_at: Date;
}
