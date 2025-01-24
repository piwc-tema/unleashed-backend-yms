import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/config/prisma/prisma/prisma.service';
import { LoggerService } from '../../../../core/logger/logger/logger.service';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private loggerService: LoggerService,
  ) {
    this.loggerService.setDefaultContext('UsersService');
  }

  async createUser(data: any) {
    return this.prismaService.user.create({ data });
  }

  async findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async findUserById(id: string) {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  async updateUser(id: string, data: any) {
    return this.prismaService.user.update({ where: { id }, data });
  }

  async deleteUser(id: string) {
    return this.prismaService.user.delete({ where: { id } });
  }

  async findUsers() {
    return this.prismaService.user.findMany();
  }
}
