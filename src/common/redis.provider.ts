import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const redisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: (cfg: ConfigService) => {
    const client = new Redis({
      host: cfg.get('REDIS_HOST'),
      port: cfg.get('REDIS_PORT'),
    });
    client.on('connect', () => console.warn('✅ Connected to Redis'));
    client.on('error', err => console.error('🚨 Redis error', err));
    return client;
  },
  inject: [ConfigService],
};
