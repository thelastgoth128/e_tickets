import { Injectable } from '@nestjs/common';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { Repository } from 'typeorm';
import { Organizer, ApprovalStatus } from './entities/organizer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class OrganizersService {
  constructor(
    @InjectRepository(Organizer)
    private readonly organizerRepository: Repository<Organizer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async create(createOrganizerDto: CreateOrganizerDto) {
    // If we want to create an organizer for an existing user
    const user = await this.userRepository.findOne({ where: { user_id: createOrganizerDto.user.user_id } });
    if (!user) {
      throw new Error('User not found');
    }

    const organizer = this.organizerRepository.create({
      user: user,
      approval_status: ApprovalStatus.PENDING,
    });
    return await this.organizerRepository.save(organizer);
  }

  async findAll() {
    return await this.organizerRepository.find({ relations: ['user', 'events'] });
  }

  async findOne(id: string) {
    const organizer = await this.organizerRepository.findOne({
      where: { organizer_id: id },
      relations: ['user', 'events'],
    });
    if (!organizer) {
      throw new Error(`Organizer with ID ${id} not found`);
    }
    return organizer;
  }

  async update(id: string, updateOrganizerDto: UpdateOrganizerDto) {
    const organizer = await this.findOne(id);
    const updatedOrganizer = this.organizerRepository.merge(organizer, updateOrganizerDto as any);
    return await this.organizerRepository.save(updatedOrganizer);
  }

  async remove(id: string) {
    const organizer = await this.findOne(id);
    return await this.organizerRepository.remove(organizer);
  }
}
