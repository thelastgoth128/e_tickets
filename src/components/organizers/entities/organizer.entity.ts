import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

export enum ApprovalStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Entity('organizers')
export class Organizer {
    @PrimaryColumn('uuid')
    organizer_id: string;

    @OneToOne(() => User, (user) => user.organizer)
    @JoinColumn({ name: 'organizer_id' })
    user: User;

    @Column()
    business_name: string;

    @Column()
    bank_account_number: string;

    @Column()
    bank_code: string;

    @Column({ nullable: true })
    KYC_documents: string;

    @Column({
        type: 'enum',
        enum: ApprovalStatus,
        default: ApprovalStatus.PENDING,
    })
    approval_status: ApprovalStatus;

    @OneToMany(() => Event, (event) => event.organizer)
    events: Event[];
}
