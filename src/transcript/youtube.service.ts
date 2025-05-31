import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { google, youtube_v3 } from 'googleapis';
import { Redis } from 'ioredis';

@Injectable()
export class YoutubeService {
  private ytClient: youtube_v3.Youtube;
  private ttl: number;

  constructor(
    private config: ConfigService,
    @Inject('REDIS_CLIENT') private redis: Redis,
    @Inject('YT_OAUTH2_CLIENT') private oauth2: OAuth2Client,
  ) {
    this.ytClient = google.youtube({ version: 'v3', auth: this.oauth2 });
    this.ttl = this.config.get<number>('REDIS_TTL_SECONDS') ?? 3600;
  }

  private cacheKey(id: string) {
    return `transcript:${id}`;
  }

  private async fetchPublicTranscript(videoId: string): Promise<string> {
  // 1) List available tracks
    const listUrl = `https://www.youtube.com/api/timedtext?type=list&v=${videoId}`;
    const listResp = await axios.get<string>(listUrl, { responseType: 'text' });
    const xmlList = listResp.data;

    // If no <track> elements, no captions at all
    if (!xmlList.includes('<track')) {
      throw new NotFoundException(`No public captions available for video ${videoId}`);
    }

    // 2) Extract all lang_code values
    const codes: string[] = [];
    const re = /<track [^>]*lang_code="([^"]+)"/g;
    let m: RegExpExecArray | null;
    m = re.exec(xmlList);
    while (m) {
      codes.push(m[1]);
      m = re.exec(xmlList);
    }

    // 3) Choose the first code (or override via env / param if you add that)
    const lang = codes[0];
    if (!lang) {
      throw new NotFoundException(`No valid caption tracks for video ${videoId}`);
    }

    // 4) Fetch that track
    const textUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}`;
    const textResp = await axios.get<string>(textUrl, { responseType: 'text' });
    const xml = textResp.data;

    // If still no <text> elements, something’s off
    if (!xml.includes('<text')) {
      throw new NotFoundException(`Caption track found (${lang}), but no data for video ${videoId}`);
    }

    // 5) Strip tags into plain text
    const plain = xml
      .replace(/<text[^>]*>/g, '') // remove opening tags
      .replace(/<\/text>/g, '\n') // replace closing tags with newline
      .replace(/&amp;/g, '&') // handle HTML entities as needed
      .trim();

    return plain;
  }

  async getVideoTranscript(videoId: string): Promise<string> {
    const key = this.cacheKey(videoId);
    const cached = await this.redis.get(key);
    if (cached)
      return cached;

    let transcript: string;

    // 1️⃣ Try the official captions.download (owner-only)
    try {
      const { data } = await this.ytClient.captions.list({
        part: ['id'],
        videoId,
      });
      const capId = data.items?.[0]?.id;
      if (!capId) {
        throw new NotFoundException(`No captions found for video ID ${videoId}`);
      }

      // Download via Data API
      const authHeader = `Bearer ${(await this.oauth2.getAccessToken()).token}`;
      const apiUrl = `https://www.googleapis.com/youtube/v3/captions/${capId}?tfmt=srt`;
      const resp = await axios.get<string>(apiUrl, {
        responseType: 'text',
        headers: { Authorization: authHeader },
      });
      transcript = resp.data;
    }
    catch (err) {
      // 403 forbidden → fallback to public timedtext
      console.error(`Error fetching private captions for ${videoId}:`, err.message);
      if (
        err instanceof AxiosError
        && err.response?.status === 403
      ) {
        transcript = await this.fetchPublicTranscript(videoId);
      }
      else {
        // Re-throw Nest exceptions or other errors
        throw err;
      }
    }

    // 2️⃣ Cache & return
    await this.redis.set(key, transcript, 'EX', this.ttl);
    return transcript;
  }

  async getPlaylistTranscripts(playlistId: string): Promise<Record<string, string>> {
    const out: Record<string, string> = {};
    let token: string | undefined;
    do {
      const { data } = await this.ytClient.playlistItems.list({ part: ['contentDetails'], playlistId, maxResults: 50, pageToken: token });
      for (const item of data.items || []) {
        const vid = item.contentDetails?.videoId;
        if (vid)
          out[vid] = await this.getVideoTranscript(vid);
      }
      token = data.nextPageToken || undefined;
    } while (token);
    return out;
  }
}
