import {
  Inject,
  Injectable,
  LoggerService as NestLogger,
} from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class LoggerService implements NestLogger {
  private defaultContext: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  setDefaultContext(context: string) {
    this.defaultContext = context;
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context: context || this.defaultContext });
  }

  error(message: string, trace: string, context?: string) {
    this.logger.error(message, {
      trace,
      context: context || this.defaultContext,
    });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context: context || this.defaultContext });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context: context || this.defaultContext });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context: context || this.defaultContext });
  }
}
