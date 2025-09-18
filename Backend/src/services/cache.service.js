import { createClient } from "redis";
import logger from "../utils/logger.js";

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isConnecting = false;
  }

  async connect() {
    if (this.isConnected || this.isConnecting) {
      return this.client;
    }

    this.isConnecting = true;

    try {
      const redisUrl = process.env.REDIS_URL;

      if (!redisUrl) {
        logger.warn("Redis URL not configured. Caching will be disabled.");
        this.isConnecting = false;
        return null;
      }

      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000,
          commandTimeout: 3000,
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
      return this.client;
    } catch (error) {
      logger.error("Failed to connect to Redis:", error);
      this.isConnected = false;
      this.isConnecting = false;
      return null;
    }
  }

  async get(key) {
    try {
      if (!this.isConnected || !this.client) {
        return null;
      }

      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache DEL error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async keys(pattern) {
    try {
      if (!this.isConnected || !this.client) {
        return [];
      }

      return await this.client.keys(pattern);
    } catch (error) {
      logger.error(`Cache KEYS error for pattern ${pattern}:`, error);
      return [];
    }
  }

  async flush() {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      await this.client.flushAll();
      return true;
    } catch (error) {
      logger.error("Cache FLUSH error:", error);
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.disconnect();
        this.isConnected = false;
        logger.info("Redis client disconnected");
      }
    } catch (error) {
      logger.error("Error disconnecting Redis client:", error);
    }
  }

  generateAnalyticsCacheKey(type, params = {}) {
    const paramsString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join("|");

    return `analytics:${type}${paramsString ? `:${paramsString}` : ""}`;
  }

  async getAnalyticsData(type, params = {}) {
    const key = this.generateAnalyticsCacheKey(type, params);
    return await this.get(key);
  }

  async setAnalyticsData(type, params = {}, data, ttl = 300) {
    const key = this.generateAnalyticsCacheKey(type, params);
    return await this.set(key, data, ttl);
  }

  async invalidateAnalyticsCache(pattern = "analytics:*") {
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.info(`Invalidated ${keys.length} analytics cache keys`);
      }
      return true;
    } catch (error) {
      logger.error("Error invalidating analytics cache:", error);
      return false;
    }
  }
}

const cacheService = new CacheService();

cacheService.connect().catch((error) => {
  logger.error("Failed to initialize cache service:", error);
});

export default cacheService;
