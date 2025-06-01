import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

export class FetchTranscriptDto {
  /**
   * Optional ISO language code (e.g., 'en', 'en-US').
   * We’ll only match two-letter codes or two-letter + dash + two-letter (region).
   */
  @IsOptional()
  @IsString()
  @Matches(/^[a-z]{2}(-[A-Z]{2})?$/, {
    message: 'lang must be a two-letter code or two-letter with region (e.g., en or en-US)',
  })
  lang?: string;

  /**
   * Format to return: 'json' | 'srt' | 'vtt'. Default is 'json'.
   */
  @IsOptional()
  @IsString()
  @IsIn(['json', 'srt', 'vtt'], {
    message: 'format must be one of: json, srt, vtt',
  })
  format?: string;
}
