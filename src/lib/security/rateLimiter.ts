export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  timestamps: number[];
}

export class RateLimiter {
  private cache = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.cache.get(key) || { timestamps: [] };
    const cutoff = now - this.config.windowMs;
    entry.timestamps = entry.timestamps.filter((time) => time > cutoff);

    if (entry.timestamps.length >= this.config.maxRequests) {
      this.cache.set(key, entry);
      return false;
    }

    entry.timestamps.push(now);
    this.cache.set(key, entry);
    return true;
  }

  getRemaining(key: string): number {
    const entry = this.cache.get(key);
    if (!entry) return this.config.maxRequests;
    return Math.max(this.config.maxRequests - entry.timestamps.length, 0);
  }

  reset(key: string) {
    this.cache.delete(key);
  }
}
