import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'audit.action';
export const AuditAction = (...args: string[]) =>
  SetMetadata(AUDIT_ACTION_KEY, args);
