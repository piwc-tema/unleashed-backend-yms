import { Module } from '@nestjs/common';
import { QueueManagerService } from './services/queue-manager/queue-manager.service';
import { QueueProcessorService } from './services/queue-processor/queue-processor.service';
import { LoggerModule } from '../../core/logger/logger.module';
import { AppConfigModule } from '../../core/config/app-config/app-config.module';
import { QueueHealthService } from './services/queue-health/queue-health.service';

@Module({
  imports: [AppConfigModule, LoggerModule],
  providers: [QueueManagerService, QueueProcessorService, QueueHealthService],
  exports: [QueueManagerService, QueueProcessorService, QueueHealthService],
})
export class QueueModule {}
