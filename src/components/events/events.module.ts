import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';

import { Organizer } from '../organizers/entities/organizer.entity';
import { UploadService } from 'src/services/cloudinary.service';


@Module({
  imports: [TypeOrmModule.forFeature([Event,Organizer]),
],
  controllers: [EventsController],
  providers: [EventsService, UploadService],
  exports: [EventsService,],
})
export class EventsModule { }
