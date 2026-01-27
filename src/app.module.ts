import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './compoments/users/users.module';
import { OrganizersModule } from './compoments/organizers/organizers.module';

@Module({
  imports: [UsersModule, OrganizersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
