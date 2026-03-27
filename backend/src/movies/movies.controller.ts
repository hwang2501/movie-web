import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('movies')
export class MoviesController {
  constructor(private movies: MoviesService) {}

  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('genre') genre?: string,
    @Query('country') country?: string,
    @Query('year') year?: string,
  ) {
    return this.movies.findAll({ q, genre, country, year });
  }

  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.movies.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movies.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(
    @Body()
    body: {
      title: string;
      slug: string;
      description?: string;
      thumbnail?: string;
      year?: number;
    },
  ) {
    return this.movies.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      slug?: string;
      description?: string | null;
      thumbnail?: string | null;
      year?: number | null;
      country?: string | null;
      genreIds?: string[];
    },
  ) {
    return this.movies.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.movies.remove(id);
  }
}
