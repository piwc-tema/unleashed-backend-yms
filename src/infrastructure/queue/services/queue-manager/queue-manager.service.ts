import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../../../core/logger/logger/logger.service';
import { QueueJob } from '../../interfaces/queue-job/queue-job.interface';
import { QueueHealthService } from '../queue-health/queue-health.service';

export class QueueUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueueUnavailableError';
  }
}

@Injectable()
export class QueueManagerService {
  private queues: Map<string, Queue> = new Map();

  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
    private queueHealth: QueueHealthService,
  ) {
    this.loggerService.setDefaultContext(QueueManagerService.name);
    // Subscribe to Redis status changes
    this.queueHealth.onRedisStatusChange().subscribe((isAvailable) => {
      if (!isAvailable) {
        this.handleRedisUnavailable();
      }
    });
  }

  private handleRedisUnavailable() {
    // Clean up existing queue connections
    for (const [name, queue] of this.queues.entries()) {
      queue.close();
      this.queues.delete(name);
    }
  }

  async getQueue(queueName: string): Promise<Queue> {
    if (!this.queueHealth.isRedisHealthy()) {
      throw new QueueUnavailableError('Queue system is currently unavailable');
    }

    if (!this.queues.has(queueName)) {
      try {
        const queue = new Queue(queueName, {
          connection: this.configService.get('queue.redis.url'),
        });
        this.queues.set(queueName, queue);
      } catch (error) {
        this.loggerService.error(`Failed to create queue ${queueName}`, error);
        throw new Error('Failed to create queue');
      }
    }
    return this.queues.get(queueName);
  }

  async addJob(queueName: string, job: QueueJob) {
    if (!this.queueHealth.isRedisHealthy()) {
      this.loggerService.warn(
        `Cannot add job to queue ${queueName}: Queue system unavailable`,
      );
      throw new QueueUnavailableError(
        'Cannot add job: Queue system is currently unavailable',
      );
    }

    try {
      const queue = await this.getQueue(queueName);
      return await queue.add(job.name, job.data, {
        ...this.configService.get('queue.defaultSettings'),
        ...job.opts,
      });
    } catch (error) {
      if (error instanceof QueueUnavailableError) {
        throw error;
      }
      this.loggerService.error(
        `Failed to add job to queue ${queueName}`,
        error,
      );
      throw new Error('Failed to add job to queue');
    }
  }
}
