import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Thrown when no transcripts are available for a given video ID.
 */
export class TranscriptNotFoundException extends HttpException {
  constructor(message?: string) {
    super(message || 'Transcript not found for this video', HttpStatus.NOT_FOUND);
  }
}

/**
 * Thrown when YouTube HTML structure changes or timedtext format is missing.
 */
export class TranscriptParseException extends HttpException {
  constructor(message?: string) {
    super(message || 'Failed to parse transcript', HttpStatus.BAD_GATEWAY);
  }
}

/**
 * Thrown when YouTube blocks or returns a 429/403 (e.g., IP blocked).
 */
export class TranscriptBlockedException extends HttpException {
  constructor(message?: string) {
    super(message || 'YouTube blocked the request', HttpStatus.SERVICE_UNAVAILABLE);
  }
}
