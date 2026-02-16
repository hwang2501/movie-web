import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EpisodesService {
  constructor(private prisma: PrismaService) {}

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
}
