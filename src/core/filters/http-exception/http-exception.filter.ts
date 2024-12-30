import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LoggerService } from '../../logger/logger/logger.service';
import * as process from 'process';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {
    this.logger.setDefaultContext(HttpExceptionFilter.name);
  }

  catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const errResponse = exception.getResponse();

    const errorStack = exception instanceof Error ? exception.stack : null;
    this.logger.error(`Error: ${exception}`, errorStack);

    const errorResponse = {
      code: status,
      data: null,
      error:
        exception instanceof HttpException
          ? typeof errResponse === 'string'
            ? errResponse
            : (errResponse as any)?.message || 'An error occurred'
          : 'Internal server error',
    };

    if (process.env.NODE_ENV !== 'production') {
      errorResponse['stack'] = errorStack;
    }

    response.status(status).json(errorResponse);
  }
}
