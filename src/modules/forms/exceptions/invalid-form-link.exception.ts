import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidFormLinkException extends HttpException {
  constructor() {
    super('This form link is invalid or has expired', HttpStatus.NOT_FOUND);
  }
}
