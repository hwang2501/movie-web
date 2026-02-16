import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit {
  private redis: Redis;

  constructor(private config: ConfigService) {
    this.redis = new Redis(this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6381');
  }

  async onModuleInit() {
    this.redis.on('error', (err) => console.warn('Redis:', err.message));
  }

  async get<T>(key: string): Promise<T | null> {
    const v = await this.redis.get(key);
    return v ? JSON.parse(v) : null;
  }

  async set(key: string, value: unknown, ttlSeconds = 300) {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async del(key: string) {
    await this.redis.del(key);
  }
}
