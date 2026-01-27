import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TicketTiersService } from './ticket_tiers.service';
import { CreateTicketTierDto } from './dto/create-ticket_tier.dto';
import { UpdateTicketTierDto } from './dto/update-ticket_tier.dto';

@Controller('ticket-tiers')
export class TicketTiersController {
  constructor(private readonly ticketTiersService: TicketTiersService) {}

  @Post()
  create(@Body() createTicketTierDto: CreateTicketTierDto) {
    return this.ticketTiersService.create(createTicketTierDto);
  }

  @Get()
  findAll() {
    return this.ticketTiersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketTiersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketTierDto: UpdateTicketTierDto) {
    return this.ticketTiersService.update(+id, updateTicketTierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketTiersService.remove(+id);
  }
}
