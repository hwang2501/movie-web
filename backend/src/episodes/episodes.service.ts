import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class EpisodesService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async findByMovie(movieId: string) {
    return this.prisma.episode.findMany({
      where: { movieId },
      orderBy: { number: 'asc' },
    });
  }

  async findOne(id: string) {
    const ep = await this.prisma.episode.findUnique({
      where: { id },
      include: { movie: true },
    });
    if (!ep) throw new NotFoundException('Episode not found');
    return ep;
  }

  async findByMovieAndNumber(movieId: string, number: number) {
    const ep = await this.prisma.episode.findUnique({
      where: { movieId_number: { movieId, number } },
      include: { movie: true },
    });
    if (!ep) throw new NotFoundException('Episode not found');
    return ep;
  }

  async create(data: {
    movieId: string;
    number: number;
    title?: string;
    hlsPath: string;
    duration?: number;
  }) {
    return this.prisma.episode.create({
      data: {
        movie: { connect: { id: data.movieId } },
        number: data.number,
        title: data.title,
        hlsPath: data.hlsPath,
        duration: data.duration,
      },
    });
  }

  async update(id: string, data: Prisma.EpisodeUpdateInput) {
    await this.findOne(id);
    return this.prisma.episode.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.episode.delete({ where: { id } });
  }

  async getStreamUrl(id: string, userId: string | null = null) {
    const ep = await this.findOne(id);
    const uid = userId ?? 'guest';
    const expiresAt = Math.floor(Date.now() / 1000) + 10 * 60;
    const secret = this.config.get<string>('STREAM_SIGNING_SECRET') || 'dev-stream-secret';
    const payload = `${uid}:${id}:${expiresAt}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return {
      episodeId: ep.id,
      expiresAt,
      // In production, this should point to signed CDN/object-storage URL.
      streamUrl: `${ep.hlsPath}?uid=${encodeURIComponent(uid)}&exp=${expiresAt}&sig=${signature}`,
    };
  }
}
