import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminsService } from '../../services/admins/admins.service';
import { LoggerService } from '../../../../core/logger/logger/logger.service';
import { AuthService } from '../../../../core/security/auth/auth.service';
import { LocalAuthGuard } from '../../../../core/security/guards/local/local-auth-guard.service';
import { JwtAuthGuard } from '../../../../core/security/guards/jwt/jwt-auth-guard.service';
import { RolesGuard } from '../../../../core/security/guards/roles/roles.guard';
import { Roles } from '../../../../core/security/decorators/roles/roles.decorator';
import { Role } from '../../../../core/security/enums/roles.enum';
import { Response } from 'express';
import { AuditInterceptor } from '../../../../infrastructure/audit/interceptors/audit/audit.interceptor';
import {
  AUDIT_ACTION_KEY,
  AuditAction,
} from '../../../../infrastructure/audit/decorators/audit-action/audit-action.decorator';
import { AuditService } from '../../../../infrastructure/audit/services/audit/audit.service';
import { AuthResponseDto } from '../../../../shared/dto/auth-response.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('admins')
export class AdminsController {
  constructor(
    private adminsService: AdminsService,
    private loggerService: LoggerService,
    private authService: AuthService,
    private auditService: AuditService,
  ) {
    this.loggerService.setDefaultContext(AdminsController.name);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @UseInterceptors(AuditInterceptor)
  @AuditAction(AUDIT_ACTION_KEY)
  @ApiOkResponse({
    description: 'Successful login',
    type: AuthResponseDto,
  })
  async signIn(@Request() req): Promise<{
    user: any;
    token: {
      access: { expires: Date; token: string };
      refresh: { expires: Date; token: string };
    };
  }> {
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

  // update user's role
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('role')
  async updateUserRole(@Request() req, @Body() data: any) {
    return this.authService.updateUserRole(data.userId, data.role);
  }

  @Get('dashboard')
  async getDashboard(
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    return await this.adminsService.getDashboardData({
      status,
      page,
      limit,
      search,
    });
  }

  // get list of all user with filters for role
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN, Role.VIEWER, Role.EDITOR)
  @Get('users')
  async getUsers(
    @Query('role') role?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    return this.adminsService.getUsers({ role, page, limit, search });
  }

  // GET /admins/forms/export
  @Get('/forms/export')
  async exportFormsToExcel(
    @Query('status') status: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Res() res: Response,
  ) {
    const fileBuffer = await this.adminsService.exportFormsToExcel({
      status,
      fromDate,
      toDate,
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=forms.xlsx');
    return res.send(fileBuffer);
  }

  // GET /admins/forms/:id
  @Get('forms/:id')
  async getForm(@Request() req) {
    return this.adminsService.getFormById(req.params.id);
  }

  // PATCH /admins/forms/:id
  @Patch('forms/:id')
  async updateForm(@Request() req, @Body() data: any) {
    return this.adminsService.updateForm(req.params.id, data);
  }

  // DELETE /admins/forms/:id
  @Delete('forms/:id')
  async deleteForm(@Request() req) {
    return this.adminsService.deleteForm(req.params.id);
  }

  // PATCH /admins/forms/:id/approve
  @Patch('forms/:id/approve')
  async approveForm(@Request() req) {
    return this.adminsService.approveForm(req.params.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('audit-logs')
  async getAuditLogs(@Query() query) {
    return this.auditService.getAuditLogs(query);
  }
}
