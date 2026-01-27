import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './compoments/users/users.module';
import { OrganizersModule } from './compoments/organizers/organizers.module';
import { EventsModule } from './compoments/events/events.module';
import { TicketTiersModule } from './compoments/ticket_tiers/ticket_tiers.module';
import { TicketsModule } from './compoments/tickets/tickets.module';
import { TransactionsModule } from './compoments/transactions/transactions.module';
import { RefundsModule } from './compoments/refunds/refunds.module';
import { WaitlistModule } from './compoments/waitlist/waitlist.module';
import { FeedbackModule } from './compoments/feedback/feedback.module';
import { NotificationsModule } from './compoments/notifications/notifications.module';
import { AuditLogModule } from './compoments/audit_log/audit_log.module';

@Module({
  imports: [UsersModule, OrganizersModule, EventsModule, TicketTiersModule, TicketsModule, TransactionsModule, RefundsModule, WaitlistModule, FeedbackModule, NotificationsModule, AuditLogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
