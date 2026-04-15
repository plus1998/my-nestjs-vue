import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as session from 'express-session';
import Redis from 'ioredis';

import { AppModule } from './app.module';
import { IoredisSessionStore } from './auth/stores/ioredis-session.store';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const redisClient = new Redis({
    host: configService.getOrThrow<string>('REDIS_HOST'),
    port: configService.getOrThrow<number>('REDIS_PORT'),
    username: configService.get<string>('REDIS_USERNAME') || undefined,
    password: configService.get<string>('REDIS_PASSWORD') || undefined,
    db: configService.getOrThrow<number>('REDIS_DB'),
    lazyConnect: false,
  });
  const sessionSecret = configService.getOrThrow<string>('SESSION_SECRET');
  const sessionCookieName =
    configService.getOrThrow<string>('SESSION_COOKIE_NAME');
  const sessionMaxAgeDays =
    configService.get<number>('SESSION_MAX_AGE_DAYS') ?? 7;
  const sessionMaxAgeMs = sessionMaxAgeDays * 24 * 60 * 60 * 1000;

  await redisClient.ping();

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
