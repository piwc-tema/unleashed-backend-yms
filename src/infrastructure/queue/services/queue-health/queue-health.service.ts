import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Subject } from 'rxjs';
import { LoggerService } from '../../../../core/logger/logger/logger.service';

@Injectable()
export class QueueHealthService implements OnModuleInit {
  private redis: Redis;
  private isRedisAvailable = false;
  private healthCheckInterval: NodeJS.Timeout;
  private readonly redisStatusChange = new Subject<boolean>();

  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {
    this.loggerService.setDefaultContext(QueueHealthService.name);
  }

  async onModuleInit() {
    this.initializeRedisConnection();
    this.startHealthCheck();
  }

  private initializeRedisConnection() {
    this.redis = new Redis({
      host: this.configService.get('queue.redis.host'),
      port: this.configService.get('queue.redis.port'),
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
      },
    });

    this.redis.on('error', (error) => {
      this.loggerService.error('Redis connection error:', error.message);
      this.setRedisStatus(false);
    });

    this.redis.on('connect', () => {
      this.loggerService.log('Redis connected');
      this.setRedisStatus(true);
    });
  }

  private startHealthCheck() {
    const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.redis.ping();
        this.setRedisStatus(true);
      } catch (error) {
        this.loggerService.error('Redis health check failed:', error);
        this.setRedisStatus(false);
      }
    }, HEALTH_CHECK_INTERVAL);
  }

  private setRedisStatus(status: boolean) {
    if (this.isRedisAvailable !== status) {
      this.isRedisAvailable = status;
      this.redisStatusChange.next(status);
      this.loggerService.log(`Redis availability changed to: ${status}`);
    }
  }

  onRedisStatusChange() {
    return this.redisStatusChange.asObservable();
  }

  isRedisHealthy(): boolean {
    return this.isRedisAvailable;
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }
}
