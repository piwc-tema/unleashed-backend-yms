import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiProperty } from '@nestjs/swagger';
// import { APIResponse } from '../../../shared/utils/response-format.util';

// interface APIResponse<T> {
//   code: number;
//   data: T;
//   error: string | null;
// }

export class APIResponse<T> {
  @ApiProperty()
  code: number;

  @ApiProperty()
  data: T | null;

  @ApiProperty()
  error: string | null;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, APIResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<APIResponse<T>> {
    return next.handle().pipe(
      map(
        (data) =>
          ({
            code: context.switchToHttp().getResponse().statusCode,
            data: data || null,
            error: null,
      }) as APIResponse<T>),
    );
  }
}
