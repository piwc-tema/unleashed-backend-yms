import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { FormsModule } from './modules/forms/forms.module';
import { AuditModule } from './infrastructure/audit/audit.module';
import { SecurityModule } from './core/security/security.module';
import { LoggerModule } from './core/logger/logger.module';
import { PrismaModule } from './core/config/prisma/prisma.module';
import { EmailModule } from './infrastructure/email/email.module';
import { LoggerService } from './core/logger/logger/logger.service';
import { AdminsModule } from './modules/admins/admins.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './core/filters/http-exception/http-exception.filter';
import { AppConfigModule } from './core/config/app-config/app-config.module';
@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    PrismaModule,
    AdminsModule,
    UsersModule,
    EmailModule,
    FormsModule,
    AuditModule,
    SecurityModule,
    LoggerModule,
    AdminsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
