import { Module } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from '../config/logger.config';

@Module({
  imports: [WinstonModule.forRoot(loggerConfig)],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
