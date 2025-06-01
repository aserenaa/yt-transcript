import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  ttl: Number.parseInt(process.env.CACHE_TTL || '3600', 10),
  host: process.env.REDIS_HOST || 'localhost',
  port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
}));
