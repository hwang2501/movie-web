import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CommentsService } from './comments.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class CommentsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private comments: CommentsService) {}

  @SubscribeMessage('join-movie')
  handleJoin(
    @MessageBody() movieId: string,
    @ConnectedSocket() client: any,
  ) {
    client.join(`movie:${movieId}`);
  }

  @SubscribeMessage('leave-movie')
  handleLeave(
    @MessageBody() movieId: string,
    @ConnectedSocket() client: any,
  ) {
    client.leave(`movie:${movieId}`);
  }

  broadcastComment(movieId: string, comment: any) {
    this.server.to(`movie:${movieId}`).emit('new-comment', comment);
  }
}
