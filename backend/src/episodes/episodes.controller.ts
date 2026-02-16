import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('episodes')
export class EpisodesController {
  constructor(private episodes: EpisodesService) {}

  @Get('movie/:movieId')
  findByMovie(@Param('movieId') movieId: string) {
    return this.episodes.findByMovie(movieId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.episodes.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(
    @Body()
    body: {
      movieId: string;
      number: number;
      title?: string;
      hlsPath: string;
      duration?: number;
    },
  ) {
    return this.episodes.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body()
    body: {
      number?: number;
      title?: string;
      hlsPath?: string;
      duration?: number;
    },
  ) {
    return this.episodes.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.episodes.remove(id);
  }
}
