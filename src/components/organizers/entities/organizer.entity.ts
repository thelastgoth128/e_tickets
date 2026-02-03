import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

export enum ApprovalStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Entity('organizers')
export class Organizer {
    @PrimaryGeneratedColumn('uuid')
    organizer_id: string;

    @OneToOne(() => User, (user) => user.organizer)
    @JoinColumn({ name: 'organizer_id' })
    user: User;

    @Column({nullable: true})
    business_name: string;

    @Column({nullable: true})
    bank_account_number: string;

    @Column({nullable: true})
    bank_code: string;

    @Column({ nullable: true })
    KYC_documents: string;

    @Column({
        // type: 'enum',
        // enum: ApprovalStatus,
        // default: ApprovalStatus.PENDING,
    nullable:true},)
    approval_status: ApprovalStatus;

    @OneToMany(() => Event, (event) => event.organizer)
    events: Event[];
}
