import { Module } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt/jwt-auth-guard.service';
import { LocalAuthGuard } from './guards/local/local-auth-guard.service';
import { RolesGuard } from './guards/roles/roles.guard';
import { LoggerModule } from '../logger/logger.module';
import { PrismaModule } from '../config/prisma/prisma.module';
import { EmailModule } from '../../infrastructure/email/email.module';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secret',
    }),
    EmailModule,
  ],
  providers: [AuthService, JwtAuthGuard, LocalAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, LocalAuthGuard, RolesGuard],
})
export class SecurityModule {}
