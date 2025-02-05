import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LoggerService } from '../../../../core/logger/logger/logger.service';

@Injectable()
export class QueueManagerService {
  constructor(
    @InjectQueue('email-queue') private emailQueue: Queue,
    private loggerService: LoggerService,
  ) {}

  async addJob<T>(data: T, opts?: any) {
    try {
      const job = await this.emailQueue.add('send-email', data, opts);
      this.loggerService.log(`send-email Job ${job.id} added to queue`);
      return job;
    } catch (error) {
      this.loggerService.error('Failed to add job to queue', error);
      throw new Error('Failed to add job to queue');
    }
  }

  async getJobCounts() {
    return this.emailQueue.getJobCounts();
  }

  async cleanQueue() {
    await this.emailQueue.clean(0, 1000);
  }
}
