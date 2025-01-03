import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { extractTokenFromHeader } from '../../guards/jwt/jwt-auth-guard.service';

@Injectable()
export class AccessMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}
  use(req: any, res: any, next: () => void) {
    let accessedBy = req['formOwner']['userId']; // Default from FormLinkMiddleware

    try {
      const token = extractTokenFromHeader(req);
      const { sub: userId } = this.jwtService.verify(token);
      accessedBy = userId || accessedBy;
    } catch (error) {
      // Invalid token, continue with default formOwner
    }

    req['formAccess'] = {
      accessedBy: accessedBy,
      timestamp: new Date(),
      ip: req.ip,
    };

    next();
  }
}
