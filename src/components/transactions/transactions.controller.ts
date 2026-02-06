import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InitialPayoutDto } from './dto/initial-payout.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  @Post('make-payment')
  @ApiOperation({
    summary: 'Process Transaction (PayChangu)',
    description: 'Initiate payment using PayChangu. Funds held in escrow. \n\n**Role: Buyer, Admin**'
  })
  @ApiResponse({ status: 201, description: 'Payment initiated successfully and held in escrow.' })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.processPayment(createTransactionDto,);
  }

  @Post('release-escrow/:transactionId')
  @ApiOperation({
    summary: 'Release Escrow',
    description: 'Release funds from escrow to organizer after event completion. \n\n**Role: Admin**'
  })
  @ApiResponse({ status: 200, description: 'Escrow funds released to organizer.' })
  releaseEscrow(@Param('transactionId') transactionId: string, @Body() body: { organizer_mobile: string }) {
    return this.transactionsService.releaseEscrow(+transactionId, body.organizer_mobile);
  }

  @Post('refund-escrow/:transactionId')
  @ApiOperation({
    summary: 'Refund from Escrow',
    description: 'Refund funds from escrow back to buyer. \n\n**Role: Admin**'
  })
  @ApiResponse({ status: 200, description: 'Escrow funds refunded.' })
  refundEscrow(@Param('transactionId') transactionId: string, @Body() body: { refund_amount: number }) {
    return this.transactionsService.refundEscrow(+transactionId, body.refund_amount);
  }

  @Post('cash-out')
  @ApiOperation({
    summary: 'Cash Out',
    description: 'Cashes out money to account. \n\n**Role: Admin**'
  })
  @ApiResponse({ status: 201, description: 'Successfully cashed out.' })
  initiatePayout(@Body() initialPayoutDto: InitialPayoutDto) {
    const { mobile, amount } = initialPayoutDto;
    return this.transactionsService.initiatePayout(mobile, String(amount));
  }

  @Get('status/:tx_ref')
  @ApiOperation({
    summary: 'Get Payment Status',
    description: 'Check status of a transaction on PayChangu including escrow status. \n\n**Role: Buyer, Organizer, Verifier, Admin, Auditor**'
  })
  @ApiOkResponse({ description: 'Status successfully fetched.' })
  getPaymentsStatus(@Param('tx_ref') tx_ref: string) {
    return this.transactionsService.getPaymentStatus(tx_ref);
  }

  @Get('verify/:tx_ref')
  @ApiOperation({
    summary: 'Verify Payment',
    description: 'Verify success of a transaction. \n\n**Role: Buyer, Admin**'
  })
  @ApiOkResponse({ description: 'Payment is successful.' })
  verifyPayment(@Param('tx_ref') tx_ref: string) {
    return this.transactionsService.verifyPayment(tx_ref);
  }

  @Get()
  @ApiOperation({
    summary: 'List Transactions',
    description: 'List all transactions in the system. \n\n**Role: Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'List of transactions.' })
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Transaction Details',
    description: 'Get details of a specific transaction. \n\n**Role: Buyer, Organizer, Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'Transaction details.' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id);
  }
}
