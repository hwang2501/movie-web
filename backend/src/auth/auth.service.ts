import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already registered');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        name: dto.name,
        role: Role.MEMBER,
      },
    });
    return this.tokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password)))
      throw new UnauthorizedException('Invalid credentials');
    return this.tokens(user.id, user.email, user.role);
  }

  private async tokens(userId: string, email: string, role: Role) {
    const accessSecret = this.config.get('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.get('JWT_REFRESH_SECRET');
    const accessExp = this.config.get('ACCESS_TOKEN_EXPIRES_IN', '15m');
    const refreshExp = this.config.get('REFRESH_TOKEN_EXPIRES_IN', '7d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId, email, role },
        { secret: accessSecret, expiresIn: accessExp },
      ),
      this.jwt.signAsync(
        { sub: userId, type: 'refresh' },
        { secret: refreshSecret, expiresIn: refreshExp },
      ),
    ]);

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);
    const hash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.create({
      data: { hash, userId, expiresAt: refreshExpiry },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExp,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token required');
    const hash = this.hashToken(refreshToken);
    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: { hash },
      include: { user: true },
    });
    if (!tokenRecord)
      throw new UnauthorizedException('Invalid or revoked refresh token');
    if (tokenRecord.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: tokenRecord.userId },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Token reused - all sessions revoked');
    }
    if (new Date() > tokenRecord.expiresAt)
      throw new UnauthorizedException('Refresh token expired');

    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      if (payload.type !== 'refresh')
        throw new UnauthorizedException('Invalid token type');
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    return this.tokens(
      tokenRecord.user.id,
      tokenRecord.user.email,
      tokenRecord.user.role,
    );
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return { message: 'Logged out' };
    const hash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { hash },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logged out' };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}
