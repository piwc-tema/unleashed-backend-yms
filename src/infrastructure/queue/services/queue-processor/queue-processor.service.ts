import { OnQueueEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { LoggerService } from '../../../../core/logger/logger/logger.service';
import { EmailService } from '../../../email/services/email/email.service';

@Processor('email-queue')
export class QueueProcessorService extends WorkerHost {
  constructor(
    private loggerService: LoggerService,
    private emailService: EmailService,
  ) {
    super();
    this.loggerService.setDefaultContext(QueueProcessorService.name);
  }

  async process(job: Job<any, any, string>): Promise<any> {
    try {
      this.loggerService.log(`Processing job ${job.id}`);
      // Add your job processing logic here
      const result = await this.processJobData(job.data);
      return result;
    } catch (error) {
      this.loggerService.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  }

  private async processJobData(data: any) {
    const { to, subject, templateName, context, attachments } = data;

    try {
      if (attachments?.content) {
        return await this.emailService.sendEmail(
          to,
          subject,
          templateName,
          context,
          attachments,
        );
      } else {
        return await this.emailService.sendEmail(
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
  }

  // Optional: custom event handlers
  @OnQueueEvent('completed')
  onCompleted(job: Job) {
    this.loggerService.log(`Job ${job.id} completed successfully`);
  }

  @OnQueueEvent('failed')
  onFailed(job: Job, error: Error) {
    this.loggerService.error(`Job ${job.id} failed:`, error.message);
  }
}
