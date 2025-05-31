import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfg = app.get(ConfigService);
  const port = cfg.get<number>('PORT') ?? 3000;
  await app.listen(port);
  console.warn(`🚀 Listening on port ${port}`);
}
bootstrap();
