import { Injectable } from '@nestjs/common';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { Repository } from 'typeorm';
import { Organizer } from './entities/organizer.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrganizersService {
  constructor(
    @InjectRepository(Organizer)
    private readonly organizerrep: Repository<Organizer>,
  ){}
  create(createOrganizerDto: CreateOrganizerDto) {
    return 'This action adds a new organizer';
  }

  async findAll() {
   return await this.organizerrep.find()
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
