import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { LoggerService } from '../../../../core/logger/logger/logger.service';
import { FormsService } from '../../services/forms/forms.service';
import { FormSectionType } from '../../enum/form-section-type';
import { FormOwner } from '../../decorators/form-owner/form-owner.decorator';
import { UpdateFormSectionDto } from '../../dtos/update-form.dto';
import { AccessedBy } from '../../decorators/access-by/access-by.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterFormDto } from '../../dtos/register-form.dto';

@Controller('forms')
export class FormsController {
  constructor(
    private loggerService: LoggerService,
    private formsService: FormsService,
  ) {
    this.loggerService.setDefaultContext(FormsController.name);
  }

  @Get()
  async findAll() {
    this.loggerService.log('Finding all forms');
    return this.formsService.findAll();
  }

  @Get(':formId')
  async findOne(@Param('formId') formId: string) {
    this.loggerService.log('Finding one form');
    return this.formsService.findOne(formId);
  }

  @Patch('section/:sectionType')
  async updateSection(
    @FormOwner() owner,
    @AccessedBy() accessedBy,
    @Param('sectionType') sectionType: FormSectionType,
    @Body() updateFormSectionDto: UpdateFormSectionDto,
  ) {
    // log form owner, accessedBy
    this.loggerService.log(
      `Form owner: ${owner.userId}:: Access by: ${accessedBy}`,
    );

    return this.formsService.updateFormSection(
      updateFormSectionDto.formId,
      sectionType,
      accessedBy,
      updateFormSectionDto.data,
    );
  }

  @Post('submit')
  async submit(@Body() body: any) {
    this.loggerService.log(`Submitting form ${body}`);
    return this.formsService.submit(body.formId);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a user and generate a form link' })
  @ApiResponse({ status: 200, description: 'Link generated successfully' })
  @ApiResponse({ status: 400, description: 'Email already registered' })
  async registerForm(@Body() dto: RegisterFormDto) {
    return this.formsService.registerUser(dto);
  }
}
