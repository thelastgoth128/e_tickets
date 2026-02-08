import { HttpException, HttpStatus, Injectable, NotFoundException, Req, BadRequestException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TicketTier } from '../ticket_tiers/entities/ticket_tier.entity';
import { TicketsService } from '../tickets/tickets.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(TicketTier)
    private readonly ticketTierRepository: Repository<TicketTier>,
    private readonly httpService: HttpService,
    private readonly ticketsService: TicketsService,
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
    return this.processPayment(createTransactionDto);
  }

  async processPayment(createTransactionDto: CreateTransactionDto): Promise<any> {
  const { mobile, quantity, tierId } = createTransactionDto;

  const tier = await this.ticketTierRepository.findOne({ where: { tier_id: tierId } });
  if (!tier) {
    throw new NotFoundException(`Ticket Tier with ID ${tierId} not found`);
  }

  if (tier.capacity < quantity) {
    throw new BadRequestException(`Only ${tier.capacity} tickets available`);
  }

  const totalAmount = Number(tier.price) * quantity;
  const mobileMoneyOperatorId = this.getMobileMoneyOperatorIds(mobile);
  const charge_id = this.transactionId();

  const name = createTransactionDto.first_name || 'Guest User';
  const email = createTransactionDto.email || 'guest@example.com';

  createTransactionDto.tx_ref = this.transactionId();

  // Create initial transaction
  const transaction = new Transaction();
  transaction.tx_ref = createTransactionDto.tx_ref;
  transaction.amount = totalAmount;
  transaction.quantity = createTransactionDto.quantity || 1;
  transaction.mobile = mobile;
  transaction.currency = 'MWK';
  transaction.status = 'PENDING';
  transaction.escrow_status = 'HELD';
  transaction.escrow_held_at = new Date();
  transaction.organizer_id = createTransactionDto['organizer_id'] || createTransactionDto['organizerId'];
  transaction.event_id = createTransactionDto['event_id'] || createTransactionDto['eventId'];
  transaction.tier_id = createTransactionDto.tierId;

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
          amount: totalAmount,
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
      const transaction = await this.transactionRepo.findOne({ 
        where: { tx_ref: createTransactionDto.tx_ref } 
      });

      if (!transaction) {
        throw new NotFoundException("Transaction not found");
      }

      // ⭐ SAVE ALL PAYCHANGU IDENTIFIERS
      transaction.paychangu_charge_id = data.data.charge_id;
      transaction.paychangu_trans_id = data.data.trans_id;
      transaction.paychangu_ref_id = data.data.ref_id;
      
      // Keep status as PENDING until webhook confirms payment
      transaction.status = data.data.status.toUpperCase(); // "PENDING"
      
      // Save transaction charges
      transaction.charges = Number(data.data.transaction_charges?.amount || 0);
      transaction.net_amount = Number(transaction.amount) - Number(transaction.charges);

      await this.transactionRepo.save(transaction);

      return {
        statusCode: 200,
        message: 'Payment initiated successfully - Funds held in escrow',
        data: {
          ...data.data,
          tx_ref: transaction.tx_ref, // Return your internal reference
          escrow_status: transaction.escrow_status,
          net_amount: transaction.net_amount,
        },
      };
    } else {
      throw new Error(data.message || 'Payment initiation failed.');
    }
  } catch (error) {
    console.error('Error processing payment:', error.response?.data || error.message);
    throw new HttpException(
      error.response?.data?.message || 'Payment failed',
      HttpStatus.BAD_REQUEST,
    );
  }
}

  async getPaymentStatus(tx_ref: string): Promise<any> {
  const transaction = await this.transactionRepo.findOne({ where: { tx_ref } });
  
  if (!transaction) {
    throw new NotFoundException('Transaction not found');
  }

  if (!transaction.paychangu_charge_id) {
    throw new BadRequestException('PayChangu charge ID not found');
  }

  try {
    // ⭐ USE CORRECT ENDPOINT
    const response = await firstValueFrom(
      this.httpService.get(
        `https://api.paychangu.com/mobile-money/payments/${transaction.paychangu_charge_id}/verify`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
          },
        }
      ),
    );

    const data = response.data;
    
    if (data.status === 'success') {
      return {
        statusCode: 200,
        message: 'Payment status retrieved successfully.',
        data: {
          ...data.data,
          internal_tx_ref: transaction.tx_ref,
          escrow_status: transaction.escrow_status,
          escrow_held_at: transaction.escrow_held_at,
          escrow_release_date: transaction.escrow_release_date,
        },
      };
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error retrieving payment status:', error.response?.data || error.message);
    throw new HttpException(
      error.response?.data?.message || 'Error fetching status', 
      HttpStatus.BAD_REQUEST
    );
  }
}

  async verifyPayment(tx_ref: string): Promise<any> {
  // Find by YOUR tx_ref
  const transaction = await this.transactionRepo.findOne({ 
    where: { tx_ref } 
  });

  if (!transaction) {
    throw new NotFoundException('Transaction not found in database');
  }

  if (!transaction.paychangu_charge_id) {
    throw new BadRequestException(
      'PayChangu charge ID not found. Payment may not have been initialized properly.'
    );
  }

  try {
    // ⭐ USE THE CORRECT ENDPOINT WITH CHARGE_ID
    const response = await firstValueFrom(
      this.httpService.get(
        `https://api.paychangu.com/mobile-money/payments/${transaction.paychangu_charge_id}/verify`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
          },
        }
      ),
    );

    const data = response.data;

    if (data.status === 'success') {
      // Update transaction status based on PayChangu's response
      if (data.data?.status === 'completed' && transaction.status !== 'COMPLETED') {
        transaction.status = 'COMPLETED';
        transaction.completed_at = new Date();
        await this.transactionRepo.save(transaction);

        // Issue tickets
        await this.ticketsService.createBulk({
          eventId: transaction.event_id,
          tierId: transaction.tier_id,
          userId: transaction['user_id'] || null,
          quantity: transaction.quantity,
          transactionId: transaction.id
        });
      } else if (data.data?.status === 'failed') {
        transaction.status = 'FAILED';
        await this.transactionRepo.save(transaction);
      }

      return {
        statusCode: 200,
        message: transaction.status === 'COMPLETED' 
          ? 'Payment verified and tickets issued successfully'
          : 'Payment verification retrieved successfully',
        data: {
          ...data.data,
          internal_tx_ref: transaction.tx_ref,
          escrow_status: transaction.escrow_status,
        },
      };
    } else {
      throw new HttpException(
        data.message || 'Payment verification failed.', 
        HttpStatus.BAD_REQUEST
      );
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

  async findAll(): Promise<Transaction[]> {
    return await this.transactionRepo.find({
      relations: ['refunds']
    });
  }

  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.transactionRepo.findOne({
      where: { id },
      relations: ['refunds']
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction #${id} not found`);
    }
    return transaction;
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findOne(id);
    const updatedTransaction = this.transactionRepo.merge(transaction, updateTransactionDto);
    return await this.transactionRepo.save(updatedTransaction);
  }

  async remove(id: number): Promise<void> {
    const transaction = await this.findOne(id);
    await this.transactionRepo.remove(transaction);
  }
}
