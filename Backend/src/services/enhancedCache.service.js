import { createClient } from "redis";
import logger from "../utils/logger.js";

class EnhancedCacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.localCache = new Map();
    this.localCacheMaxSize = 1000;
    this.hitStats = {
      redis: 0,
      local: 0,
      miss: 0,
    };
  }

  async connect() {
    if (this.isConnected || this.isConnecting) {
      return this.client;
    }

    this.isConnecting = true;

    try {
      const redisUrl = process.env.REDIS_URL;

      if (!redisUrl) {
        logger.warn("Redis URL not configured. Using local cache only.");
        this.isConnecting = false;
        return null;
      }

      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000,
          commandTimeout: 3000,
          reconnectStrategy: (retries) => {
            if (retries > 10) return false;
            return Math.min(retries * 50, 1000);
          },
        },
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
      });

      this.client.on("error", (err) => {
        logger.error("Redis Client Error:", err);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        logger.info("Redis client connected");
      });

      this.client.on("ready", () => {
        logger.info("Redis client ready");
        this.isConnected = true;
        this.isConnecting = false;
      });

      this.client.on("end", () => {
        logger.warn("Redis client disconnected");
        this.isConnected = false;
      });

      await this.client.connect();

      this.setupCacheCleanup();

      return this.client;
    } catch (error) {
      logger.error("Failed to connect to Redis:", error);
      this.isConnected = false;
      this.isConnecting = false;
      return null;
    }
  }

  async get(key, options = {}) {
    const { useLocalCache = true, parseJson = true } = options;

    try {
      if (useLocalCache && this.localCache.has(key)) {
        this.hitStats.local++;
        const cachedItem = this.localCache.get(key);

        if (!cachedItem.expiresAt || cachedItem.expiresAt > Date.now()) {
          return parseJson
            ? cachedItem.value
            : JSON.stringify(cachedItem.value);
        } else {
          this.localCache.delete(key);
        }
      }

      if (!this.isConnected || !this.client) {
        this.hitStats.miss++;
        return null;
      }

      const value = await this.client.get(key);
      if (value) {
        this.hitStats.redis++;
        const parsedValue = parseJson ? JSON.parse(value) : value;

        if (useLocalCache) {
          this.setLocalCache(key, parsedValue);
        }

        return parsedValue;
      }

      this.hitStats.miss++;
      return null;
    } catch (error) {
      logger.error(`Enhanced cache GET error for key ${key}:`, error);
      this.hitStats.miss++;
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300, options = {}) {
    const { useLocalCache = true, priority = "normal" } = options;

    try {
      if (this.isConnected && this.client) {
        await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      }

      if (useLocalCache && (priority === "high" || priority === "critical")) {
        this.setLocalCache(key, value, ttlSeconds * 1000);
      }

      return true;
    } catch (error) {
      logger.error(`Enhanced cache SET error for key ${key}:`, error);
      return false;
    }
  }

  setLocalCache(key, value, ttlMs = 300000) {
    if (this.localCache.size >= this.localCacheMaxSize) {
      const oldestKey = this.localCache.keys().next().value;
      this.localCache.delete(oldestKey);
    }

    this.localCache.set(key, {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : null,
      createdAt: Date.now(),
    });
  }

  async mget(keys, options = {}) {
    if (!keys || keys.length === 0) return {};

    try {
      const results = {};
      const redisKeys = [];

      if (options.useLocalCache !== false) {
        for (const key of keys) {
          const localValue = await this.get(key, { useLocalCache: true });
          if (localValue !== null) {
            results[key] = localValue;
          } else {
            redisKeys.push(key);
          }
        }
      } else {
        redisKeys.push(...keys);
      }

      if (redisKeys.length > 0 && this.isConnected && this.client) {
        const redisValues = await this.client.mGet(redisKeys);

        redisKeys.forEach((key, index) => {
          const value = redisValues[index];
          if (value) {
            try {
              results[key] = JSON.parse(value);
            } catch {
              results[key] = value;
            }
          }
        });
      }

      return results;
    } catch (error) {
      logger.error("Batch get error:", error);
      return {};
    }
  }

  async mset(keyValuePairs, ttlSeconds = 300) {
    if (!keyValuePairs || Object.keys(keyValuePairs).length === 0) {
      return false;
    }

    try {
      if (this.isConnected && this.client) {
        const pipeline = this.client.multi();

        Object.entries(keyValuePairs).forEach(([key, value]) => {
          pipeline.setEx(key, ttlSeconds, JSON.stringify(value));
        });

        await pipeline.exec();
      }

      return true;
    } catch (error) {
      logger.error("Batch set error:", error);
      return false;
    }
  }

  async invalidatePattern(pattern, options = {}) {
    const { includeLocal = true } = options;

    try {
      let deletedCount = 0;

      if (this.isConnected && this.client) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
          deletedCount += keys.length;
        }
      }

      if (includeLocal) {
        const regex = new RegExp(pattern.replace(/\*/g, ".*"));
        for (const key of this.localCache.keys()) {
          if (regex.test(key)) {
            this.localCache.delete(key);
            deletedCount++;
          }
        }
      }

      logger.info(
        `Invalidated ${deletedCount} cache keys with pattern: ${pattern}`
      );
      return deletedCount;
    } catch (error) {
      logger.error("Pattern invalidation error:", error);
      return 0;
    }
  }

  setupCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;

      for (const [key, item] of this.localCache.entries()) {
        if (item.expiresAt && item.expiresAt < now) {
          this.localCache.delete(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        logger.info(`Cleaned ${cleanedCount} expired local cache entries`);
      }
    }, 5 * 60 * 1000);

    setInterval(() => {
      this.logCacheStats();
    }, 10 * 60 * 1000);
  }

  logCacheStats() {
    const total =
      this.hitStats.redis + this.hitStats.local + this.hitStats.miss;
    if (total === 0) return;

    const stats = {
      redisHitRate: ((this.hitStats.redis / total) * 100).toFixed(2),
      localHitRate: ((this.hitStats.local / total) * 100).toFixed(2),
      missRate: ((this.hitStats.miss / total) * 100).toFixed(2),
      totalRequests: total,
      localCacheSize: this.localCache.size,
    };

    logger.info("Cache performance stats", stats);

    this.hitStats = { redis: 0, local: 0, miss: 0 };
  }

  async getWithFallback(key, fallbackFn, ttl = 300, options = {}) {
    const { priority = "normal", forceRefresh = false } = options;

    if (!forceRefresh) {
      const cached = await this.get(key, {
        useLocalCache: priority === "high",
      });
      if (cached !== null) {
        return cached;
      }
    }

    try {
      const data = await fallbackFn();
      if (data !== null && data !== undefined) {
        await this.set(key, data, ttl, {
          priority,
          useLocalCache: priority === "high",
        });
      }
      return data;
    } catch (error) {
      logger.error(`Fallback function error for key ${key}:`, error);
      return null;
    }
  }

  async warmCache(warmingFunctions) {
    logger.info("Starting cache warming...");

    const results = await Promise.allSettled(
      warmingFunctions.map(async ({ key, fn, ttl, priority }) => {
        try {
          const data = await fn();
          await this.set(key, data, ttl, { priority });
          return { key, success: true };
        } catch (error) {
          logger.error(`Cache warming failed for ${key}:`, error);
          return { key, success: false, error: error.message };
        }
      })
    );

    const successful = results.filter((r) => r.value?.success).length;
    logger.info(
      `Cache warming completed: ${successful}/${warmingFunctions.length} successful`
    );

    return results;
  }

  getCacheHealth() {
    return {
      redis: {
        connected: this.isConnected,
        client: !!this.client,
      },
      local: {
        size: this.localCache.size,
        maxSize: this.localCacheMaxSize,
        utilizationPercent: (
          (this.localCache.size / this.localCacheMaxSize) *
          100
        ).toFixed(2),
      },
      stats: this.hitStats,
    };
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.disconnect();
        this.isConnected = false;
        logger.info("Enhanced cache service disconnected");
      }

      this.localCache.clear();
    } catch (error) {
      logger.error("Error disconnecting cache service:", error);
    }
  }
}

const enhancedCacheService = new EnhancedCacheService();

enhancedCacheService.connect().catch((error) => {
  logger.error("Failed to initialize enhanced cache service:", error);
});

export default enhancedCacheService;
