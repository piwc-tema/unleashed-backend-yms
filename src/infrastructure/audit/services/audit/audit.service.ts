import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/config/prisma/prisma/prisma.service';
import { LoggerService } from '../../../../core/logger/logger/logger.service';

@Injectable()
export class AuditService {
  constructor(
    private prismaService: PrismaService,
    private loggerService: LoggerService,
  ) {}

  async createAudit(data: any) {
    return this.prismaService.auditLog.create({ data });
  }

  async log(auditData: {
    action: string;
    actorId?: string;
    actorType: string;
    resourceType: string;
    resourceId?: string;
    metadata: Record<string, any>;
  }) {
    return this.prismaService.auditLog.create({
      data: {
        action: auditData.action,
        actorId: auditData.actorId,
        actorType: auditData.actorType,
        resourceType: auditData.resourceType,
        resourceId: auditData.resourceId,
        metadata: auditData.metadata,
        timestamp: new Date(),
      },
    });
  }

  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    actorId?: string;
    actorType?: string;
    action?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const {
      page = 1,
      limit = 10,
      actorId,
      actorType,
      action,
      resourceId,
      startDate,
      endDate,
    } = params;

    const where = {
      ...(actorId && { actorId }),
      ...(actorType && { actorType }),
      ...(action && { action }),
      ...(resourceId && { resourceId }),
      ...(startDate &&
        endDate && {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        }),
    };

    const [logs, total] = await Promise.all([
      this.prismaService.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          actor: true,
        },
      }),
      this.prismaService.auditLog.count({ where }),
    ]);

    return {
      items: logs,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
