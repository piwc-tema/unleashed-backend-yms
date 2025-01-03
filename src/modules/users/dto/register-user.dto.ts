import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  firstName: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;
}
