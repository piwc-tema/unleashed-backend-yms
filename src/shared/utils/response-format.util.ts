// import { ApiProperty } from '@nestjs/swagger';
//
// export interface APIResponse<T> {
//
//   @ApiProperty({ description: 'HTTP status code' })
//   code: number;
//
//   @ApiProperty({ description: 'Response data', nullable: true })
//   data?: T;
//
//   @ApiProperty({ description: 'Error message', nullable: true })
//   error?: string | null;
// }
//
// export class ResponseFormat {
//   static success<T>(data: T): APIResponse<T> {
//     return {
//       code: 200,
//       data,
//     };
//   }
//
//   static error(error: string, code = 500): APIResponse<null> {
//     return {
//       code,
//       error,
//     };
//   }
//
//   static ok(): APIResponse<null> {
//     return {
//       code: 201,
//       data: null,
//     };
//   }
// }
