import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users/users.controller';
import { UsersService } from './services/users/users.service';
import { PrismaService } from '../../core/config/prisma/prisma/prisma.service';
import { LoggerService } from '../../core/logger/logger/logger.service';
import { LoggerModule } from '../../core/logger/logger.module';
import { PrismaModule } from '../../core/config/prisma/prisma.module';
import { EmailModule } from '../../infrastructure/email/email.module';
import { FormsModule } from '../forms/forms.module';

@Module({
  imports: [PrismaModule, LoggerModule, EmailModule, FormsModule],
  providers: [UsersService, PrismaService, LoggerService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
