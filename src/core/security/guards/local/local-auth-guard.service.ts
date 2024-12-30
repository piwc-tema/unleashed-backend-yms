import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class LocalAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = await this.authService.validateUser(
      request.body.email,
      request.body.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    request.user = user;
    return true;
  }
}
