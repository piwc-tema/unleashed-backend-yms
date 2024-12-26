import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './modules/admin/admin.module';
import { UsersModule } from './modules/users/users.module';
import { FormsModule } from './modules/forms/forms.module';
import { AuditModule } from './infrastructure/audit/audit.module';
import { SecurityModule } from './core/security/security.module';
import { LoggerModule } from './core/logger/logger.module';
import { PrismaModule } from './core/config/prisma/prisma.module';
import { EmailModule } from './infrastructure/email/email.module';
import { LoggerService } from './core/logger/logger/logger.service';
@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    AdminModule,
    UsersModule,
    EmailModule,
    FormsModule,
    AuditModule,
    SecurityModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService],
})
export class AppModule {}
