import { Module } from '@nestjs/common';
import { AuditService } from './services/audit/audit.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuditInterceptor } from './interceptors/audit/audit.interceptor';
import { AuditEventListener } from './events/audit.listener';
import { PrismaModule } from '../../core/config/prisma/prisma.module';
import { LoggerModule } from '../../core/logger/logger.module';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
  ],
  providers: [AuditService, AuditInterceptor, AuditEventListener],
  exports: [AuditService, AuditInterceptor],
})
export class AuditModule {}
