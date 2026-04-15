import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';

import { AppModule } from './app.module';
import { IoredisSessionStore } from './auth/stores/ioredis-session.store';
import { REDIS_CLIENT } from './redis/redis.constants';
import type Redis from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableShutdownHooks();
  const configService = app.get(ConfigService);
  const redisClient = app.get<Redis>(REDIS_CLIENT);
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const sessionSecret = configService.getOrThrow<string>('SESSION_SECRET');
  const sessionCookieName =
    configService.getOrThrow<string>('SESSION_COOKIE_NAME');
  const sessionMaxAgeDays =
    configService.get<number>('SESSION_MAX_AGE_DAYS') ?? 7;
  const sessionMaxAgeMs = sessionMaxAgeDays * 24 * 60 * 60 * 1000;

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.use(
    session({
      name: sessionCookieName,
      secret: sessionSecret,
      store: new IoredisSessionStore({
        client: redisClient,
        ttlSeconds: Math.ceil(sessionMaxAgeMs / 1000),
      }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        maxAge: sessionMaxAgeMs,
      },
    }),
  );
  if (isProduction) {
    app.set('trust proxy', 1);
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(configService.get<number>('PORT') ?? 3000);
}

void bootstrap();
