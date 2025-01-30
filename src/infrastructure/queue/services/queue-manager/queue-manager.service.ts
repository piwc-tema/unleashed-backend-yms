import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../../../core/logger/logger/logger.service';
import { QueueJob } from '../../interfaces/queue-job/queue-job.interface';

@Injectable()
export class QueueManagerService {
  private queues: Map<string, Queue> = new Map();

  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {
    this.loggerService.setDefaultContext(QueueManagerService.name);
  }

  async getQueue(queueName: string): Promise<Queue> {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, {
        connection: this.configService.get('queue.redis'),
      });
      this.queues.set(queueName, queue);
    }
    return this.queues.get(queueName);
  }

  async addJob(queueName: string, job: QueueJob) {
    try {
      const queue = await this.getQueue(queueName);
      return await queue.add(job.name, job.data, {
        ...this.configService.get('queue.defaultSettings'),
        ...job.opts,
      });
    } catch (error) {
      this.loggerService.error(
        `Failed to add job to queue ${queueName}`,
        error,
      );
      throw error;
    }
  }
}
