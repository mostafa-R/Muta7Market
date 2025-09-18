import logger from "./logger.js";

class MemoryOptimizer {
  constructor() {
    this.gcInterval = null;
    this.memoryThreshold = 150 * 1024 * 1024;
    this.isMonitoring = false;
  }

  initialize() {
    this.startMemoryMonitoring();
    this.setupGarbageCollection();
    this.setupMemoryLeakDetection();

    logger.info("Memory optimizer initialized");
  }

  startMemoryMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    setInterval(() => {
      const memUsage = process.memoryUsage();
      const memoryInMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
      };

      logger.logPerformance("memory_usage", memoryInMB.rss, {
        heap: memoryInMB.heapUsed,
        total: memoryInMB.heapTotal,
        external: memoryInMB.external,
      });

      if (memUsage.rss > this.memoryThreshold) {
        logger.warn("High memory usage detected", {
          current: `${memoryInMB.rss}MB`,
          threshold: `${Math.round(this.memoryThreshold / 1024 / 1024)}MB`,
        });

        this.forceGarbageCollection();
      }
    }, 30000);
  }

  setupGarbageCollection() {
    this.gcInterval = setInterval(() => {
      this.forceGarbageCollection();
    }, 5 * 60 * 1000);
  }

  forceGarbageCollection() {
    if (global.gc) {
      const before = process.memoryUsage().heapUsed;
      global.gc();
      const after = process.memoryUsage().heapUsed;
      const freed = Math.round((before - after) / 1024 / 1024);

      if (freed > 0) {
        logger.info(`Garbage collection freed ${freed}MB`);
      }
    }
  }

  setupMemoryLeakDetection() {
    let baselineMemory = process.memoryUsage().heapUsed;
    let consecutiveHighMemory = 0;

    setInterval(() => {
      const currentMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = currentMemory - baselineMemory;

      if (memoryGrowth > 50 * 1024 * 1024) {
        consecutiveHighMemory++;

        if (consecutiveHighMemory >= 3) {
          logger.error("Potential memory leak detected", {
            baseline: `${Math.round(baselineMemory / 1024 / 1024)}MB`,
            current: `${Math.round(currentMemory / 1024 / 1024)}MB`,
            growth: `${Math.round(memoryGrowth / 1024 / 1024)}MB`,
          });

          baselineMemory = currentMemory;
          consecutiveHighMemory = 0;
        }
      } else {
        consecutiveHighMemory = 0;
        if (Math.abs(memoryGrowth) < 10 * 1024 * 1024) {
          baselineMemory = currentMemory;
        }
      }
    }, 2 * 60 * 1000);
  }

  static optimizeObject(obj) {
    Object.keys(obj).forEach((key) => {
      if (obj[key] === undefined) {
        delete obj[key];
      }
    });
    return obj;
  }

  static processArrayInChunks(array, chunkSize = 100, processor) {
    return new Promise(async (resolve) => {
      const results = [];

      for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        const chunkResults = await processor(chunk);
        results.push(...chunkResults);

        if (i + chunkSize < array.length) {
          await new Promise((resolve) => setImmediate(resolve));
        }
      }

      resolve(results);
    });
  }

  static createMemoryEfficientPagination(query, options = {}) {
    const {
      page = 1,
      limit = 10,
      maxLimit = 100,
      sort = { _id: -1 },
    } = options;

    const actualLimit = Math.min(limit, maxLimit);
    const skip = (page - 1) * actualLimit;

    return {
      ...query,
      skip,
      limit: actualLimit,
      sort,
      lean: true,
    };
  }

  cleanup() {
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
    }
    this.isMonitoring = false;
    logger.info("Memory optimizer cleaned up");
  }

  getMemoryStats() {
    const memUsage = process.memoryUsage();
    return {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
      uptime: `${Math.floor(process.uptime())}s`,
    };
  }
}

export default new MemoryOptimizer();
