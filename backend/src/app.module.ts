import { existsSync } from 'fs';
import { join } from 'path';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { MoviesModule } from './movies/movies.module';
import { EpisodesModule } from './episodes/episodes.module';
import { CommentsModule } from './comments/comments.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from './cache/cache.module';
import { FavoritesModule } from './favorites/favorites.module';
import { WatchHistoryModule } from './watch-history/watch-history.module';
import { GenresModule } from './genres/genres.module';

/** Nạp .env khi chạy từ `backend/` hoặc từ thư mục gốc repo (`backend/.env`). */
const envFileCandidates = [
  join(process.cwd(), '.env'),
  join(process.cwd(), 'backend', '.env'),
];
const envFilePath = envFileCandidates.filter((p) => existsSync(p));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePath.length > 0 ? envFilePath : ['.env'],
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
    ]),
    PrismaModule,
    CacheModule,
    HealthModule,
    AuthModule,
    AdminModule,
    MoviesModule,
    EpisodesModule,
    CommentsModule,
    FavoritesModule,
    WatchHistoryModule,
    GenresModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
