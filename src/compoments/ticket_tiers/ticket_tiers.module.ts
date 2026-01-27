import { Module } from '@nestjs/common';
import { TicketTiersService } from './ticket_tiers.service';
import { TicketTiersController } from './ticket_tiers.controller';

@Module({
  controllers: [TicketTiersController],
  providers: [TicketTiersService],
})
export class TicketTiersModule {}
