import {
  Body,
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PatchUserRoleDto } from './dto/patch-user-role.dto';
import { PatchUserLockDto } from './dto/patch-user-lock.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get()
  adminOnly() {
    return { message: 'Admin area' };
  }

  @Get('stats')
  stats() {
    return Promise.all([
      this.prisma.user.count(),
      this.prisma.movie.count(),
      this.prisma.episode.count(),
      this.prisma.genre.count(),
    ]).then(([users, movies, episodes, genres]) => ({
      users,
      movies,
      episodes,
      genres,
    }));
  }

  @Get('users')
  listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        locked: true,
        createdAt: true,
        googleId: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch('users/:id/role')
  patchUserRole(@Param('id') id: string, @Body() dto: PatchUserRoleDto) {
    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        locked: true,
      },
    });
  }

  @Patch('users/:id/lock')
  async patchUserLock(@Param('id') id: string, @Body() dto: PatchUserLockDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { locked: dto.locked },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        locked: true,
      },
    });
    if (dto.locked) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return user;
  }

  @Delete('users/:id')
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser('userId') adminId: string,
  ) {
    if (id === adminId) {
      throw new BadRequestException('Cannot delete your own account');
    }
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('User not found');
    if (target.role === Role.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: { role: Role.ADMIN },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot delete the last admin account');
      }
    }
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted' };
  }
}
