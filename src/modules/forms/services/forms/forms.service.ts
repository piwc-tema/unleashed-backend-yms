import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoggerService } from '../../../../core/logger/logger/logger.service';
import { PrismaService } from '../../../../core/config/prisma/prisma/prisma.service';
import { FormStatus } from '@prisma/client';
import { FormSectionType } from '../../enum/form-section-type';
import { RegisterUserDto } from '../../../users/dto/register-user.dto';
import generateRegistrationLink from '../../../../shared/utils/link-generator';
import { EmailJobData } from '../../../../infrastructure/queue/interfaces/queue-job/queue-job.interface';
import { EmailQueueService } from '../../../../infrastructure/queue/services/email-queue/email-queue.service';

@Injectable()
export class FormsService {
  constructor(
    private loggerService: LoggerService,
    private prismaService: PrismaService,
    private emailQueueService: EmailQueueService,
  ) {
    this.loggerService.setDefaultContext(FormsService.name);
  }

  async registerUser(dto: RegisterUserDto) {
    const existingUser: any = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      // get the form for the user
      const form = await this.findOneByUserId(existingUser.id);
      console.log('form\n', form);
      const registrationLink = generateRegistrationLink(form.id);
      this.loggerService.log(
        `Resending registration link (${registrationLink}) to ${dto.email}`,
      );
      const emailData: EmailJobData = {
        to: existingUser.email,
        subject: 'Welcome to Our YMS!',
        templateName: 'link-email',
        context: {
          name: existingUser.firstName,
          link: registrationLink,
        },
      };

      // add email to queues
      await this.emailQueueService.queueEmail(emailData);

      throw new ConflictException('Email already registered. Link resent.');
    }

    const newUser: any = await this.prismaService.user.create({
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

    const emailData: EmailJobData = {
      to: newUser.email,
      subject: 'Welcome to Our YMS!',
      templateName: 'link-email',
      context: {
        name: newUser.firstName,
        link: registrationLink,
      },
    };

    // add email to queues
    await this.emailQueueService.queueEmail(emailData);

    return { link: registrationLink, formId: newUser.form.id };
  }

  async findAll() {
    this.loggerService.log('Finding all forms');
    return this.prismaService.form.findMany({ include: { user: true } });
  }

  async findOne(id: string) {
    this.loggerService.log(`Finding one form: ${id}`);
    const form = await this.prismaService.form.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }
    return form;
  }

  async findOneByUserId(userId: string) {
    this.loggerService.log('Finding one form');
    return this.prismaService.form.findUnique({
      where: { userId },
    });
  }

  async updateFormSection(
    formId: string,
    sectionType: FormSectionType,
    updatedBy: string,
    data: Record<string, any>,
  ) {
    this.loggerService.log('Updating form section');

    const form = await this.findOne(formId);

    if (!form) {
      throw new Error('Form not found');
    }

    if (form.status === FormStatus.SUBMITTED) {
      throw new BadRequestException('Cannot update a submitted form');
    }

    // Validate the form section data
    await this.validateSection(sectionType, data);

    // Update the form section
    const updatedForm = this.prismaService.form.update({
      where: { id: formId },
      data: {
        [sectionType]: data,
      },
    });

    // Create form history record
    const changes = { prev: form[sectionType], curr: data };
    await this.prismaService.formHistory.create({
      data: {
        formId,
        updatedBy,
        changes: changes,
      },
    });

    return updatedForm;
  }

  async submit(formId: string) {
    this.loggerService.log(`Submitting form ${formId}`);

    const form = await this.prismaService.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new BadRequestException('Form not found');
    }

    if (
      form.status === FormStatus.SUBMITTED ||
      form.status === FormStatus.APPROVED
    ) {
      throw new ConflictException('This form has already been submitted');
    }

    const incompleteSections = [
      'personalDetails',
      'locationDetails',
      'professionalDetails',
      'spiritualDetails',
      'emergencyContact',
      'additionalInfo',
    ].filter((section) => !form[section]);

    if (incompleteSections.length > 0) {
      throw new BadRequestException(
        `Form is incomplete: ${incompleteSections.join(', ')}`,
      );
    }

    return this.prismaService.form.update({
      where: { id: formId },
      data: { status: FormStatus.SUBMITTED, submissionDate: new Date() },
    });
  }

  async validateSection(
    sectionType: FormSectionType,
    data: Record<string, any>,
  ) {
    // Add validation logic for each section type
    switch (sectionType) {
      case FormSectionType.PERSONAL_DETAILS:
        const { firstName, lastName, email, dateOfBirth, gender, phoneNumber } =
          data;
        if (
          !firstName ||
          !lastName ||
          !email ||
          !dateOfBirth ||
          !gender ||
          !phoneNumber
        ) {
          throw new BadRequestException(
            'Missing required personal details fields',
          );
        }
        break;
      // Add validation for other section types
    }

    return true;
  }
}
