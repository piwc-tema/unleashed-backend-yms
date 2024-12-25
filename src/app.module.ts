import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './config/logger.config';
import { LoggerService } from './services/logger/logger.service';

@Module({
  imports: [WinstonModule.forRoot(loggerConfig)],
  controllers: [AppController],
  providers: [AppService, LoggerService],
})
export class AppModule {}
