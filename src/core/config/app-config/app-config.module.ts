import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env/env.validate';
import emailConfig from './configs/email.config';
import queueConfig from './configs/queue.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: ['.env.local', '.env'],
      load: [emailConfig, queueConfig],
    }),
  ],
})
export class AppConfigModule {}
