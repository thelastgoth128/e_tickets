import { HttpException, HttpStatus, Injectable, NotFoundException, Req } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly httpService: HttpService,
  ) { }

  private readonly operatorIds = {
    '8': '27494cb5-ba9e-437f-a114-4e7a7686bcca',
    '9': '20be6c20-adeb-4b5b-a7ba-0769820df4fb',
  };

  private getMobileMoneyOperatorIds(mobile: string) {
    const prefix = mobile.charAt(0);
    const refId = this.operatorIds[prefix];
    if (!refId) {
      throw new HttpException('Unsupported mobile number', HttpStatus.BAD_REQUEST);
    }
    return refId;
  }

  private transactionId(): string {
    return uuidv4();
  }

  create(createTransactionDto: CreateTransactionDto) {
    return 'This action adds a new transaction';
  }

  async processPayment(createTransactionDto: CreateTransactionDto, @Req() req: Request): Promise<any> {
    const { amount, mobile } = createTransactionDto;
    const mobileMoneyOperatorId = this.getMobileMoneyOperatorIds(mobile);
    const charge_id = this.transactionId();

    // Placeholder for user details until Auth is fully integrated
    const name = createTransactionDto.first_name || 'Guest User';
    const email = createTransactionDto.email || 'guest@example.com';

    createTransactionDto.tx_ref = this.transactionId();

    const transaction = new Transaction();
    transaction.tx_ref = createTransactionDto.tx_ref;
    transaction.amount = amount;
    transaction.mobile = mobile;
    transaction.currency = 'MWK';
    transaction.status = 'PENDING';
    
    // Initialize escrow
    transaction.escrow_status = 'HELD';
    transaction.escrow_held_at = new Date();
    transaction.organizer_id = createTransactionDto['organizer_id'];
    transaction.event_id = createTransactionDto['event_id'];
    transaction.ticket_id = createTransactionDto.ticketId;

    await this.transactionRepo.save(transaction);

    const options = {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.paychangu.com/mobile-money/payments/initialize',
          {
            mobile,
            mobile_money_operator_ref_id: mobileMoneyOperatorId,
            amount: amount,
            charge_id: charge_id,
            created_at: new Date(),
            first_name: name,
            email,
            tx_ref: createTransactionDto.tx_ref,
          },
          options,
        ),
      );
      const data = response.data;

      if (data.status === 'success') {
        const transaction = await this.transactionRepo.findOne({ where: { tx_ref: createTransactionDto.tx_ref } });
        if (transaction) {
          transaction.status = 'COMPLETED';
          transaction.completed_at = new Date();
          transaction.charges = data.data.charges || 0;
          transaction.net_amount = amount - transaction.charges;
          await this.transactionRepo.save(transaction);
        }

        return {
          statusCode: 200,
          message: 'Payment initiated successfully - Funds held in escrow',
          data: {
            ...data.data,
            escrow_status: transaction.escrow_status,
            net_amount: transaction.net_amount,
          },
        };
      } else {
        throw new Error(data.message || 'Payment initiation failed.');
      }
    } catch (error) {
      console.error('Error processing payment:', error.response?.data || error.message);
      throw new HttpException(error.response?.data?.message || 'Payment failed', HttpStatus.BAD_REQUEST);
    }
  }

  async getPaymentStatus(tx_ref: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://api.paychangu.com/payment/status/${tx_ref}`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
          },
        }),
      );
      const data = response.data;
      if (data.status === 'success') {
        // Get escrow information
        const transaction = await this.transactionRepo.findOne({ where: { tx_ref } });
        return {
          statusCode: 200,
          message: 'Payment status retrieved successfully.',
          data: {
            ...data.data,
            escrow_status: transaction?.escrow_status,
            escrow_held_at: transaction?.escrow_held_at,
            escrow_release_date: transaction?.escrow_release_date,
          },
        };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error retrieving payment status:', error.message);
      throw new HttpException(error.response?.data?.message || 'Error fetching status', HttpStatus.BAD_REQUEST);
    }
  }

  async verifyPayment(tx_ref: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://api.paychangu.com/verify-payment/${tx_ref}`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
          },
        }),
      );
      const data = response.data;

      if (data.status === 'success') {
        return {
          statusCode: 200,
          message: 'Payment verified successfully',
          data: data.data,
        };
      } else {
        throw new HttpException(data.message || 'Payment verification failed.', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('Error verifying payment:', error?.response?.data || error.message);
      throw new HttpException(
        error?.response?.data?.message || 'An error occurred while verifying payment.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Release funds from escrow to organizer
   * Called after event date passes and no active refunds
   */
  async releaseEscrow(transactionId: number, organizerMobile: string): Promise<any> {
    const transaction = await this.transactionRepo.findOne({
      where: { id: transactionId },
      relations: ['refunds'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction #${transactionId} not found`);
    }

    // Check if there are pending refunds
    const pendingRefunds = transaction.refunds?.filter(r => r.status === 'PENDING');
    if (pendingRefunds && pendingRefunds.length > 0) {
      throw new HttpException(
        'Cannot release escrow - pending refunds exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check escrow status
    if (transaction.escrow_status !== 'HELD') {
      throw new HttpException(
        `Cannot release escrow - current status is ${transaction.escrow_status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update transaction
    transaction.escrow_status = 'RELEASED';
    transaction.released_at = new Date();
    await this.transactionRepo.save(transaction);

    // Initiate payout to organizer
    return this.initiatePayout(organizerMobile, transaction.net_amount.toString());
  }

  /**
   * Refund funds from escrow back to buyer
   */
  async refundEscrow(transactionId: number, refundAmount: number): Promise<any> {
    const transaction = await this.transactionRepo.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction #${transactionId} not found`);
    }

    if (transaction.escrow_status === 'REFUNDED') {
      throw new HttpException(
        'Funds already refunded',
        HttpStatus.BAD_REQUEST,
      );
    }

    transaction.escrow_status = 'REFUNDED';
    await this.transactionRepo.save(transaction);

    return {
      statusCode: 200,
      message: 'Escrow funds refunded to buyer',
      data: {
        transaction_id: transactionId,
        refund_amount: refundAmount,
        escrow_status: transaction.escrow_status,
      },
    };
  }

  async initiatePayout(mobile: string, amount: string): Promise<any> {
    const mobileMoneyOperatorId = this.getMobileMoneyOperatorIds(mobile);
    const charge_id = this.transactionId();

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.paychangu.com/mobile-money/payments/initialize',
          {
            mobile,
            mobile_money_operator_ref_id: mobileMoneyOperatorId,
            amount,
            charge_id,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (response.data.status === 'success') {
        return {
          statusCode: 200,
          message: 'Payout initiated successfully.',
          data: response.data.data,
        };
      } else {
        throw new HttpException('Failed to initiate mobile money payout.', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('Error initiating payout:', error.response?.data || error.message);
      throw new HttpException('An error occurred while processing payout.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
