# YouTube Transcription API Guide

A comprehensive guide for building an API that fetches video transcripts from YouTube links or playlists, leveraging official caption tracks and optional Speech-to-Text fallback.

---

## 1. High-Level Architecture

```
Client → API Gateway → Transcription Service → YouTube Data API / Speech-to-Text → API → Client
                     ↓
                   Cache (Redis)
                     ↓
                Persistent Store (PostgreSQL)
```

- **API Gateway**: Exposes REST endpoints (e.g., via NestJS or Express).
- **Transcription Service**: Core logic for retrieving or generating transcripts.
- **YouTube Data API v3**: `captions.list` & `captions.download` methods for official tracks.
- **Speech-to-Text API** (optional): Fallback when no captions exist.
- **Cache**: Redis for caching transcript responses (e.g., 24 h TTL).
- **Store**: PostgreSQL to persist metadata and transcript JSON.

---

## 2. Prerequisites

1. **Google Cloud Project**
   - Enable **YouTube Data API v3**
   - (Optional) Enable **Speech-to-Text API**
2. **Authentication Credentials**
   - OAuth 2.0 client for caption downloads (`youtube.force-ssl` scope).
   - API key or service account for captions listing.
3. **Technology Stack**
   - Node.js + TypeScript (NestJS recommended).
   - Redis for cache, PostgreSQL for storage.
   - Docker for containerization.

---

## 3. Step-by-Step Implementation

### 3.1 Project Setup & Configuration

- Scaffold a NestJS or Express app with TypeScript.
- Manage secrets via environment variables or Vault.
- Define OpenAPI (Swagger) schema for endpoints.

### 3.2 Fetching Captions

1. **List Available Tracks**

   ```http
   GET https://www.googleapis.com/youtube/v3/captions
     ?part=snippet
     &videoId={VIDEO_ID}
     &key={API_KEY}
   ```

   - Retrieves caption IDs and languages.

2. **Download a Track**

   ```http
   GET https://www.googleapis.com/youtube/v3/captions/{CAPTION_ID}
     ?tfmt=vtt
   Authorization: Bearer {OAUTH_TOKEN}
   ```

   - Returns WebVTT (or SRT) content. Parse into segments:
     ```json
     [{ "start": 12.34, "duration": 4.56, "text": "…" }]
     ```

3. **Fallback: Automated Transcription**

- If no captions exist, download audio (via `youtube-dl`) and send to Speech-to-Text API.
- Trade-off: higher cost and latency but ensures coverage.

### 3.3 Playlist Handling

1. **List Playlist Videos**
   ```http
   GET https://www.googleapis.com/youtube/v3/playlistItems
     ?part=contentDetails
     &playlistId={PLAYLIST_ID}
     &maxResults=50
     &key={API_KEY}
   ```
2. **Process Each Video**

- Iterate through video IDs, applying the captions workflow.
- Use concurrency control and exponential backoff to manage quotas.

### 3.4 Caching & Persistence

- **Redis**: Cache full transcript JSON per `videoId`.
- **PostgreSQL**: Store `{ videoId, language, fetchedAt, transcript }` for audit and quick lookup.

---

## 4. Security & Best Practices

- **SOLID / DRY**: Separate API controllers, service logic, caching, and storage layers.
- **KISS / YAGNI**: Begin with caption-based transcription; add STT only if needed.
- **Rate Limiting**: Protect against abuse and quota overruns.
- **Input Validation**: Ensure IDs match `^[A-Za-z0-9_-]{11,}$`.
- **Error Handling**: Gracefully handle 404, 403, and network errors.
- **Secrets Management**: Keep credentials out of code.

---

## 5. Testing & CI/CD

- **Unit Tests**: Mock YouTube API responses.
- **Integration Tests**: Use a test YouTube account with known videos.
- **E2E Tests**: Validate full pipeline including optional STT fallback.
- **CI Pipeline**: Linting, type checks, tests, and automated deploy (e.g., GitHub Actions).

---

## 6. Deployment & Scaling

- **Containerization**: Docker images deployed on Kubernetes or Cloud Run.
- **Observability**:
  - Structured logging (JSON).
  - Metrics (latency, error rates) in Prometheus/Grafana.
  - Alerts on error thresholds or quota issues.
- **Horizontal Scaling**: Stateless API pods; message queue for batch playlist jobs.

---

## 7. Future Enhancements

- **Multi-language Transcripts**: Support `tlang` parameter to translate captions.
- **Speaker Diarization**: Leverage speech‐to‐text speaker labels.
- **User-Supplied OAuth**: Allow private-video access with user tokens.
- **Webhooks**: Notify clients when long-running jobs finish.
