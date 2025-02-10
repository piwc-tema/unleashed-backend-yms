import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/config/prisma/prisma/prisma.service';
import { LoggerService } from '../../../../core/logger/logger/logger.service';
import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer';
import { EmailQueueService } from '../../../../infrastructure/queue/services/email-queue/email-queue.service';
import { EmailJobData } from '../../../../infrastructure/queue/interfaces/queue-job/queue-job.interface';

@Injectable()
export class AdminsService {
  constructor(
    private prismaService: PrismaService,
    private loggerService: LoggerService,
    private emailQueueService: EmailQueueService,
  ) {
    this.loggerService.setDefaultContext(AdminsService.name);
  }

  async findAdminByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async findAdminById(id: string) {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  async updateAdmin(id: string, data: any) {
    return this.prismaService.user.update({ where: { id }, data });
  }

  async deleteAdmin(id: string) {
    return this.prismaService.user.delete({ where: { id } });
  }

  async findAdmins() {
    return this.prismaService.user.findMany();
  }

  async getDashboardData({ status, page, limit, search }) {
    // convert page and limit to numbers
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    const skip = (page - 1) * limit;

    // Aggregate statistics
    const stats = await this.prismaService.form.groupBy({
      by: ['status'],
      _count: true,
    });

    // Fetch filtered and paginated forms
    const whereClause: any = {};
    if (status) whereClause.status = status.toUpperCase();
    if (search) {
      whereClause.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const forms = await this.prismaService.form.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        user: { select: { firstName: true, email: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Total forms count
    const totalCount = await this.prismaService.form.count({
      where: whereClause,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;

    return {
      stats,
      forms,
      meta: {
        totalCount,
        page,
        limit,
        totalPages,
        hasNextPage,
        nextPage,
        lastPage: Math.ceil(totalCount / limit),
      },
    };
  }

  // get list of all users based on provided input filters for roles
  async getUsers({ role, page = 1, limit = 10, search = '' }) {
    // Convert page and limit to numbers
    page = parseInt(String(page), 10) || 1;
    limit = parseInt(String(limit), 10) || 10;

    const skip = (page - 1) * limit;

    // Build the where clause
    const whereClause: any = {};
    if (role) whereClause.role = role.toUpperCase();
    if (search) {
      whereClause.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Fetch filtered and paginated users
    const [users, totalCount] = await Promise.all([
      this.prismaService.user.findMany({
        where: whereClause,
        skip,
        take: limit,
      }),
      this.prismaService.user.count({ where: whereClause }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;

    return {
      items: users,
      meta: {
        totalCount,
        page,
        limit,
        totalPages,
        hasNextPage,
        nextPage,
        lastPage: Math.ceil(totalCount / limit),
      },
    };
  }

  async getFormById(id: string) {
    return this.prismaService.form.findUnique({ where: { id } });
  }

  async updateForm(id: string, data: any) {
    return this.prismaService.form.update({ where: { id }, data });
  }

  async approveForm(id: string) {
    // check if status = 'SUBMITTED', if in progress, throw error
    const form = await this.prismaService.form.findUnique({ where: { id } });
    if (form.status !== 'SUBMITTED') {
      throw new Error('Form is not in SUBMITTED status');
    }

    // only approve if it's been submitted
    return this.prismaService.form.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  async deleteForm(id: string) {
    return this.prismaService.form.delete({ where: { id } });
  }

  async exportFormsToExcel({
    status,
    fromDate,
    toDate,
  }: {
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<Buffer> {
    const whereClause: any = {};
    if (status) whereClause.status = status.toUpperCase();
    if (fromDate && toDate) {
      whereClause.createdAt = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      };
    }

    const forms = await this.prismaService.form.findMany({
      where: whereClause,
      include: {
        user: { select: { firstName: true, email: true } },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Forms');

    // Add header row
    worksheet.addRow([
      'User Name',
      'Email',
      'Status',
      'Date Started',
      'Submission Date',
    ]);

    // Add data rows
    forms.forEach((form) => {
      worksheet.addRow([
        form.user.firstName,
        form.user.email,
        form.status,
        form.createdAt.toISOString(),
        form.submissionDate?.toISOString() || 'Not Submitted',
      ]);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      let maxLength = 10;
      column.eachCell({ includeEmpty: true }, (cell) => {
        if (cell.value) {
          maxLength = Math.max(maxLength, cell.value.toString().length);
        }
      });
      column.width = maxLength + 2;
    });

    // Write workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const emailData: EmailJobData = {
      to: '',
      subject: 'Forms Export',
      templateName: 'attachment-email',
      context: { siteName: 'YMS' },
      attachments: [
        {
          filename: 'forms.xlsx',
          content: Buffer.from(buffer) as Buffer,
        },
      ],
    };

    //send email with attachment
    // add email to queues
    await this.emailQueueService.queueEmail(emailData);

    return Buffer.from(buffer);
  }
}
