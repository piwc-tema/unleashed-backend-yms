import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/config/prisma/prisma/prisma.service';
import { RegisterUserDto } from '../../dto/register-user.dto';
import generateRegistrationLink from '../../../../shared/utils/link-generator';
import { LoggerService } from '../../../../core/logger/logger/logger.service';
import { EmailService } from '../../../../infrastructure/email/services/email/email.service';
import { FormsService } from '../../../forms/services/forms/forms.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private loggerService: LoggerService,
    private emailService: EmailService,
    private formsService: FormsService,
  ) {
    this.loggerService.setDefaultContext('UsersService');
  }

  async registerUser(dto: RegisterUserDto) {
    const existingUser: any = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      // get the form for the user
      const form = await this.formsService.findOneByUserId(existingUser.id);
      console.log('form\n', form);
      const registrationLink = generateRegistrationLink(form.id);
      this.loggerService.log(
        `Resending registration link (${registrationLink}) to ${dto.email}`,
      );
      await this.emailService.sendEmail(
        '',
        'Welcome to Our YMS!',
        'link-email',
        {
          name: existingUser.fullName,
          link: registrationLink,
        },
      );

      throw new ConflictException('Email already registered. Link resent.');
    }

    const newUser: any = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        email: dto.email,
        form: {
          create: {}, // Create an empty form upon user creation
        },
      },
      include: {
        form: true, // Include the newly created form in the response
      },
    });

    const registrationLink = generateRegistrationLink(newUser.form.id);

    this.loggerService.log(
      `Registration link (${registrationLink}) sent to ${dto.email}`,
    );

    await this.emailService.sendEmail('', 'Welcome to Our YMS!', 'link-email', {
      name: newUser.fullName,
      link: registrationLink,
    });

    return { link: registrationLink };
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
