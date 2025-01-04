import { Module } from '@nestjs/common';
import { AuditService } from './services/audit/audit.service';

@Module({
  providers: [AuditService],
})
export class AuditModule {}
