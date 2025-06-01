# YouTube Transcript API

A modern, high-performance API for retrieving YouTube video transcripts and metadata, built with NestJS.

## Features

- Fetch transcripts from YouTube videos
- Redis caching for improved performance
- Configurable proxy support for handling rate limits
- Docker and Docker Compose support for easy deployment
- Comprehensive test coverage

## Prerequisites

- Node.js 18+ (22.x recommended)
- PNPM package manager
- Redis (for caching)

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install
```

### Configuration

Copy the example environment file and adjust as needed:

```bash
cp .env.example .env
```

Key configuration options:

- `PORT`: The port on which the API will run
- `REDIS_HOST`: Redis server hostname
- `REDIS_PORT`: Redis server port
- `REDIS_TTL_SECONDS`: Cache TTL in seconds
- `HTTP_PROXY`: (Optional) Proxy for YouTube requests
- `YOUTUBE_PROXY_URL`: (Optional) Specific proxy for YouTube

### Development

```bash
# Start in development mode
pnpm start:dev

# Start in debug mode
pnpm start:debug
```

### Production

```bash
# Build the application
pnpm build

# Start in production mode
pnpm start:prod
```

## Docker Deployment

The project includes Docker and Docker Compose configurations for easy deployment:

```bash
# Start with Docker Compose
docker-compose up -d
```

This will start both the API and Redis services.

## Testing

```bash
# Run unit tests
pnpm test

# Run e2e tests
pnpm test:e2e

# Generate test coverage
pnpm test:cov
```

## Code Quality

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

## API Documentation

[API documentation will be available here]

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is [UNLICENSED](LICENSE).
