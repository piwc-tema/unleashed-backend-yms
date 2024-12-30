import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/config/prisma/prisma/prisma.service';
import { RegisterUserDto } from '../../dto/register-user.dto';
import generateRegistrationLink from '../../../../shared/utils/link-generator';
import { LoggerService } from '../../../../core/logger/logger/logger.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private loggerService: LoggerService,
  ) {
    this.loggerService.setDefaultContext('UsersService');
  }

  async registerUser(dto: RegisterUserDto) {
    const existingUser: any = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      const registrationLink = generateRegistrationLink(existingUser.id);
      this.loggerService.log(
        `Resending registration link (${registrationLink}) to ${dto.email}`,
      );
      // Optionally send an email here
      throw new ConflictException('Email already registered. Link resent.');
    }

    const newUser: any = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        dob: new Date(dto.dob),
        email: dto.email,
        registrationLink: generateRegistrationLink(),
      },
    });

    return { link: newUser.registrationLink };
  }

  async createUser(data: any) {
    return this.prisma.user.create({ data });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateUser(id: string, data: any) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async findUsers() {
    return this.prisma.user.findMany();
  }
}
