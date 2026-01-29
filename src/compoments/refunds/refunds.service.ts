import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateRefundDto } from './dto/update-refund.dto';
import { Refund } from './entities/refund.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class RefundsService {
  constructor(
    @InjectRepository(Refund)
    private readonly refundRepo: Repository<Refund>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) { }

  /**
   * Create a refund request
   * Buyer requests refund for a ticket purchase
   */
  async create(createRefundDto: CreateRefundDto) {
    const { transaction_id, reason, buyer_id, refund_amount } = createRefundDto;

    // Verify transaction exists
    const transaction = await this.transactionRepo.findOne({
      where: { id: transaction_id },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction #${transaction_id} not found`);
    }

    // Check if transaction is eligible for refund
    if (transaction.status !== 'COMPLETED') {
      throw new HttpException(
        'Transaction must be completed to request a refund',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (transaction.escrow_status === 'REFUNDED') {
      throw new HttpException(
        'This transaction has already been refunded',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check for existing refund requests
    const existingRefund = await this.refundRepo.findOne({
      where: {
        transaction_id,
        status: 'PENDING',
      },
    });

    if (existingRefund) {
      throw new HttpException(
        'A refund request for this transaction is already pending',
        HttpStatus.BAD_REQUEST,
      );
    }

    const refund = new Refund();
    refund.transaction_id = transaction_id;
    refund.buyer_id = buyer_id;
    refund.reason = reason;
    refund.refund_amount = refund_amount || transaction.net_amount;
    refund.status = 'PENDING';
    refund.requested_at = new Date();

    const savedRefund = await this.refundRepo.save(refund);

    return {
      statusCode: 201,
      message: 'Refund request submitted successfully',
      data: savedRefund,
    };
  }

  /**
   * List all refunds (Admin/Organizer)
   */
  findAll() {
    return this.refundRepo.find({
      relations: ['transaction'],
      order: {
        requested_at: 'DESC',
      },
    });
  }

  /**
   * Get specific refund details
   */
  async findOne(id: number) {
    const refund = await this.refundRepo.findOne({
      where: { id },
      relations: ['transaction'],
    });

    if (!refund) {
      throw new NotFoundException(`Refund #${id} not found`);
    }

    return refund;
  }

  /**
   * Process/Update refund request (Approve or Reject)
   * Admin approves or rejects refund request
   */
  async update(id: number, updateRefundDto: UpdateRefundDto) {
    const { status, admin_notes, processed_by } = updateRefundDto;

    const refund = await this.refundRepo.findOne({
      where: { id },
      relations: ['transaction'],
    });

    if (!refund) {
      throw new NotFoundException(`Refund #${id} not found`);
    }

    if (refund.status !== 'PENDING') {
      throw new HttpException(
        `Cannot update refund with status ${refund.status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate status
    if (!['APPROVED', 'REJECTED', 'COMPLETED'].includes(status)) {
      throw new HttpException(
        'Invalid status. Must be APPROVED, REJECTED, or COMPLETED',
        HttpStatus.BAD_REQUEST,
      );
    }

    refund.status = status;
    refund.admin_notes = admin_notes;
    refund.processed_by = processed_by;
    refund.processed_at = new Date();

    // If approved, update transaction escrow status and mark refund as completed
    if (status === 'APPROVED') {
      const transaction = refund.transaction;
      transaction.escrow_status = 'REFUNDED';
      await this.transactionRepo.save(transaction);

      refund.status = 'COMPLETED';
      refund.refunded_at = new Date();
    }

    const updatedRefund = await this.refundRepo.save(refund);

    return {
      statusCode: 200,
      message: `Refund ${status === 'APPROVED' ? 'approved and processed' : 'rejected'} successfully`,
      data: updatedRefund,
    };
  }

  /**
   * Delete refund record (Admin only)
   */
  async remove(id: number) {
    const refund = await this.refundRepo.findOne({ where: { id } });

    if (!refund) {
      throw new NotFoundException(`Refund #${id} not found`);
    }

    await this.refundRepo.remove(refund);

    return {
      statusCode: 200,
      message: 'Refund record deleted successfully',
    };
  }

  /**
   * Get refunds for a specific transaction
   */
  async getRefundsByTransaction(transaction_id: number) {
    return this.refundRepo.find({
      where: { transaction_id },
      order: {
        requested_at: 'DESC',
      },
    });
  }

  /**
   * Get refunds for a specific buyer
   */
  async getRefundsByBuyer(buyer_id: number) {
    return this.refundRepo.find({
      where: { buyer_id },
      relations: ['transaction'],
      order: {
        requested_at: 'DESC',
      },
    });
  }

  /**
   * Get summary of refund statistics
   */
  async getRefundSummary() {
    const total = await this.refundRepo.count();
    const pending = await this.refundRepo.count({ where: { status: 'PENDING' } });
    const approved = await this.refundRepo.count({ where: { status: 'COMPLETED' } });
    const rejected = await this.refundRepo.count({ where: { status: 'REJECTED' } });

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }
}
