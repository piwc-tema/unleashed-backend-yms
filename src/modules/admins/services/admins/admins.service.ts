import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/config/prisma/prisma/prisma.service';
import { LoggerService } from '../../../../core/logger/logger/logger.service';

@Injectable()
export class AdminsService {
  constructor(
    private prismaService: PrismaService,
    private loggerService: LoggerService,
  ) {
    this.loggerService.setDefaultContext('AdminsService');
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

  // async findAdminsByRole(role: string) {
  //   return this.prismaService.admin.findMany({ where: { role } });
  // }
}
