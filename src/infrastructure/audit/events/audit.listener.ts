import { Injectable } from '@nestjs/common';
import { AuditService } from '../services/audit/audit.service';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditEvent } from './audit.event';
import { LoggerService } from '../../../core/logger/logger/logger.service';

@Injectable()
export class AuditEventListener {
  constructor(
    private readonly auditService: AuditService,
    private readonly loggerService: LoggerService,
  ) {}

  @OnEvent('audit.action')
  async handleAuditEvent(event: AuditEvent) {
    this.loggerService.log('Handling audit event');
    const { action, actor, resource, metadata } = event;
    await this.auditService.log({
      action,
      actorId: actor.id,
      actorType: actor.role || 'ANONYMOUS',
      resourceId: resource.id,
      resourceType: resource.type,
      metadata,
    });
  }
}
