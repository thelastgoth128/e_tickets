import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';

import { Organizer } from '../organizers/entities/organizer.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Event,Organizer]),
],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule { }
