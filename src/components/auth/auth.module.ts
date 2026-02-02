import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from './guards/authGuard';


@Module({
  imports: [
    UsersModule,UsersModule,
    JwtModule.register({
      global:true,
      secret:process.env.JWT_SECRET || 'secret',
      signOptions:{ expiresIn: '1d'}
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,{
    provide:APP_GUARD,
    useClass:AuthGuard
  }],
})
export class AuthModule { }
