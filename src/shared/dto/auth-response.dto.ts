import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ description: 'User information' })
  user: {
    id: string;
    firstName: string | null;
    email: string;
    role: string;
  };

  @ApiProperty({ description: 'Access and refresh token information' })
  token: {
    access: {
      token: string;
      expires: string;
    };
    refresh: {
      token: string;
      expires: string;
    };
  };
}
