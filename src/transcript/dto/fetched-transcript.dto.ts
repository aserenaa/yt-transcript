/**
 * Represents a single snippet of a transcript: text, start time, and duration.
 */
export type FetchedTranscriptSnippetDto = {
  text: string;
  start: number;
  duration: number;
};

/**
 * Represents the full transcript returned for a video:
 * - videoId: the YouTube video ID
 * - language: the human-readable name (e.g., "English")
 * - languageCode: two-letter ISO code (e.g., "en")
 * - isGenerated: true if YouTube auto-generated captions
 * - isTranslatable: if YouTube allows translation of this track
 * - translationLanguages: array of ISO codes you could translate to in future
 * - snippets: array of text+timestamp entries
 */
export type FetchedTranscriptDto = {
  videoId: string;
  language: string;
  languageCode: string;
  isGenerated: boolean;
  isTranslatable: boolean;
  translationLanguages: string[];
  snippets: FetchedTranscriptSnippetDto[];
};
