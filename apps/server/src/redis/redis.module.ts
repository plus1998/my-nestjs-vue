import { Global, Inject, Injectable, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { REDIS_CLIENT } from './redis.constants';

@Injectable()
class RedisLifecycleService implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async onApplicationShutdown() {
    if (this.redisClient.status === 'end') {
      return;
    }

    try {
      await this.redisClient.quit();
    } catch {
      this.redisClient.disconnect();
    }
  }
}

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisClient = new Redis({
          host: configService.getOrThrow<string>('REDIS_HOST'),
          port: configService.getOrThrow<number>('REDIS_PORT'),
          username: configService.get<string>('REDIS_USERNAME') || undefined,
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
          db: configService.getOrThrow<number>('REDIS_DB'),
          lazyConnect: false,
        });

        await redisClient.ping();

        return redisClient;
      },
    },
    RedisLifecycleService,
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
