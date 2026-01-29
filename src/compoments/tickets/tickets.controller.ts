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
  @ApiOperation({ summary: 'Purchase Ticket', description: 'Buyer purchases a ticket. Generates a QR code.' })
  @ApiResponse({ status: 201, description: 'Ticket purchased successfully.' })
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate Ticket (Gate Entry)', description: 'Verifier scans a QR code to validate entry.' })
  @ApiResponse({ status: 200, description: 'Ticket is valid.' })
  @ApiResponse({ status: 400, description: 'Ticket invalid or already used.' })
  validate(@Body() body: { ticketId: string; qrCode: string }) {
    // Mock validation logic placeholder
    return { status: 'valid' };
  }

  @Get()
  @ApiOperation({ summary: 'List Tickets', description: 'List all tickets (Admin/Organizer).' })
  @ApiResponse({ status: 200, description: 'List of tickets.' })
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get('my-tickets/:userId')
  @ApiOperation({ summary: 'My Tickets', description: 'List tickets owned by a specific user.' })
  @ApiResponse({ status: 200, description: 'User tickets.' })
  findMyTickets(@Param('userId') userId: string) {
    return this.ticketsService.findAll(); // simplified for now
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Ticket Details', description: 'Get details of a specific ticket.' })
  @ApiResponse({ status: 200, description: 'Ticket details.' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Ticket', description: 'Update ticket status.' })
  @ApiResponse({ status: 200, description: 'Ticket updated.' })
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(+id, updateTicketDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Ticket', description: 'Remove a ticket. Admin only.' })
  @ApiResponse({ status: 200, description: 'Ticket deleted.' })
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(+id);
  }
}
