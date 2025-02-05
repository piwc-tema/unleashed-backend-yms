import { Module } from '@nestjs/common';
import { EmailService } from './services/email/email.service';
import { AppConfigModule } from '../../core/config/app-config/app-config.module';
import { LoggerModule } from '../../core/logger/logger.module';

@Module({
  imports: [AppConfigModule, LoggerModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
