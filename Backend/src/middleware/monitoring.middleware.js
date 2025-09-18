import logger from "../utils/logger.js";

export const requestTimer = (req, res, next) => {
  const startTime = Date.now();

  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - startTime;

    logger.logRequest(req, res, duration);

    if (duration > 2000) {
      logger.logPerformance("slow_request", duration, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        userAgent: req.get("User-Agent"),
        userId: req.user?.id || null,
      });
    }

    originalEnd.apply(res, args);
  };

  next();
};

export const errorMonitoring = (err, req, res, next) => {
  logger.logError(err, {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    userId: req.user?.id || null,
    body: process.env.NODE_ENV === "development" ? req.body : undefined,
  });

  if (err.statusCode === 401 || err.statusCode === 403) {
    logger.logSecurity("unauthorized_access", {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId: req.user?.id || null,
      error: err.message,
    });
  }

  next(err);
};

class MetricsCollector {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      errorCount: 0,
      responseTimeSum: 0,
      statusCodes: {},
      endpoints: {},
      lastReset: Date.now(),
    };
  }

  record(req, res, duration) {
    this.metrics.totalRequests++;
    this.metrics.responseTimeSum += duration;

    const statusCode = res.statusCode;
    this.metrics.statusCodes[statusCode] =
      (this.metrics.statusCodes[statusCode] || 0) + 1;

    if (statusCode >= 400) {
      this.metrics.errorCount++;
    }

    const endpoint = `${req.method} ${req.route?.path || req.originalUrl}`;
    if (!this.metrics.endpoints[endpoint]) {
      this.metrics.endpoints[endpoint] = {
        count: 0,
        totalDuration: 0,
        errors: 0,
      };
    }
    this.metrics.endpoints[endpoint].count++;
    this.metrics.endpoints[endpoint].totalDuration += duration;
    if (statusCode >= 400) {
      this.metrics.endpoints[endpoint].errors++;
    }
  }

  getMetrics() {
    const avgResponseTime =
      this.metrics.totalRequests > 0
        ? Math.round(this.metrics.responseTimeSum / this.metrics.totalRequests)
        : 0;

    const errorRate =
      this.metrics.totalRequests > 0
        ? (
            (this.metrics.errorCount / this.metrics.totalRequests) *
            100
          ).toFixed(2)
        : "0.00";

    const topEndpoints = Object.entries(this.metrics.endpoints)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([endpoint, stats]) => ({
        endpoint,
        requests: stats.count,
        avgDuration: Math.round(stats.totalDuration / stats.count),
        errorRate: ((stats.errors / stats.count) * 100).toFixed(2),
      }));

    return {
      summary: {
        totalRequests: this.metrics.totalRequests,
        errorCount: this.metrics.errorCount,
        errorRate: `${errorRate}%`,
        avgResponseTime: `${avgResponseTime}ms`,
        uptime: Math.floor((Date.now() - this.metrics.lastReset) / 1000),
      },
      statusCodes: this.metrics.statusCodes,
      topEndpoints,
      collectedAt: new Date().toISOString(),
    };
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      errorCount: 0,
      responseTimeSum: 0,
      statusCodes: {},
      endpoints: {},
      lastReset: Date.now(),
    };
  }
}

export const metricsCollector = new MetricsCollector();

export const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();

  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - startTime;
    metricsCollector.record(req, res, duration);
    originalEnd.apply(res, args);
  };

  next();
};

export const healthChecks = {
  async database() {
    try {
      const mongoose = await import("mongoose");
      if (mongoose.connection.readyState === 1) {
        return { status: "healthy", message: "Connected to MongoDB" };
      } else {
        return { status: "unhealthy", message: "MongoDB not connected" };
      }
    } catch (error) {
      return { status: "unhealthy", message: error.message };
    }
  },

  async redis() {
    try {
      const cacheService = (await import("../services/cache.service.js"))
        .default;
      if (cacheService.isConnected) {
        return { status: "healthy", message: "Redis connected" };
      } else {
        return { status: "unhealthy", message: "Redis not connected" };
      }
    } catch (error) {
      return { status: "unhealthy", message: error.message };
    }
  },

  async storage() {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const { fileURLToPath } = await import("url");
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      const uploadsDir = path.join(__dirname, "../../uploads");
      await fs.access(uploadsDir, fs.constants.R_OK | fs.constants.W_OK);
      return { status: "healthy", message: "Uploads directory accessible" };
    } catch (error) {
      return {
        status: "unhealthy",
        message: `Storage error: ${error.message}`,
      };
    }
  },

  async externalServices() {
    const checks = {};

    if (
      process.env.GOOGLE_CLIENT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GA_PROPERTY_ID
    ) {
      checks.googleAnalytics = {
        status: "configured",
        message: "Google Analytics configured",
      };
    } else {
      checks.googleAnalytics = {
        status: "not_configured",
        message: "Google Analytics not configured",
      };
    }

    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      checks.emailService = {
        status: "configured",
        message: "Email service configured",
      };
    } else {
      checks.emailService = {
        status: "not_configured",
        message: "Email service not configured",
      };
    }

    if (process.env.PAYLINK_API_ID && process.env.PAYLINK_SECRET) {
      checks.paymentGateway = {
        status: "configured",
        message: "Payment gateway configured",
      };
    } else {
      checks.paymentGateway = {
        status: "not_configured",
        message: "Payment gateway not configured",
      };
    }

    return checks;
  },

  memory() {
    const used = process.memoryUsage();
    const total = Math.round(used.rss / 1024 / 1024);
    const heap = Math.round(used.heapUsed / 1024 / 1024);

    const status = total > 512 ? "warning" : "healthy";

    return {
      status,
      message: `Memory usage: ${total}MB (Heap: ${heap}MB)`,
      details: {
        rss: `${total}MB`,
        heapUsed: `${heap}MB`,
        heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(used.external / 1024 / 1024)}MB`,
      },
    };
  },
};
