import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('webhooks')
export class Webhook {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    event: string;

    @Column('jsonb')
    payload: any;

    @CreateDateColumn()
    received_at: Date;
}
