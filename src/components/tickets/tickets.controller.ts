import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  @Post('purchase')
  @ApiOperation({
    summary: 'Purchase Ticket',
    description: 'Purchase a ticket for an event. Generates a unique QR code. \n\n**Role: Buyer, Admin**'
  })
  @ApiResponse({ status: 201, description: 'Ticket purchased successfully.' })
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Post('validate')
  @ApiOperation({
    summary: 'Validate Ticket (Gate Entry)',
    description: 'Validate a ticket QR code for entry. Marks the ticket as redeemed. \n\n**Role: Verifier, Admin**'
  })
  @ApiResponse({ status: 200, description: 'Ticket is valid and marked as redeemed.' })
  @ApiResponse({ status: 400, description: 'Ticket invalid or already used.' })
  validate(@Body() body: { qrCode: string }) {
    return this.ticketsService.validateTicket(body.qrCode);
  }

  @Get('qr/:qrCode')
  @ApiOperation({
    summary: 'Get QR Image Data URL',
    description: 'Returns a base64 Data URL for the provided QR code string. \n\n**Role: Buyer, Organizer, Verifier, Admin**'
  })
  @ApiResponse({ status: 200, description: 'QR code image data.' })
  async getQRCode(@Param('qrCode') qrCode: string) {
    const dataURL = await this.ticketsService.generateQRDataURL(qrCode);
    return { dataURL };
  }

  @Get()
  @ApiOperation({
    summary: 'List Tickets',
    description: 'List all tickets in the system. \n\n**Role: Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'List of tickets.' })
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Ticket Details',
    description: 'Get details of a specific ticket. \n\n**Role: Buyer, Organizer, Verifier, Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'Ticket details.' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update Ticket',
    description: 'Update ticket details or status. \n\n**Role: Admin**'
  })
  @ApiResponse({ status: 200, description: 'Ticket updated.' })
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Ticket',
    description: 'Remove a ticket from the system. \n\n**Role: Admin**'
  })
  @ApiResponse({ status: 200, description: 'Ticket deleted.' })
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
