import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        movie: {
          include: { _count: { select: { episodes: true } } },
        },
      },
    });
  }

  async add(userId: string, movieId: string) {
    return this.prisma.favorite.upsert({
      where: { userId_movieId: { userId, movieId } },
      create: { userId, movieId },
      update: {},
      include: { movie: true },
    });
  }

  async remove(userId: string, movieId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, movieId } });
    return { message: 'Removed from favorites' };
  }
}

