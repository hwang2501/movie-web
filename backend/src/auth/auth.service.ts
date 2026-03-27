import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly resetTokens = new Map<
    string,
    { userId: string; expiresAt: number }
  >();

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
    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(dto.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.locked) {
      throw new UnauthorizedException('Account is locked');
    }
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
    if (tokenRecord.user.locked) {
      throw new UnauthorizedException('Account is locked');
    }

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
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        googleId: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  async updateProfile(
    userId: string,
    body: { name?: string; imageUrl?: string | null },
  ) {
    const data: Prisma.UserUpdateInput = {};
    if (body.name !== undefined) data.name = body.name.trim() || null;
    if (body.imageUrl !== undefined) {
      const v = body.imageUrl;
      data.imageUrl =
        v == null || String(v).trim() === '' ? null : String(v).trim();
    }
    if (Object.keys(data).length === 0) {
      return this.me(userId);
    }
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        googleId: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always return generic response to avoid leaking whether email exists.
    if (!user) return { message: 'If email exists, reset instructions were sent' };

    const token = crypto.randomBytes(24).toString('hex');
    this.resetTokens.set(token, {
      userId: user.id,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[dev] password reset token for ${email}: ${token}`);
    }
    return { message: 'If email exists, reset instructions were sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const reset = this.resetTokens.get(token);
    if (!reset || reset.expiresAt < Date.now()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: reset.userId },
      data: { password: hash },
    });
    await this.prisma.refreshToken.updateMany({
      where: { userId: reset.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    this.resetTokens.delete(token);
    return { message: 'Password reset successful' };
  }

  async googleLogin(idToken: string, name?: string) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID')?.trim();
    const devBypass =
      process.env.NODE_ENV !== 'production' &&
      this.config.get('GOOGLE_AUTH_DEV_BYPASS') === 'true';

    if (devBypass && idToken.includes('@') && !clientId) {
      const email = idToken.trim().toLowerCase();
      let user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        const randomPassword = crypto.randomBytes(20).toString('hex');
        user = await this.prisma.user.create({
          data: {
            email,
            name: name ?? email.split('@')[0],
            password: await bcrypt.hash(randomPassword, 10),
            role: Role.MEMBER,
          },
        });
      }
      return this.tokens(user.id, user.email, user.role);
    }

    if (!clientId) {
      throw new BadRequestException(
        'Google Sign-In is not configured. Set GOOGLE_CLIENT_ID (OAuth Web client ID).',
      );
    }

    const client = new OAuth2Client(clientId);
    let payload: TokenPayload | undefined;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: clientId,
      });
      payload = ticket.getPayload() ?? undefined;
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    if (!payload?.email || !payload.sub) {
      throw new UnauthorizedException('Google account has no email');
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const displayName = name ?? payload.name ?? email.split('@')[0];
    const googlePicture = payload.picture ?? undefined;

    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: displayName,
          googleId,
          password: null,
          imageUrl: googlePicture ?? null,
          role: Role.MEMBER,
        },
      });
    } else if (user.googleId !== googleId) {
      if (user.googleId) {
        throw new ConflictException('This email is linked to another Google account');
      }
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          name: user.name ?? displayName,
          ...(googlePicture ? { imageUrl: googlePicture } : {}),
        },
      });
    } else {
      const patch: { name?: string; imageUrl?: string | null } = {};
      if (!user.name && displayName) patch.name = displayName;
      if (googlePicture) patch.imageUrl = googlePicture;
      if (Object.keys(patch).length) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: patch,
        });
      }
    }

    if (user.locked) {
      throw new UnauthorizedException('Account is locked');
    }

    return this.tokens(user.id, user.email, user.role);
  }
}
