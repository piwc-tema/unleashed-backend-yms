export class AuditEvent {
  constructor(
    public readonly action: string,
    public readonly actor?: { id: string; role: string },
    public readonly resource?: { type: string; id: string },
    public readonly metadata?: Record<string, any>,
  ) {}
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}
