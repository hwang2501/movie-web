import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsInt, IsString, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WatchHistoryService } from './watch-history.service';

class UpsertWatchHistoryDto {
  @IsString()
  episodeId: string;

  @IsInt()
  @Min(0)
  progress: number;
}

@Controller('watch-history')
@UseGuards(JwtAuthGuard)
export class WatchHistoryController {
  constructor(private history: WatchHistoryService) {}

  @Post()
  upsert(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpsertWatchHistoryDto,
  ) {
    return this.history.upsertProgress(userId, dto.episodeId, dto.progress);
  }

  @Get()
  list(@CurrentUser('userId') userId: string) {
    return this.history.list(userId);
  }
}

