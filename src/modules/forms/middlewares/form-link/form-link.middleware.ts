import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { FormsService } from '../../services/forms/forms.service';
import { InvalidFormLinkException } from '../../exceptions/invalid-form-link.exception';
import { FormStatus, Prisma } from '@prisma/client';

@Injectable()
export class FormLinkMiddleware implements NestMiddleware {
  constructor(private formService: FormsService) {}

  async use(req: any, res: any, next: () => void) {
    try {
      const formId = req.body.formId || req.params.formId || req.query.formId;

      if (!formId) {
        throw new Error('No formId provided');
      }

      const form = await this.formService.findOne(formId);

      if (!form || !form.user) {
        throw new InvalidFormLinkException();
      }

      if (form.status === FormStatus.SUBMITTED) {
        throw new HttpException(
          'This form has already been submitted',
          HttpStatus.FORBIDDEN,
        );
      }

      req['formOwner'] = { userId: form.user.id, email: form.user.email };
      next();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InvalidFormLinkException();
      }
      throw error;
    }
  }
}
