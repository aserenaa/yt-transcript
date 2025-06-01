import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Query,
  Res,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';

import { VideoIdPipe } from 'src/common/pipes/video-id.pipe';

import { FetchTranscriptDto } from './dto/fetch-transcript.dto';
import { FetchedTranscriptDto } from './dto/fetched-transcript.dto';
import { YoutubeTranscriptService } from './youtube-transcript.service';

@Controller('transcript')
@UseInterceptors(CacheInterceptor)
export class TranscriptController {
  private readonly logger = new Logger(TranscriptController.name);

  constructor(private readonly ytService: YoutubeTranscriptService) {}

  /**
   * GET /transcript/video/:videoId?lang=<lang>&format=<json|srt|vtt>
   */
  @Get('video/:videoId')
  async getVideoTranscript(
    @Param('videoId', VideoIdPipe) videoId: string,
    @Query(new ValidationPipe({ whitelist: true, transform: true }))
    query: FetchTranscriptDto,
    @Res() res: Response,
  ): Promise<any> {
    const lang = query.lang || 'en';
    const format = query.format || 'json';

    let transcript: FetchedTranscriptDto;
    try {
      transcript = await this.ytService.fetch(videoId, lang);
    }
    catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      this.logger.error(`Error fetching transcript [${videoId}|${lang}]`, err.stack);
      throw new InternalServerErrorException('Failed to fetch transcript');
    }

    if (format === 'json') {
      res.json(transcript);
      return;
    }

    const snippets = transcript.snippets;
    if (format === 'srt') {
      const srtData = this.convertToSrt(snippets);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(srtData);
      return;
    }

    if (format === 'vtt') {
      const vttData = this.convertToVtt(snippets);
      res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
      res.send(vttData);
      return;
    }

    throw new BadRequestException('Unsupported format');
  }

  /**
   * Helper: Convert snippet array to SRT format string.
   */
  private convertToSrt(snippets: { text: string; start: number; duration: number }[]): string {
    const pad = (n: number, width = 2) => n.toString().padStart(width, '0');
    const formatTime = (seconds: number): string => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${ms.toString().padStart(3, '0')}`;
    };

    let srt = '';
    snippets.forEach((snip, idx) => {
      const startTs = formatTime(snip.start);
      const endTs = formatTime(snip.start + snip.duration);
      srt += `${idx + 1}\n${startTs} --> ${endTs}\n${snip.text}\n\n`;
    });
    return srt.trim();
  }

  /**
   * Helper: Convert snippet array to VTT format string.
   */
  private convertToVtt(snippets: { text: string; start: number; duration: number }[]): string {
    const pad = (n: number, width = 2) => n.toString().padStart(width, '0');
    const formatTime = (seconds: number): string => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${ms.toString().padStart(3, '0')}`;
    };

    let vtt = 'WEBVTT\n\n';
    snippets.forEach((snip, idx) => {
      const startTs = formatTime(snip.start);
      const endTs = formatTime(snip.start + snip.duration);
      vtt += `${idx + 1}\n`;
      vtt += `${startTs} --> ${endTs}\n`;
      vtt += `${snip.text}\n\n`;
    });
    return vtt.trim();
  }
}
