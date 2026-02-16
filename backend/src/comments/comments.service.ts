import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async findByMovie(movieId: string) {
    return this.prisma.comment.findMany({
      where: { movieId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async create(movieId: string, userId: string, content: string) {
    return this.prisma.comment.create({
      data: { movieId, userId, content },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new NotFoundException('Forbidden');
    return this.prisma.comment.delete({ where: { id } });
  }
}
