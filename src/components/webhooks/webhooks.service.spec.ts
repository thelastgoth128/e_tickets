import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from './webhooks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Webhook } from './entities/webhook.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';

describe('WebhooksService', () => {
    let service: WebhooksService;
    let webhookRepo: any;
    let transactionRepo: any;
    let configService: any;

    const mockWebhookRepo = {
        create: jest.fn().mockImplementation(dto => dto),
        save: jest.fn().mockResolvedValue({ id: 1 }),
    };

    const mockTransactionRepo = {
        findOne: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
    };

    const mockConfigService = {
        get: jest.fn().mockReturnValue('test-secret'),
    };

    const mockDataSource = {
        createEntityManager: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WebhooksService,
                {
                    provide: getRepositoryToken(Webhook),
                    useValue: mockWebhookRepo,
                },
                {
                    provide: getRepositoryToken(Transaction),
                    useValue: mockTransactionRepo,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        service = module.get<WebhooksService>(WebhooksService);
        webhookRepo = module.get(getRepositoryToken(Webhook));
        transactionRepo = module.get(getRepositoryToken(Transaction));
        configService = module.get(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('verifySignature', () => {
        it('should return true for a valid signature', () => {
            const payload = { event: 'test', data: { tx_ref: '123' } };
            const secret = 'test-secret';
            const signature = crypto
                .createHmac('sha256', secret)
                .update(JSON.stringify(payload))
                .digest('hex');

            expect(service.verifySignature(payload, signature)).toBe(true);
        });

        it('should return false for an invalid signature', () => {
            const payload = { event: 'test' };
            expect(service.verifySignature(payload, 'wrong-sig')).toBe(false);
        });
    });

    describe('handleWebhook', () => {
        it('should handle payment.success correctly', async () => {
            const dto = {
                event: 'payment.success',
                data: {
                    tx_ref: 'TX-123',
                    amount: 1000,
                    charge: 50,
                    net_amount: 950,
                },
            };

            mockTransactionRepo.findOne.mockResolvedValue({ tx_ref: 'TX-123', status: 'PENDING' });

            await service.handleWebhook(dto as any);

            expect(webhookRepo.save).toHaveBeenCalled();
            expect(transactionRepo.update).toHaveBeenCalledWith(
                { tx_ref: 'TX-123' },
                expect.objectContaining({
                    status: 'COMPLETED',
                    escrow_status: 'RELEASED',
                    charges: 50,
                    net_amount: 950,
                }),
            );
        });

        it('should handle payment.failed correctly', async () => {
            const dto = {
                event: 'payment.failed',
                data: {
                    tx_ref: 'TX-123',
                },
            };

            mockTransactionRepo.findOne.mockResolvedValue({ tx_ref: 'TX-123', status: 'PENDING' });

            await service.handleWebhook(dto as any);

            expect(transactionRepo.update).toHaveBeenCalledWith(
                { tx_ref: 'TX-123' },
                expect.objectContaining({
                    status: 'FAILED',
                    escrow_status: 'CANCELLED',
                }),
            );
        });
    });
});
