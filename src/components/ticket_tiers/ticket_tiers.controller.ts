import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TicketTiersService } from './ticket_tiers.service';
import { CreateTicketTierDto } from './dto/create-ticket_tier.dto';
import { UpdateTicketTierDto } from './dto/update-ticket_tier.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('ticket-tiers')
@Controller('ticket-tiers')
export class TicketTiersController {
  constructor(private readonly ticketTiersService: TicketTiersService) { }

  @Post()
  @ApiOperation({ summary: 'Create Ticket Tier', description: 'Organizer adds a ticket tier (e.g., VIP, Regular) to an event.' })
  @ApiResponse({ status: 201, description: 'Ticket tier created.' })
  create(@Body() createTicketTierDto: CreateTicketTierDto) {
    return this.ticketTiersService.create(createTicketTierDto);
  }

  @Get()
  @ApiOperation({ summary: 'List Ticket Tiers', description: 'List all ticket tiers.' })
  @ApiResponse({ status: 200, description: 'List of ticket tiers.' })
  findAll() {
    return this.ticketTiersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Ticket Tier', description: 'Get details of a specific ticket tier.' })
  @ApiResponse({ status: 200, description: 'Ticket tier details.' })
  findOne(@Param('id') id: string) {
    return this.ticketTiersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Ticket Tier', description: 'Organizer updates ticket tier details.' })
  @ApiResponse({ status: 200, description: 'Ticket tier updated.' })
  update(@Param('id') id: string, @Body() updateTicketTierDto: UpdateTicketTierDto) {
    return this.ticketTiersService.update(id, updateTicketTierDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Ticket Tier', description: 'Organizer removes a ticket tier.' })
  @ApiResponse({ status: 200, description: 'Ticket tier deleted.' })
  remove(@Param('id') id: string) {
    return this.ticketTiersService.remove(id);
  }
}
