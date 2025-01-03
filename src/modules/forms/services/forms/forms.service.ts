import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoggerService } from '../../../../core/logger/logger/logger.service';
import { PrismaService } from '../../../../core/config/prisma/prisma/prisma.service';
import { FormStatus } from '@prisma/client';
import { FormSectionType } from '../../enum/form-section-type';

@Injectable()
export class FormsService {
  constructor(
    private loggerService: LoggerService,
    private prismaService: PrismaService,
  ) {
    this.loggerService.setDefaultContext(FormsService.name);
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
      data: { status: FormStatus.SUBMITTED },
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
