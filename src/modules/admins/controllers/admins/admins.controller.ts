import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AdminsService } from '../../services/admins/admins.service';
import { LoggerService } from '../../../../core/logger/logger/logger.service';
import { AuthService } from '../../../../core/security/auth/auth.service';
import { LocalAuthGuard } from '../../../../core/security/guards/local/local-auth-guard.service';
import { JwtAuthGuard } from '../../../../core/security/guards/jwt/jwt-auth-guard.service';
import { RolesGuard } from '../../../../core/security/guards/roles/roles.guard';
import { Roles } from '../../../../core/security/decorators/roles/roles.decorator';
import { Role } from '../../../../core/security/enums/roles.enum';

@Controller('admins')
export class AdminsController {
  constructor(
    private adminsService: AdminsService,
    private loggerService: LoggerService,
    private authService: AuthService,
  ) {
    this.loggerService.setDefaultContext('AdminsController');
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async signIn(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async signOut(@Body('refresh_token') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('register')
  async signUp(@Body() data: any) {
    return this.authService.createAdmin(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('resource')
  async getProtectedResource(@Request() req) {
    this.loggerService.log(`Protected resource accessed by user: ${req.user}`);
    return `Protected resource accessed by user: ${req.user.userId}`;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VIEWER)
  @Get('resource/admin')
  async getAdminResource(@Request() req) {
    this.loggerService.log(`Admin resource accessed by user: ${req.user}`);
    return `Admin resource accessed by user: ${req.user.userId}`;
  }
}
