import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity('audit_log')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    log_id: string;

    @ManyToOne(() => User, (user) => user.auditLogs)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Event, (event) => event.auditLogs, { nullable: true })
    @JoinColumn({ name: 'event_id' })
    event: Event;

    @Column()
    action: string;

    @CreateDateColumn()
    timestamp: Date;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;
}
