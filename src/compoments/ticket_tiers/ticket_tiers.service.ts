import { Injectable } from '@nestjs/common';
import { CreateTicketTierDto } from './dto/create-ticket_tier.dto';
import { UpdateTicketTierDto } from './dto/update-ticket_tier.dto';

@Injectable()
export class TicketTiersService {
  create(createTicketTierDto: CreateTicketTierDto) {
    return 'This action adds a new ticketTier';
  }

  findAll() {
    return `This action returns all ticketTiers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ticketTier`;
  }

  update(id: number, updateTicketTierDto: UpdateTicketTierDto) {
    return `This action updates a #${id} ticketTier`;
  }

  remove(id: number) {
    return `This action removes a #${id} ticketTier`;
  }
}
