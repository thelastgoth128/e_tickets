import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './components/users/users.module';
import { OrganizersModule } from './components/organizers/organizers.module';
import { EventsModule } from './components/events/events.module';
import { TicketTiersModule } from './components/ticket_tiers/ticket_tiers.module';
import { TicketsModule } from './components/tickets/tickets.module';
import { TransactionsModule } from './components/transactions/transactions.module';
import { RefundsModule } from './components/refunds/refunds.module';
import { WaitlistModule } from './components/waitlist/waitlist.module';
import { FeedbackModule } from './components/feedback/feedback.module';
import { NotificationsModule } from './components/notifications/notifications.module';
import { AuditLogModule } from './components/audit_log/audit_log.module';
import { AuthModule } from './components/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      useFactory: async (configService : ConfigService) => ({
        type: 'postgres',
        url:configService.get<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Auto-create tables (use cautiously in prod)
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    OrganizersModule,
    EventsModule,
    TicketTiersModule,
    TicketsModule,
    TransactionsModule,
    RefundsModule,
    WaitlistModule,
    FeedbackModule,
    NotificationsModule,
    AuditLogModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
