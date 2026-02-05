import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventStatus } from './entities/event.entity';
import { Organizer } from '../organizers/entities/organizer.entity';
import { UploadService } from 'src/services/cloudinary.service';
import { TicketTier } from '../ticket_tiers/entities/ticket_tier.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Organizer)
    private readonly organizerrep: Repository<Organizer>,
    private uploadService: UploadService,
    private readonly dataSource: DataSource,
  ) { }

  async create(createEventDto: Omit<CreateEventDto, 'image_url'>, file: Express.Multer.File): Promise<Event> {
    const image_url = await this.uploadService.uploadFile(file, 'events/images');
    const organizer = await this.organizerrep.findOne({
      where: { organizer_id: createEventDto.organizerId },
    });
    if (!organizer) {
      throw new NotFoundException(`Organizer with ID ${createEventDto.organizerId} not found`);
    }

    return await this.dataSource.transaction(async manager => {
      const event = manager.getRepository(Event).create({
        ...createEventDto,
        date_time: new Date(createEventDto.date),
        organizer,
        image_url,
      });

      await manager.getRepository(Event).save(event);

      const tiers = createEventDto.tiers.map(tierDto =>
        manager.getRepository(TicketTier).create({
          ...tierDto,
          event,
        }),
      );

      await manager.getRepository(TicketTier).save(tiers);

      // attach tiers to event object for return
      event.ticketTiers = tiers;
      return event;
    });
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
