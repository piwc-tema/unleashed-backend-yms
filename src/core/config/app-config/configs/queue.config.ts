import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultSettings: {
    attempts: parseInt(process.env.QUEUE_RETRY_ATTEMPTS || '3'),
    backoff: {
      type: 'exponential',
      delay: parseInt(process.env.QUEUE_RETRY_DELAY || '1000'),
    },
  },
}));
