import { Controller, Get, Query } from '@nestjs/common';

import { YoutubeService } from './youtube.service';

@Controller('transcripts')
export class YoutubeController {
  constructor(private yt: YoutubeService) {}

  @Get('video')
  async byVideo(@Query('id') id: string) {
    const t = await this.yt.getVideoTranscript(id);
    return ({ videoId: id, transcript: t });
  }

  @Get('playlist')
  async byPlaylist(@Query('id') id: string) {
    const map = await this.yt.getPlaylistTranscripts(id);
    return Object.entries(map).map(([videoId, transcript]) => ({ videoId, transcript }));
  }
}
