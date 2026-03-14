import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { config } from '../config';

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(config.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 2 });
    redis.on('error', (err) => console.error('[redis] Cache error:', err.message));
  }
  return redis;
}

// Cache key is derived from the full request URL (path + query params).
// Two requests with identical URLs always get the same cached response.
function buildCacheKey(req: Request): string {
  return `cache:${req.originalUrl}`;
}

export function cacheMiddleware(ttlSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = buildCacheKey(req);

    try {
      const cached = await getRedis().get(key);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Content-Type', 'application/json');
        res.send(cached);
        return;
      }
    } catch {
      // Redis unavailable — fall through to live query, don't crash
    }

    // Intercept res.json to cache the response before sending it
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const serialized = JSON.stringify(body);
        getRedis()
          .set(key, serialized, 'EX', ttlSeconds)
          .catch(() => {}); // fire-and-forget, never block the response
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await getRedis().keys(`cache:${pattern}`);
    if (keys.length > 0) await getRedis().del(...keys);
  } catch {
    // Non-fatal
  }
}
