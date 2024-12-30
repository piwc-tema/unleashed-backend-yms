import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiTags('greetings')
  @ApiResponse({ status: 201, description: 'Create an item' })
  getHello(): string {
    return this.appService.getHello();
  }
}
