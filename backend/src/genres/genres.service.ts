import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GenresService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(data: { name: string; slug: string }) {
    const exists = await this.prisma.genre.findFirst({
      where: { OR: [{ slug: data.slug }, { name: data.name }] },
    });
    if (exists) throw new ConflictException('Genre slug or name already exists');
    return this.prisma.genre.create({ data });
  }

  async update(id: string, data: { name?: string; slug?: string }) {
    await this.findOne(id);
    try {
      return await this.prisma.genre.update({ where: { id }, data });
    } catch {
      throw new ConflictException('Genre slug or name conflict');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.movieGenre.deleteMany({ where: { genreId: id } });
    return this.prisma.genre.delete({ where: { id } });
  }

  async findOne(id: string) {
    const g = await this.prisma.genre.findUnique({ where: { id } });
    if (!g) throw new NotFoundException('Genre not found');
    return g;
  }
}
