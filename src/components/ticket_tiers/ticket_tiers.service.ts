import { Injectable } from '@nestjs/common';
import { CreateTicketTierDto } from './dto/create-ticket_tier.dto';
import { UpdateTicketTierDto } from './dto/update-ticket_tier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketTier } from './entities/ticket_tier.entity';
import { Event } from '../events/entities/event.entity';

@Injectable()
export class TicketTiersService {
  constructor(
    @InjectRepository(TicketTier)
    private readonly ticketTierRepository: Repository<TicketTier>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) { }

  async create(createTicketTierDto: CreateTicketTierDto) {}
  //   const { eventId, ...rest } = createTicketTierDto;
  //   const event = await this.eventRepository.findOne({ where: { event_id: eventId } });
  //   if (!event) {
  //     throw new Error(`Event with ID ${eventId} not found`);
  //   }

  //   const ticketTier = this.ticketTierRepository.create({
  //     ...rest,
  //     tier_name: createTicketTierDto.name, // Mapping 'name' from DTO to 'tier_name' in Entity
  //     event,
  //   });
  //   return await this.ticketTierRepository.save(ticketTier);
  // }

  async findAll() {
    return await this.ticketTierRepository.find({ relations: ['event'] });
  }

  async findOne(id: string) {
    return await this.ticketTierRepository.findOne({
      where: { tier_id: id },
      relations: ['event'],
    });
  }

  async update(id: string, updateTicketTierDto: UpdateTicketTierDto) {
    const tier = await this.findOne(id);
    if (!tier) {
      throw new Error(`Ticket Tier with ID ${id} not found`);
    }

    const updatedTier = this.ticketTierRepository.merge(tier, {
      ...updateTicketTierDto,
      name: updateTicketTierDto.name || tier.name,
    });
    return await this.ticketTierRepository.save(updatedTier);
  }

  async remove(id: string) {
    const tier = await this.findOne(id);
    if (!tier) {
      throw new Error(`Ticket Tier with ID ${id} not found`);
    }
    return await this.ticketTierRepository.remove(tier);
  }

  async findAllByEvent(eventId: string) {
    return await this.ticketTierRepository.find({
      where: { event: { event_id: eventId } },
      relations: ['event'],
    });
  }
}
