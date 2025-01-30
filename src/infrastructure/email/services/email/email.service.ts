import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../../../core/logger/logger/logger.service';
import { EmailConfig } from '../../interfaces/email-config';
import { Buffer } from 'buffer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();
  private mainTemplate: HandlebarsTemplateDelegate;
  private emailConfigData: EmailConfig;

  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {
    this.loggerService.setDefaultContext('EmailService');
    this.initializeTransporter();
    this.initializeTemplates();
  }

  private initializeTransporter() {
    this.emailConfigData = this.configService.get<EmailConfig>('email');
    if (!this.emailConfigData) {
      this.loggerService.error(
        'Email config not found. Check your environment variables.',
        'EmailService',
      );
      return;
    }
    this.transporter = nodemailer.createTransport(this.emailConfigData);
  }

  private initializeTemplates() {
    const mainTemplatePath = path.join(
      __dirname,
      '../../templates/layouts/main.hbs',
    );
    this.mainTemplate = handlebars.compile(
      fs.readFileSync(mainTemplatePath, 'utf-8'),
    );
    handlebars.registerPartial('layout', this.mainTemplate);

    // Pre-compile all email templates
    const templatesDir = path.join(__dirname, '../../templates');
    fs.readdirSync(templatesDir)
      .filter((file) => file.endsWith('.hbs'))
      .forEach((file) => {
        const templateName = path.basename(file, '.hbs');
        const templateSource = fs.readFileSync(
          path.join(templatesDir, file),
          'utf-8',
        );
        this.templates.set(templateName, handlebars.compile(templateSource));
      });
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    context: Record<string, any> = {},
    attachments?: { filename: string; content: Buffer }[],
  ) {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    const emailHtml = template(context);
    const html = this.mainTemplate({ body: emailHtml });

    try {
      await this.transporter.sendMail({
        from: this.emailConfigData.from,
        to: to || this.configService.get<string>('TEST_EMAIL'),
        subject,
        html,
        attachments,
      });
      this.loggerService.log('email sent to: ', to);
    } catch (e) {
      this.loggerService.error('Error sending email:', e);
    }
  }

  async sendEmailWithAttachment(
    to: string,
    subject: string,
    templateName: string,
    context: Record<string, any> = {},
    attachment?: Buffer,
    filename?: string,
  ) {
    if (attachment) {
      const attachments = [
        {
          filename: filename || 'attachment.xlsx',
          content: attachment,
        },
      ];
      console.log('attachments', attachments);
      return this.sendEmail(to, subject, templateName, context, attachments);
    }

    throw new Error('Attachment not found');
  }
}
