import type { SessionData, Store } from 'express-session';
import * as session from 'express-session';
import type Redis from 'ioredis';

type DestroyCallback = (error?: unknown) => void;
type GetCallback = (error: unknown, sessionData?: SessionData | null) => void;

interface IoredisSessionStoreOptions {
  client: Redis;
  prefix?: string;
  ttlSeconds?: number | ((sessionData: SessionData) => number);
  disableTouch?: boolean;
}

export class IoredisSessionStore extends session.Store implements Store {
  private readonly client: Redis;
  private readonly disableTouch: boolean;
  private readonly prefix: string;
  private readonly ttlSeconds: number | ((sessionData: SessionData) => number);

  constructor(options: IoredisSessionStoreOptions) {
    super();
    this.client = options.client;
    this.prefix = options.prefix ?? 'sess:';
    this.ttlSeconds = options.ttlSeconds ?? 86400;
    this.disableTouch = options.disableTouch ?? false;
  }

  override get(sessionId: string, callback: GetCallback) {
    void this.readSession(sessionId, callback);
  }

  override set(
    sessionId: string,
    sessionData: SessionData,
    callback?: DestroyCallback,
  ) {
    void this.writeSession(sessionId, sessionData, callback);
  }

  override touch(
    sessionId: string,
    sessionData: SessionData,
    callback?: DestroyCallback,
  ) {
    void this.refreshTtl(sessionId, sessionData, callback);
  }

  override destroy(sessionId: string, callback?: DestroyCallback) {
    void this.deleteSession(sessionId, callback);
  }

  private async deleteSession(sessionId: string, callback?: DestroyCallback) {
    try {
      await this.client.del(this.getKey(sessionId));
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  private getKey(sessionId: string) {
    return `${this.prefix}${sessionId}`;
  }

  private getTtlSeconds(sessionData: SessionData) {
    if (typeof this.ttlSeconds === 'function') {
      return this.ttlSeconds(sessionData);
    }

    const cookieMaxAge = sessionData.cookie?.maxAge;

    if (typeof cookieMaxAge === 'number') {
      return Math.ceil(cookieMaxAge / 1000);
    }

    return this.ttlSeconds;
  }

  private async readSession(sessionId: string, callback: GetCallback) {
    try {
      const payload = await this.client.get(this.getKey(sessionId));

      if (!payload) {
        callback(undefined, null);
        return;
      }

      callback(undefined, JSON.parse(payload) as SessionData);
    } catch (error) {
      callback(error);
    }
  }

  private async refreshTtl(
    sessionId: string,
    sessionData: SessionData,
    callback?: DestroyCallback,
  ) {
    if (this.disableTouch) {
      callback?.();
      return;
    }

    try {
      await this.client.expire(
        this.getKey(sessionId),
        this.getTtlSeconds(sessionData),
      );
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  private async writeSession(
    sessionId: string,
    sessionData: SessionData,
    callback?: DestroyCallback,
  ) {
    const ttlSeconds = this.getTtlSeconds(sessionData);

    if (ttlSeconds <= 0) {
      await this.deleteSession(sessionId, callback);
      return;
    }

    try {
      await this.client.set(
        this.getKey(sessionId),
        JSON.stringify(sessionData),
        'EX',
        ttlSeconds,
      );
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }
}
