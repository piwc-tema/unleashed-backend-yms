import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '../../logger/logger/logger.service';
import { PrismaService } from '../../config/prisma/prisma/prisma.service';
import { Role } from '../enums/roles.enum';
import * as moment from 'moment';
import { TokenTypes } from '../enums/token-types.enum';
import { EmailService } from '../../../infrastructure/email/services/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private loggerService: LoggerService,
    private emailService: EmailService,
  ) {}

  // for authentication: A
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (user && bcrypt.compareSync(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // for authentication: B
  async login(user: any) {
    const tokens = await this.generateAuthTokens(user);

    const response: {
      user: any;
      token: {
        access: { expires: Date; token: string };
        refresh: { expires: Date; token: string };
      };
    } = {
      user: {
        userId: user.id,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
      },
      token: {
        access: tokens.access,
        refresh: tokens.refresh,
      },
    };

    return response;
  }

  // for creating a new admin, authentication member
  async createAdmin(data: any) {
    const user = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });
    if (user) {
      throw new UnauthorizedException('User already exists');
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    this.loggerService.log(`Temporary password: ${tempPassword}`);

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Create the admin with the hashed password
    const newUser = await this.prismaService.user.create({
      data: {
        ...data,
        role: data.role || Role.VIEWER,
        password: hashedPassword,
      },
    });

    // Send the temporary password to the user's email
    await this.emailService.sendEmail(
      '',
      'Welcome to Our YMS!',
      'temp-password',
      {
        name: newUser.firstName,
        password: tempPassword,
        loginLink: 'https://yms.com/login',
        siteName: 'YMS',
      },
    );

    const { password, ...createdUser } = newUser;

    return createdUser;
  }

  // update user's role and generate new password if they do not have one
  async updateUserRole(userId: string, role: Role) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate a temporary password if user does not have one
    let tempPassword = '';
    if (!user.password) {
      tempPassword = Math.random().toString(36).slice(-8);
      this.loggerService.log(`Temporary password: ${tempPassword}`);

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(tempPassword, salt);

      // Update the user with the hashed password
      await this.prismaService.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    }

    // Update the user's role
    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { role },
    });

    // Send the temporary password to the user's email
    if (tempPassword) {
      await this.emailService.sendEmail(
        '',
        'Your Role has been Updated!',
        'temp-password',
        {
          name: updatedUser.firstName,
          password: tempPassword,
          loginLink: 'https://yms.com/login',
          siteName: 'YMS',
        },
      );
    }

    const { password, ...result } = updatedUser;
    return result;
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (payload && payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token');
      }

      const dbToken = await this.prismaService.tokens.findUnique({
        where: { token: token },
      });
      if (!dbToken || dbToken.blacklisted) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const accessTokenExpires = moment().add(7, 'days');
      const access_token = await this.generateToken(
        payload.sub,
        payload.role,
        accessTokenExpires,
        TokenTypes.ACCESS,
      );
      return {
        access: {
          token: access_token,
          expires: accessTokenExpires,
        },
        refresh: {
          token: token,
          expires: '', // ToDo:
        },
      };
    } catch (error) {
      this.loggerService.error('refreshToken error:', error);
      throw new UnauthorizedException('Invalid token or expired');
    }
  }

  async resetPassword(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    this.loggerService.log(`Temporary password: ${tempPassword}`);

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Update the user with the hashed password
    await this.prismaService.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // ToDo: Send the temporary password to the user's email
  }

  async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!bcrypt.compareSync(oldPassword, user.password)) {
      throw new UnauthorizedException('Invalid password');
    }

    // make sure user is not repeating old password
    if (bcrypt.compareSync(newPassword, user.password)) {
      throw new UnauthorizedException(
        'New password cannot be the same as the old password',
      );
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user with the hashed password
    await this.prismaService.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }

  async generateToken(userId, role, expires, type) {
    const payload = {
      sub: userId,
      role,
      iat: moment().unix(),
      exp: expires.unix(),
      type: type,
    };
    return this.jwtService.signAsync(payload);
  }

  async saveToken(
    token: string,
    type: TokenTypes,
    userId,
    refreshTokenExpires: moment.Moment,
  ) {
    return this.prismaService.tokens.create({
      data: {
        token,
        type,
        blacklisted: false,
        expiresAt: refreshTokenExpires.toDate(),
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async generateAuthTokens(user) {
    const accessTokenExpires = moment().add(7, 'days');
    const accessToken = await this.generateToken(
      user.userId,
      user.role,
      accessTokenExpires,
      TokenTypes.ACCESS,
    );

    const refreshTokenExpires = moment().add(14, 'days');
    const refreshToken = await this.generateToken(
      user.userId,
      user.role,
      refreshTokenExpires,
      TokenTypes.REFRESH,
    );

    // save
    await this.saveToken(
      refreshToken,
      TokenTypes.REFRESH,
      user.id,
      refreshTokenExpires,
    );

    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toDate(),
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires.toDate(),
      },
    };
  }

  async logout(refreshToken: string) {
    try {
      // set blacklisted to true
      const updatedToken = await this.prismaService.tokens.update({
        where: { token: refreshToken },
        data: { blacklisted: true },
      });

      if (!updatedToken) {
        throw new UnauthorizedException(
          'Invalid token: expired or blacklisted',
        );
      }
    } catch (e) {
      this.loggerService.error('logout error:', e);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
