import { Module } from '@nestjs/common';
import { AdminsController } from './controllers/admins/admins.controller';
import { AdminsService } from './services/admins/admins.service';
import { PrismaModule } from '../../core/config/prisma/prisma.module';
import { LoggerModule } from '../../core/logger/logger.module';
import { SecurityModule } from '../../core/security/security.module';
import { EmailModule } from '../../infrastructure/email/email.module';

@Module({
  imports: [PrismaModule, LoggerModule, SecurityModule, EmailModule],
  providers: [AdminsService],
  exports: [AdminsService],
  controllers: [AdminsController],
})
export class AdminsModule {}
