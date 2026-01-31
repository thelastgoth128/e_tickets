import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { UpdateWaitlistDto } from './dto/update-waitlist.dto';
import { Waitlist } from './entities/waitlist.entity';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(Waitlist)
    private readonly waitlistRepository: Repository<Waitlist>,
  ) { }

  async create(createWaitlistDto: CreateWaitlistDto): Promise<Waitlist> {
    const waitlist = this.waitlistRepository.create({
      ...createWaitlistDto,
      event: { event_id: createWaitlistDto.eventId } as any,
      user: { user_id: createWaitlistDto.userId } as any,
    });
    return await this.waitlistRepository.save(waitlist);
  }

  async findAll(): Promise<Waitlist[]> {
    return await this.waitlistRepository.find({
      relations: ['event', 'user'],
      order: { joined_at: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Waitlist> {
    const waitlist = await this.waitlistRepository.findOne({
      where: { waitlist_id: id },
      relations: ['event', 'user'],
    });
    if (!waitlist) {
      throw new NotFoundException(`Waitlist entry with ID ${id} not found`);
    }
    return waitlist;
  }

  async findByEvent(eventId: string): Promise<Waitlist[]> {
    return await this.waitlistRepository.find({
      where: { event: { event_id: eventId } as any },
      relations: ['user'],
      order: { joined_at: 'ASC' },
    });
  }

  async update(id: string, updateWaitlistDto: UpdateWaitlistDto): Promise<Waitlist> {
    const waitlist = await this.findOne(id);
    const updatedWaitlist = this.waitlistRepository.merge(waitlist, updateWaitlistDto as any);
    return await this.waitlistRepository.save(updatedWaitlist);
  }

  async remove(id: string): Promise<void> {
    const waitlist = await this.findOne(id);
    await this.waitlistRepository.remove(waitlist);
  }
}
