import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  private store = new Map<string, { value: unknown; expires: number }>();

  get<T = unknown>(key: string): T | null {
    const item = this.store.get(key);
    if (!item || Date.now() > item.expires) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  set(key: string, value: unknown, ttlMs: number): void {
    this.store.set(key, { value, expires: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  deleteByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  async query<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number,
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const data = await fetcher();
    this.set(key, data, ttlMs);
    return data;
  }
}
