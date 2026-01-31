import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersrep: Repository<User>,
    //private jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;

    const exists = await this.usersrep.findOne({where: {email}});
    if (exists) {
      throw new Error('User already exists, please login');
    }
    createUserDto.role = UserRole.BUYER;
    const user = await this.usersrep.save(createUserDto);

    const payload = {
      userid: user.user_id,

    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
