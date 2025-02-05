import { IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class EnvironmentVariables {
  @IsString()
  APP_NAME: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  RESET_DB: string;

  @IsString()
  SMTP_SERVICE: string;

  @IsString()
  SMTP_HOST: string;

  @IsString()
  SMTP_PORT: string;

  @IsString()
  SMTP_USERNAME: string;

  @IsString()
  SMTP_PASSWORD: string;

  @IsString()
  EMAIL_FROM: string;

  @IsString()
  TEST_EMAIL: string;

  @IsString()
  QUEUE_RETRY_ATTEMPTS: string;

  @IsString()
  QUEUE_RETRY_DELAY: string;

  @IsString()
  REDIS_HOST: string;

  @IsString()
  REDIS_PORT: string;

  @IsString()
  REDIS_PASSWORD: string;

  @IsString()
  LOGGING_ENABLED: string;

  @IsString()
  LOG_LEVELS: string;
}
