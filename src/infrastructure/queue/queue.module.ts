import { Module } from '@nestjs/common';
import { QueueManagerService } from './services/queue-manager/queue-manager.service';
import { LoggerModule } from '../../core/logger/logger.module';
import { AppConfigModule } from '../../core/config/app-config/app-config.module';
import { QueueHealthService } from './services/queue-health/queue-health.service';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { EmailQueueService } from './services/email-queue/email-queue.service';
import { EmailModule } from '../email/email.module';
import { QueueProcessorService } from './services/queue-processor/queue-processor.service';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    EmailModule,
    BullModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('queue.redis.host'),
          port: configService.get('queue.redis.port'),
          password: configService.get('queue.redis.password'),
        },
        defaultJobOptions: configService.get('queue.defaultSettings'),
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'email-queue' }),
  ],
  providers: [
    QueueManagerService,
    QueueProcessorService,
    QueueHealthService,
    EmailQueueService,
  ],
  exports: [EmailQueueService],
})
export class QueueModule {}
