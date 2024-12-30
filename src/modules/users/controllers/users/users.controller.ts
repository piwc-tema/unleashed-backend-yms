import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from '../../services/users/users.service';
import { RegisterUserDto } from '../../dto/register-user.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a user and generate a form link' })
  @ApiResponse({ status: 200, description: 'Link generated successfully' })
  @ApiResponse({ status: 400, description: 'Email already registered' })
  async registerUser(@Body() dto: RegisterUserDto) {
    return this.usersService.registerUser(dto);
  }
}
