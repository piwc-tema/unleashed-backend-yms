import { Injectable } from '@nestjs/common';
import { QueueManagerService } from '../../../queue/services/queue-manager/queue-manager.service';
import { QueueProcessorService } from '../../../queue/services/queue-processor/queue-processor.service';
import { EmailService } from '../email/email.service';
import { LoggerService } from '../../../../core/logger/logger/logger.service';
import { Buffer } from 'buffer';

@Injectable()
export class EmailQueueService {
  private readonly QUEUE_NAME = 'email';

  constructor(
    private queueManager: QueueManagerService,
    private queueProcessor: QueueProcessorService,
    private emailService: EmailService,
    private loggerService: LoggerService,
  ) {
    this.setupProcessor();
  }

  private setupProcessor() {
    this.queueProcessor.registerProcessor(
      this.QUEUE_NAME,
      async (job) => {
        const { to, subject, templateName, context, attachments } = job.data;

        try {
          if (attachments?.content) {
            await this.emailService.sendEmail(
              to,
              subject,
              templateName,
              context,
              attachments,
            );
          } else {
            await this.emailService.sendEmail(
              to,
              subject,
              templateName,
              context,
            );
          }
        } catch (error) {
          this.loggerService.error('Failed to process email job:', error);
          throw error;
        }
      },
      5, // concurrency
    );
  }

  async queueEmail(emailData: {
    to: string;
    subject: string;
    templateName: string;
    context: Record<string, any>;
    attachments?: { filename: string; content: Buffer }[];
  }) {
    try {
      await this.queueManager.addJob(this.QUEUE_NAME, {
        name: 'send-email',
        data: emailData,
      });
    } catch (error) {
      this.loggerService.error('Failed to queue email:', error);
      throw error;
    }
  }
}
