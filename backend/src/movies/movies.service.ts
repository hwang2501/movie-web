import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { Prisma } from '@prisma/client';

const MOVIES_CACHE_KEY = 'movies:list';
const MOVIES_CACHE_TTL = 300;

const movieListInclude = {
  _count: { select: { episodes: true } },
  genres: {
    include: {
      genre: { select: { id: true, name: true, slug: true } },
    },
  },
} satisfies Prisma.MovieInclude;

export type MovieListFilters = {
  q?: string;
  genre?: string;
  country?: string;
  year?: string;
};

@Injectable()
export class MoviesService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  private buildWhere(filters: MovieListFilters): Prisma.MovieWhereInput {
    const q = filters.q?.trim();
    const genreSlug = filters.genre?.trim();
    const country = filters.country?.trim();
    const yearRaw = filters.year?.trim();
    const year =
      yearRaw && yearRaw.length > 0 ? parseInt(yearRaw, 10) : undefined;

    const parts: Prisma.MovieWhereInput[] = [];
    if (q) {
      parts.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          ...(q.length >= 2
            ? [{ description: { contains: q, mode: 'insensitive' as const } }]
            : []),
        ],
      });
    }
    if (genreSlug) {
      parts.push({
        genres: { some: { genre: { slug: genreSlug } } },
      });
    }
    if (country) {
      parts.push({ country: { equals: country, mode: 'insensitive' } });
    }
    if (year !== undefined && !Number.isNaN(year)) {
      parts.push({ year });
    }
    return parts.length ? { AND: parts } : {};
  }

  async findAll(filters: MovieListFilters = {}) {
    const where = this.buildWhere(filters);
    const hasAnyFilter = Object.keys(where).length > 0;

    if (!hasAnyFilter) {
      const cached = await this.cache.get(MOVIES_CACHE_KEY);
      if (cached) return cached;
    }

    const data = await this.prisma.movie.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: movieListInclude,
    });

    if (!hasAnyFilter) {
      await this.cache.set(MOVIES_CACHE_KEY, data, MOVIES_CACHE_TTL);
    }
    return data;
  }

  async findBySlug(slug: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { slug },
      include: {
        episodes: { orderBy: { number: 'asc' } },
        _count: { select: { comments: true } },
        genres: {
          include: {
            genre: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }

  async findOne(id: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        episodes: { orderBy: { number: 'asc' } },
        genres: {
          include: {
            genre: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }

  async create(data: {
    title: string;
    slug: string;
    description?: string | null;
    thumbnail?: string | null;
    year?: number | null;
    country?: string | null;
    genreIds?: string[];
  }) {
    const { genreIds, ...rest } = data;
    const movie = await this.prisma.movie.create({
      data: {
        ...rest,
        ...(genreIds?.length
          ? {
              genres: {
                create: genreIds.map((genreId) => ({
                  genre: { connect: { id: genreId } },
                })),
              },
            }
          : {}),
      },
      include: movieListInclude,
    });
    await this.cache.del(MOVIES_CACHE_KEY);
    return movie;
  }

  async update(
    id: string,
    data: {
      title?: string;
      slug?: string;
      description?: string | null;
      thumbnail?: string | null;
      year?: number | null;
      country?: string | null;
      genreIds?: string[];
    },
  ) {
    await this.findOne(id);
    const { genreIds, ...rest } = data;

    const movie = await this.prisma.$transaction(async (tx) => {
      if (genreIds !== undefined) {
        await tx.movieGenre.deleteMany({ where: { movieId: id } });
      }
      return tx.movie.update({
        where: { id },
        data: {
          ...rest,
          ...(genreIds !== undefined
            ? {
                genres: {
                  create: genreIds.map((genreId) => ({
                    genre: { connect: { id: genreId } },
                  })),
                },
              }
            : {}),
        },
        include: movieListInclude,
      });
    });
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
