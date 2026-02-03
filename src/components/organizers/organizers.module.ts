import { Module } from '@nestjs/common';
import { OrganizersService } from './organizers.service';
import { OrganizersController } from './organizers.controller';
import { Organizer } from './entities/organizer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([Organizer,User]),UsersModule
    ],
  controllers: [OrganizersController],
  providers: [OrganizersService],
})
export class OrganizersModule {}
