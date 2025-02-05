import { Injectable } from '@nestjs/common';
import { QueueManagerService } from '../queue-manager/queue-manager.service';
import { EmailService } from '../../../email/services/email/email.service';
import { LoggerService } from '../../../../core/logger/logger/logger.service';
import { Buffer } from 'buffer';

@Injectable()
export class EmailQueueService {
  constructor(
    private queueManager: QueueManagerService,
    private emailService: EmailService,
    private loggerService: LoggerService,
  ) {
    this.loggerService.setDefaultContext(EmailQueueService.name);
  }

  async queueEmail(emailData: {
    to: string;
    subject: string;
    templateName: string;
    context: Record<string, any>;
    attachments?: { filename: string; content: Buffer }[];
  }) {
    try {
      await this.queueManager.addJob(emailData);
    } catch (error) {
      this.loggerService.warn(
        'Email queuing skipped: Queue system unavailable',
      );
      // ToDo: store the failed email in your database
      // await this.storePendingEmail(emailData);
      throw error;
    }
  }
}
