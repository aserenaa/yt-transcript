import { Module } from '@nestjs/common';

import { TranscriptController } from './transcript.controller';
import { YoutubeTranscriptService } from './youtube-transcript.service';

@Module({
  imports: [],
  controllers: [TranscriptController],
  providers: [YoutubeTranscriptService],
  exports: [
    YoutubeTranscriptService,
  ],
})
export class TranscriptModule {}
