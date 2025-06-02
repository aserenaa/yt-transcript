import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AxiosInstance } from 'axios';

import { TranscriptNotFoundException, TranscriptParseException } from '../common/exceptions/transcript.exception';
import { FetchedTranscriptDto, FetchedTranscriptSnippetDto } from './dto/fetched-transcript.dto';
import { createYouTubeAxiosInstance } from './youtube-http.client';
import { extractInitialPlayerResponse } from './youtube-parser.utils';

@Injectable()
export class YoutubeTranscriptService implements OnModuleInit {
  private readonly logger = new Logger(YoutubeTranscriptService.name);
  private axios: AxiosInstance;

  async onModuleInit() {
    const proxyUrl = process.env.HTTP_PROXY || process.env.YOUTUBE_PROXY_URL;
    this.axios = await createYouTubeAxiosInstance(proxyUrl);
  }

  /**
   * Fetch list of caption tracks (languages, auto-generated or manual).
   * Throws HttpException(404) if no captions exist.
   */
  private async getCaptionTracks(videoId: string): Promise<{ tracks: any[]; playerResponse: any }> {
    const watchPath = `/watch?v=${videoId}`;

    let html: string;
    try {
      const response = await this.axios.get<string>(watchPath);
      html = response.data;
    }
    catch (err) {
      this.logger.error(`Failed to retrieve HTML for video ${videoId}`, err.stack);
      throw new TranscriptParseException('Failed to load YouTube page');
    }

    let playerResponse: any;
    try {
      playerResponse = extractInitialPlayerResponse(html);
    }
    catch (err) {
      this.logger.warn(`Parsing ytInitialPlayerResponse failed for ${videoId}: ${err.message}`);
      throw new TranscriptParseException('Unable to parse YouTube HTML');
    }

    const tracks
      = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!Array.isArray(tracks) || tracks.length === 0) {
      throw new TranscriptNotFoundException('No captions available');
    }

    return { tracks, playerResponse };
  }

  /**
   * Fetch the transcript snippets for a single videoId in a given language.
   * If the requested language isn't available but 'en' is, defaults to English.
   * Otherwise, returns 404 if language not found.
   */
  async fetch(
    videoId: string,
    lang = 'en',
  ): Promise<FetchedTranscriptDto> {
    const { tracks, playerResponse } = await this.getCaptionTracks(videoId);

    let chosenTrack = tracks.find(t => t.languageCode === lang);

    if (!chosenTrack && lang === 'en') {
      chosenTrack = tracks.find(t => t.languageCode === 'en');
    }

    if (!chosenTrack) {
      const supportedCodes = tracks.map(t => t.languageCode);
      throw new TranscriptNotFoundException(
        `Transcript not available in "${lang}". Supported: ${supportedCodes.join(', ')}`,
      );
    }

    let timedTextUrl: string = chosenTrack.baseUrl;
    if (!timedTextUrl.includes('fmt=json3')) {
      timedTextUrl += timedTextUrl.includes('?') ? '&fmt=json3' : '?fmt=json3';
    }

    let events: any[];
    try {
      const resp = await this.axios.get<{ events: any[] }>(timedTextUrl);
      events = resp.data.events;
    }
    catch (err) {
      this.logger.error(
        `Error fetching timedtext for ${videoId} (${lang})`,
        err.stack,
      );
      throw new TranscriptParseException('TimedText fetch failed');
    }

    const snippets: FetchedTranscriptSnippetDto[] = [];
    for (const ev of events) {
      if (!Array.isArray(ev.segs)) {
        continue;
      }
      const text = ev.segs.map((s: any) => s.utf8).join('');
      const start = (ev.tStartMs ?? 0) / 1000;
      const duration = (ev.dDurationMs ?? 0) / 1000;
      snippets.push({ text, start, duration });
    }

    const dto: FetchedTranscriptDto = {
      videoId,
      language: chosenTrack.name.simpleText || chosenTrack.languageCode,
      languageCode: chosenTrack.languageCode,
      isGenerated: chosenTrack.kind === 'asr',
      isTranslatable:
        !!playerResponse?.captions?.playerCaptionsTracklistRenderer?.audioTracks,
      translationLanguages: [],
      snippets,
    };

    return dto;
  }

  /**
   * TODO: Verify if this is actually needed.
   * (Optional) Translate an existing transcript to a target language.
   * Currently not implemented.
   */
  async translate(
    _videoId: string,
    _fromLang: string,
    _toLang: string,
  ): Promise<FetchedTranscriptDto> {
    // As a first pass, throw not implemented. In future:
    // 1) Retrieve track for fromLang
    // 2) Append &tlang=<toLang> to timedTextUrl and fetch JSON3
    // 3) Parse snippets and return a new DTO
    throw new HttpException('Translate not implemented', HttpStatus.NOT_IMPLEMENTED);
  }
}
