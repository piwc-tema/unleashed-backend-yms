import { Module } from '@nestjs/common';
import { EmailService } from './services/email/email.service';
import { AppConfigModule } from '../../core/config/app-config/app-config.module';
import { LoggerModule } from '../../core/logger/logger.module';
import { EmailQueueService } from './services/email-queue/email-queue.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [AppConfigModule, LoggerModule, QueueModule],
  providers: [EmailService, EmailQueueService],
  exports: [EmailService, EmailQueueService],
})
export class EmailModule {}
