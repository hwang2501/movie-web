import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentsGateway } from './comments.gateway';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, CommentsGateway],
  exports: [CommentsService],
})
export class CommentsModule {}
