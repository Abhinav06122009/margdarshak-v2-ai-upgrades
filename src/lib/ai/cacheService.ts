interface CacheEntry {
  value: string;
  timestamp: number;
  ttl: number;
}

const CACHE_KEY_PREFIX = 'margdarshak_ai_cache_';
const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

export const cacheService = {
  get: (key: string): string | null => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + key);
      if (!raw) return null;
      const entry: CacheEntry = JSON.parse(raw);
      if (Date.now() - entry.timestamp > entry.ttl) {
        sessionStorage.removeItem(CACHE_KEY_PREFIX + key);
        return null;
      }
      return entry.value;
    } catch {
      return null;
    }
  },

  set: (key: string, value: string, ttl: number = DEFAULT_TTL): void => {
    try {
      const entry: CacheEntry = { value, timestamp: Date.now(), ttl };
      sessionStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Storage full - clear old entries
      try {
        const keysToRemove = Object.keys(sessionStorage).filter(k =>
          k.startsWith(CACHE_KEY_PREFIX)
        );
        keysToRemove.forEach(k => sessionStorage.removeItem(k));
        const entry: CacheEntry = { value, timestamp: Date.now(), ttl };
        sessionStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
      } catch { /* ignore */ }
    }
  },

  buildKey: (...parts: string[]): string => {
    return parts.map(p => p.substring(0, 50)).join('_').replace(/\s+/g, '_');
  },

  clear: (): void => {
    const keysToRemove = Object.keys(sessionStorage).filter(k =>
      k.startsWith(CACHE_KEY_PREFIX)
    );
    keysToRemove.forEach(k => sessionStorage.removeItem(k));
  },
};

export default cacheService;
