import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favorites: FavoritesService) {}

  @Get()
  list(@CurrentUser('userId') userId: string) {
    return this.favorites.list(userId);
  }

  @Post(':movieId')
  add(@CurrentUser('userId') userId: string, @Param('movieId') movieId: string) {
    return this.favorites.add(userId, movieId);
  }

  @Delete(':movieId')
  remove(@CurrentUser('userId') userId: string, @Param('movieId') movieId: string) {
    return this.favorites.remove(userId, movieId);
  }
}

