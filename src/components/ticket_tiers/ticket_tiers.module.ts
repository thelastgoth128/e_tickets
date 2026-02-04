import { Module } from '@nestjs/common';
import { TicketTiersService } from './ticket_tiers.service';
import { TicketTiersController } from './ticket_tiers.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketTier } from './entities/ticket_tier.entity';
import { Event } from '../events/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketTier, Event])],
  controllers: [TicketTiersController],
  providers: [TicketTiersService],
})
export class TicketTiersModule { }
