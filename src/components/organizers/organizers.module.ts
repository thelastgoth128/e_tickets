import { Module } from '@nestjs/common';
import { OrganizersService } from './organizers.service';
import { OrganizersController } from './organizers.controller';
import { Organizer } from './entities/organizer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
      TypeOrmModule.forFeature([Organizer]),
    ],
  controllers: [OrganizersController],
  providers: [OrganizersService],
})
export class OrganizersModule {}
