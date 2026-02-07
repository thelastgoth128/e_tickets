import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Webhook } from './entities/webhook.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { PayChanguWebhookDto } from './dto/paychangu-webhook.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);

    constructor(
        @InjectRepository(Webhook)
        private readonly webhookRepository: Repository<Webhook>,
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly configService: ConfigService,
        private readonly dataSource: DataSource,
    ) { }

    verifySignature(payload: any, signature: string): boolean {
        const secret = this.configService.get<string>('PAYCHANGU_WEBHOOK_SECRET');
        if (!secret) {
            this.logger.error('PAYCHANGU_WEBHOOK_SECRET is not defined in environment variables');
            return false;
        }

        const hash = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload))
            .digest('hex');

        return hash === signature;
    }

    async handleWebhook(dto: PayChanguWebhookDto) {
        // 1. Audit the webhook
        const webhook = this.webhookRepository.create({
            event: dto.event,
            payload: dto,
        });
        await this.webhookRepository.save(webhook);

        const { event, data } = dto;
        const tx_ref = data.tx_ref;

        // 2. Fetch the transaction
        const transaction = await this.transactionRepository.findOne({ where: { tx_ref } });
        if (!transaction) {
            this.logger.warn(`Transaction not found for tx_ref: ${tx_ref}`);
            return;
        }

        // 3. Handle based on event type
        switch (event) {
            case 'payment.success':
                await this.updatePaymentStatus(tx_ref, {
                    status: 'COMPLETED',
                    escrow_status: 'RELEASED',
                    charges: Number(data.charge || 0),
                    net_amount: Number(data.net_amount || 0),
                    completed_at: new Date(),
                });
                break;

            case 'payment.failed':
                await this.updatePaymentStatus(tx_ref, {
                    status: 'FAILED',
                    escrow_status: 'CANCELLED',
                    completed_at: new Date(),
                });
                break;

            case 'payment.pending':
                await this.updatePaymentStatus(tx_ref, {
                    status: 'PENDING',
                    escrow_status: 'HELD',
                });
                break;

            case 'escrow.released':
                await this.updatePaymentStatus(tx_ref, {
                    escrow_status: 'RELEASED',
                    released_at: new Date(),
                });
                break;

            case 'escrow.cancelled':
                await this.updatePaymentStatus(tx_ref, {
                    escrow_status: 'CANCELLED',
                });
                break;

            default:
                this.logger.log(`Unhandled webhook event type: ${event}`);
                break;
        }
    }

    async updatePaymentStatus(tx_ref: string, data: Partial<Transaction>, retries = 3): Promise<void> {
        try {
            await this.transactionRepository.update({ tx_ref }, data);
            this.logger.log(`Successfully updated transaction ${tx_ref} with status ${data.status || 'N/A'}`);
        } catch (error) {
            if (retries > 0) {
                this.logger.warn(`Failed to update transaction ${tx_ref}. Retrying... (${retries} attempts left)`);
                await new Promise(res => setTimeout(res, 1000));
                return this.updatePaymentStatus(tx_ref, data, retries - 1);
            }
            this.logger.error(`Failed to update transaction ${tx_ref} after multiple retries`, (error as Error).stack);
            throw error;
        }
    }
}
