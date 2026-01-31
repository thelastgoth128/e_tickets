import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateRefundDto } from './dto/update-refund.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('refunds')
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) { }

  @Post()
  @ApiOperation({
    summary: 'Request Refund',
    description: 'Buyer requests a refund using a transaction ID. \n\n**Role: Buyer**'
  })
  @ApiResponse({ status: 201, description: 'Refund request submitted.' })
  create(@Body() createRefundDto: CreateRefundDto) {
    return this.refundsService.create(createRefundDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List Refunds',
    description: 'List all refund requests in the system. \n\n**Role: Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'List of refunds.' })
  findAll() {
    return this.refundsService.findAll();
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Refund Summary',
    description: 'Get refund statistics and summary. \n\n**Role: Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'Refund summary data.' })
  getSummary() {
    return this.refundsService.getRefundSummary();
  }

  @Get('transaction/:transaction_id')
  @ApiOperation({
    summary: 'Get Refunds by Transaction',
    description: 'Get all refunds (requests and processed) for a specific transaction. \n\n**Role: Buyer, Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'List of refunds for transaction.' })
  getByTransaction(@Param('transaction_id') transaction_id: string) {
    return this.refundsService.getRefundsByTransaction(+transaction_id);
  }

  @Get('buyer/:buyer_id')
  @ApiOperation({
    summary: 'Get Refunds by Buyer',
    description: 'Get all refunds requested by a specific buyer. \n\n**Role: Buyer, Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'List of refunds for buyer.' })
  getByBuyer(@Param('buyer_id') buyer_id: string) {
    return this.refundsService.getRefundsByBuyer(+buyer_id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Refund Details',
    description: 'Get details of a specific refund request. \n\n**Role: Buyer, Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'Refund details.' })
  findOne(@Param('id') id: string) {
    return this.refundsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Process Refund',
    description: 'Approve or reject a refund request. \n\n**Role: Admin**'
  })
  @ApiResponse({ status: 200, description: 'Refund status updated.' })
  update(@Param('id') id: string, @Body() updateRefundDto: UpdateRefundDto) {
    return this.refundsService.update(+id, updateRefundDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Refund',
    description: 'Remove a refund record from the system. \n\n**Role: Admin**'
  })
  @ApiResponse({ status: 200, description: 'Refund deleted.' })
  remove(@Param('id') id: string) {
    return this.refundsService.remove(+id);
  }
}
