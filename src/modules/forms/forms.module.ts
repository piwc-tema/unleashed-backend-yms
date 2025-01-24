import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { FormsController } from './controllers/forms/forms.controller';
import { FormsService } from './services/forms/forms.service';
import { PrismaModule } from '../../core/config/prisma/prisma.module';
import { LoggerModule } from '../../core/logger/logger.module';
import { EmailModule } from '../../infrastructure/email/email.module';
import { FormLinkMiddleware } from './middlewares/form-link/form-link.middleware';
import { AccessMiddleware } from '../../core/security/middlewares/access/access.middleware';

@Module({
  imports: [PrismaModule, LoggerModule, EmailModule],
  controllers: [FormsController],
  providers: [FormsService],
  exports: [FormsService],
})
export class FormsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FormLinkMiddleware, AccessMiddleware).forRoutes(
      {
        path: 'forms/:formId',
        method: RequestMethod.GET,
      },
      {
        path: 'forms/section/:sectionType',
        method: RequestMethod.PATCH,
      },
    );
  }
}
