import { createClient } from 'redis';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let client = null;
let isAvailable = false;

export async function initRedis() {
  if (!config.redis.enabled) {
    logger.info('Redis disabled — running without cache/socket scaling');
    return null;
  }

  try {
    client = createClient({ url: config.redis.url, socket: { connectTimeout: 5000 } });
    client.on('error', (err) => {
      isAvailable = false;
      logger.warn('Redis error (cache will be bypassed):', err.message);
    });
    await client.connect();
    isAvailable = true;
    logger.info('Redis connected ✅');
  } catch (err) {
    isAvailable = false;
    logger.warn('Redis unavailable — falling back to in-memory/no caching:', err.message);
  }
  return client;
}

export function getRedis() {
  return isAvailable ? client : null;
}

export function isRedisReady() {
  return isAvailable && !!client;
}

export async function closeRedis() {
  if (client && isAvailable) {
    try {
      await client.quit();
    } catch {
      /* noop */
    }
  }
  client = null;
  isAvailable = false;
}

export async function cacheGet(key) {
  if (!isRedisReady()) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    logger.warn('Cache get failed:', err.message);
    return null;
  }
}

export async function cacheSet(key, value, ttlSeconds = 300) {
  if (!isRedisReady()) return;
  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    logger.warn('Cache set failed:', err.message);
  }
}

export async function cacheDel(pattern) {
  if (!isRedisReady()) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length) await client.del(keys);
  } catch (err) {
    logger.warn('Cache del failed:', err.message);
  }
}
