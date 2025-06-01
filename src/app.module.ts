import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

import cacheConfig from './config/cache.config';
import { TranscriptModule } from './transcript/transcript.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [cacheConfig],
    }),

    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('cache.host'),
        port: configService.get<number>('cache.port'),
        ttl: configService.get<number>('cache.ttl'),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),

    TranscriptModule,
  ],
})
export class AppModule {}
