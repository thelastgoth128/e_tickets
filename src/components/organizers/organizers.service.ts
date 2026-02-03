import { Injectable } from '@nestjs/common';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { Repository } from 'typeorm';
import { Organizer } from './entities/organizer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class OrganizersService {
  constructor(
    @InjectRepository(User)
    private readonly userrep: Repository<User>
  ){}
  create(createOrganizerDto: CreateOrganizerDto) {
    return 'This action adds a new organizer';
  }

  async findAll() {
    return await this.userrep.find({where: {role: UserRole.ORGANIZER},relations:['organizer']});
  }

  findOne(id: number) {
    return `This action returns a #${id} organizer`;
  }

  update(id: number, updateOrganizerDto: UpdateOrganizerDto) {
    return `This action updates a #${id} organizer`;
  }

  remove(id: number) {
    return `This action removes a #${id} organizer`;
  }
}
