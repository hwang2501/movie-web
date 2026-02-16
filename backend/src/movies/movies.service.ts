import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { Prisma } from '@prisma/client';

const MOVIES_CACHE_KEY = 'movies:list';
const MOVIES_CACHE_TTL = 300;

@Injectable()
export class MoviesService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async findAll() {
    const cached = await this.cache.get(MOVIES_CACHE_KEY);
    if (cached) return cached;
    const data = await this.prisma.movie.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { episodes: true } } },
    });
    await this.cache.set(MOVIES_CACHE_KEY, data, MOVIES_CACHE_TTL);
    return data;
  }

  async findBySlug(slug: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { slug },
      include: {
        episodes: { orderBy: { number: 'asc' } },
        _count: { select: { comments: true } },
      },
    });
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }

  async findOne(id: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: { episodes: { orderBy: { number: 'asc' } } },
    });
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }

  async create(data: Prisma.MovieCreateInput) {
    const movie = await this.prisma.movie.create({ data });
    await this.cache.del(MOVIES_CACHE_KEY);
    return movie;
  }

  async update(id: string, data: Prisma.MovieUpdateInput) {
    await this.findOne(id);
    const movie = await this.prisma.movie.update({ where: { id }, data });
    await this.cache.del(MOVIES_CACHE_KEY);
    return movie;
  }

  async remove(id: string) {
    await this.findOne(id);
    const movie = await this.prisma.movie.delete({ where: { id } });
    await this.cache.del(MOVIES_CACHE_KEY);
    return movie;
  }
}
