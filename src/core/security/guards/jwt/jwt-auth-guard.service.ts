import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }
    try {
      const { sub: userId, role } = this.jwtService.verify(token);
      request['user'] = { userId, role };
      return true;
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return null;
    }
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      return null;
    }
    return token;
  }
}
