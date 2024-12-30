import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  fullName: string;

  @IsNotEmpty()
  @ApiProperty()
  dob: Date;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;
}
