import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../../services/audit/audit.service';
import { Reflector } from '@nestjs/core';
import { AUDIT_ACTION_KEY } from '../../decorators/audit-action/audit-action.decorator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditEvent } from '../../events/audit.event';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const action = this.reflector.get<string>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );

    // if (!action) return next.handle();
    if (action[0] !== AUDIT_ACTION_KEY) return next.handle();

    const startTime = Date.now();
    const { ip, method, url, body, query } = request;
    const actor = request.formAccess?.accessBy || request.user;

    return next.handle().pipe(
      tap(async (response) => {
        const endTime = Date.now();
        this.eventEmitter.emit(
          AUDIT_ACTION_KEY,
          new AuditEvent(
            action[0],
            {
              id: actor?.id,
              role: actor?.role || 'ANONYMOUS',
            },
            {
              type: 'TODO: http',
              id: request.params?.formId || request.body?.formId || '',
            },
            {
              ip,
              method,
              url,
              body,
              query,
              response,
              resStatus: response?.statusCode || 200,
              duration: endTime - startTime,
            },
          ),
        );
      }),
    );
  }
}
