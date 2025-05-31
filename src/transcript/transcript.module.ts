import { Module } from '@nestjs/common';

import { googleAuthProvider } from '../common/google-auth.provider';
import { redisProvider } from '../common/redis.provider';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';

@Module({
  imports: [],
  providers: [YoutubeService, redisProvider, googleAuthProvider],
  controllers: [YoutubeController],
})
export class TranscriptModule {}
