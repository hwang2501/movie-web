import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WatchHistoryService {
  constructor(private prisma: PrismaService) {}

  async upsertProgress(userId: string, episodeId: string, progress: number) {
    return this.prisma.watchHistory.upsert({
      where: { userId_episodeId: { userId, episodeId } },
      create: { userId, episodeId, progress },
      update: { progress },
      include: {
        episode: {
          include: { movie: true },
        },
      },
    });
  }

  async list(userId: string) {
    return this.prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        episode: {
          include: { movie: true },
        },
      },
    });
  }
}

