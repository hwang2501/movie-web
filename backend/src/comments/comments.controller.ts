import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsGateway } from './comments.gateway';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('comments')
export class CommentsController {
  constructor(
    private comments: CommentsService,
    private gateway: CommentsGateway,
  ) {}

  @Get('movie/:movieId')
  findByMovie(@Param('movieId') movieId: string) {
    return this.comments.findByMovie(movieId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: { movieId: string; content: string },
    @CurrentUser('userId') userId: string,
  ) {
    const comment = await this.comments.create(body.movieId, userId, body.content);
    this.gateway.broadcastComment(body.movieId, comment);
    return comment;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.comments.remove(id, userId);
  }
}
