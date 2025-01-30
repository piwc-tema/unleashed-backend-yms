import { Injectable } from '@nestjs/common';
import { Worker, Processor, WorkerOptions } from 'bullmq';
import { LoggerService } from '../../../../core/logger/logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueueProcessorService {
  private workers: Map<string, Worker> = new Map();

  constructor(
    private loggerService: LoggerService,
    private configService: ConfigService,
  ) {
    this.loggerService.setDefaultContext(QueueProcessorService.name);
  }

  registerProcessor(
    queueName: string,
    processor: Processor,
    concurrency: number = 1,
  ) {
    const worker = new Worker(queueName, processor, {
      concurrency,
      connection: this.configService.get('queue.redis'),
    } as WorkerOptions);

    worker.on('completed', (job) => {
      this.loggerService.log(
        `Job ${job.id} in queue ${queueName} completed successfully`,
      );
    });

    worker.on('failed', (job, error) => {
      this.loggerService.error(
        `Job ${job?.id} in queue ${queueName} failed:`,
        error.message,
      );
    });

    this.workers.set(queueName, worker);
    return worker;
  }
}
