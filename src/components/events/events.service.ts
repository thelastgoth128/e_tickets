import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventStatus } from './entities/event.entity';
import { Organizer } from '../organizers/entities/organizer.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Organizer)
    private readonly organizerrep: Repository<Organizer>,
  ) { }

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const organizer = await this.organizerrep.findOne({
      where: { organizer_id: createEventDto.organizerId },
    });
    if (!organizer) {
      throw new NotFoundException(`Organizer with ID ${createEventDto.organizerId} not found`);
    }
    const event = this.eventRepository.create({
      ...createEventDto,
      date_time: new Date(createEventDto.date),
      organizer: organizer, // Simple mapping for now
    });
    return await this.eventRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return await this.eventRepository.find({
      relations: ['organizer', 'ticketTiers'],
      where: { status: EventStatus.PUBLISHED },
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { event_id: id },
      relations: ['organizer', 'ticketTiers'],
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    const updatedEvent = this.eventRepository.merge(event, {
      ...updateEventDto,
      date_time: updateEventDto.date ? new Date(updateEventDto.date) : event.date_time,
    });
    return await this.eventRepository.save(updatedEvent);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }

  async publish(id: string): Promise<Event> {
    const event = await this.findOne(id);
    event.status = EventStatus.PUBLISHED;
    return await this.eventRepository.save(event);
  }

  async cancel(id: string): Promise<Event> {
    const event = await this.findOne(id);
    event.status = EventStatus.CANCELLED;
    // TODO: Trigger automatic refunds here
    return await this.eventRepository.save(event);
  }
}
