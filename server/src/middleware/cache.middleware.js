import { cacheGet, cacheSet, cacheDel } from '../config/redis.js';
import crypto from 'crypto';

export function cacheMiddleware(ttlSeconds = 300, keyFn = null) {
  return async (req, res, next) => {
    if (req.method !== 'GET' || req.user) return next();

    const key = keyFn ? keyFn(req) : `cache:${req.originalUrl}`;
    const cacheKey = `cache:${crypto.createHash('md5').update(key).digest('hex')}`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached !== null) {
        return res.status(200).json(cached);
      }
    } catch {
      /* fall through */
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheSet(cacheKey, body, ttlSeconds).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
}

export function invalidateCache(pattern) {
  return cacheDel(pattern);
}

export function makeCacheKey(prefix, req) {
  return `${prefix}:${req.originalUrl}`;
}
