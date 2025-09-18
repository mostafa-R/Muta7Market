import mongoose from "mongoose";
import enhancedCacheService from "../services/cache.service.js";
import logger from "../utils/logger.js";
import memoryOptimizer from "../utils/memoryOptimizer.js";

class HealthMonitoringService {
  constructor() {
    this.healthChecks = new Map();
    this.alertThresholds = {
      memory: 400 * 1024 * 1024,
      responseTime: 5000,
      errorRate: 10,
      cacheHitRate: 50,
      minRequestsForAlert: 200,
    };
    this.metrics = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0,
      slowRequests: 0,
    };
    this.isMonitoring = false;
    this.alertHistory = new Map();
  }

  initialize() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.setupHealthChecks();
    this.startPeriodicHealthCheck();
    this.setupAlerts();

    logger.info("Health monitoring system initialized");
  }

  setupHealthChecks() {
    this.healthChecks.set("database", async () => {
      try {
        const state = mongoose.connection.readyState;
        const isConnected = state === 1;

        if (isConnected) {
          await mongoose.connection.db.admin().ping();
          return {
            status: "healthy",
            message: "Database connected and responsive",
            details: {
              state: this.getMongooseStateText(state),
              host: mongoose.connection.host,
              port: mongoose.connection.port,
              name: mongoose.connection.name,
            },
          };
        } else {
          return {
            status: "unhealthy",
            message: `Database connection state: ${this.getMongooseStateText(
              state
            )}`,
            details: { state },
          };
        }
      } catch (error) {
        return {
          status: "unhealthy",
          message: `Database health check failed: ${error.message}`,
          details: { error: error.message },
        };
      }
    });

    this.healthChecks.set("cache", async () => {
      try {
        const cacheHealth = enhancedCacheService.getCacheHealth();

        if (cacheHealth.redis.connected) {
          const testKey = "health_check_" + Date.now();
          const testValue = { timestamp: Date.now() };

          await enhancedCacheService.set(testKey, testValue, 10);
          const retrieved = await enhancedCacheService.get(testKey);

          if (retrieved && retrieved.timestamp === testValue.timestamp) {
            await enhancedCacheService.del(testKey);
            return {
              status: "healthy",
              message: "Cache is working properly",
              details: cacheHealth,
            };
          } else {
            return {
              status: "degraded",
              message: "Cache read/write test failed",
              details: cacheHealth,
            };
          }
        } else {
          return {
            status: "unhealthy",
            message: "Cache is not connected",
            details: cacheHealth,
          };
        }
      } catch (error) {
        return {
          status: "unhealthy",
          message: `Cache health check failed: ${error.message}`,
          details: { error: error.message },
        };
      }
    });

    this.healthChecks.set("memory", async () => {
      try {
        const memStats = memoryOptimizer.getMemoryStats();
        const memoryUsage = process.memoryUsage();
        const rssBytes = memoryUsage.rss;

        let status = "healthy";
        let message = "Memory usage is normal";

        if (rssBytes > this.alertThresholds.memory * 1.5) {
          status = "critical";
          message = "Memory usage is critically high";
        } else if (rssBytes > this.alertThresholds.memory) {
          status = "warning";
          message = "Memory usage is high";
        }

        return {
          status,
          message,
          details: {
            ...memStats,
            threshold: `${Math.round(
              this.alertThresholds.memory / 1024 / 1024
            )}MB`,
          },
        };
      } catch (error) {
        return {
          status: "unhealthy",
          message: `Memory health check failed: ${error.message}`,
          details: { error: error.message },
        };
      }
    });

    this.healthChecks.set("disk", async () => {
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const { fileURLToPath } = await import("url");

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const uploadsDir = path.join(__dirname, "../../uploads");
        const logsDir = path.join(__dirname, "../../logs");

        await fs.access(uploadsDir, fs.constants.R_OK | fs.constants.W_OK);
        await fs.access(logsDir, fs.constants.R_OK | fs.constants.W_OK);

        return {
          status: "healthy",
          message: "Disk access is working properly",
          details: {
            uploadsDir: "accessible",
            logsDir: "accessible",
          },
        };
      } catch (error) {
        return {
          status: "unhealthy",
          message: `Disk health check failed: ${error.message}`,
          details: { error: error.message },
        };
      }
    });

    this.healthChecks.set("external_services", async () => {
      const services = {};

      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        services.email = {
          status: "configured",
          message: "Email service is configured",
        };
      } else {
        services.email = {
          status: "not_configured",
          message: "Email service not configured",
        };
      }

      if (process.env.PAYLINK_API_ID && process.env.PAYLINK_SECRET) {
        services.payment = {
          status: "configured",
          message: "Payment gateway is configured",
        };
      } else {
        services.payment = {
          status: "not_configured",
          message: "Payment gateway not configured",
        };
      }

      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        services.cloudinary = {
          status: "configured",
          message: "Cloudinary is configured",
        };
      } else {
        services.cloudinary = {
          status: "not_configured",
          message: "Cloudinary not configured",
        };
      }

      const allConfigured = Object.values(services).every(
        (s) => s.status === "configured"
      );

      return {
        status: allConfigured ? "healthy" : "warning",
        message: allConfigured
          ? "All external services configured"
          : "Some external services not configured",
        details: services,
      };
    });
  }

  startPeriodicHealthCheck() {
    setInterval(async () => {
      try {
        const healthReport = await this.runFullHealthCheck();
        this.evaluateHealthStatus(healthReport);
      } catch (error) {
        logger.error("Periodic health check failed:", error);
      }
    }, 5 * 60 * 1000);
  }

  setupAlerts() {
    setInterval(() => {
      this.checkMetricsAndAlert();

      const timeSinceLastReset = Date.now() - (this.lastResetTime || 0);
      const shouldReset =
        this.metrics.requests >= this.alertThresholds.minRequestsForAlert ||
        timeSinceLastReset > 10 * 60 * 1000;

      if (shouldReset) {
        logger.debug(
          `Resetting metrics: ${this.metrics.requests} requests processed`
        );
        this.resetMetrics();
        this.lastResetTime = Date.now();
      }
    }, 60 * 1000);
  }

  async runFullHealthCheck() {
    const results = {};
    const startTime = Date.now();

    for (const [name, checkFn] of this.healthChecks.entries()) {
      try {
        const checkStart = Date.now();
        results[name] = await checkFn();
        results[name].responseTime = Date.now() - checkStart;
      } catch (error) {
        results[name] = {
          status: "error",
          message: `Health check failed: ${error.message}`,
          details: { error: error.message },
          responseTime: Date.now() - checkStart,
        };
      }
    }

    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      totalCheckTime: Date.now() - startTime,
      checks: results,
      overall: this.calculateOverallStatus(results),
    };
  }

  calculateOverallStatus(results) {
    const statuses = Object.values(results).map((r) => r.status);

    if (statuses.includes("critical") || statuses.includes("error")) {
      return "critical";
    } else if (statuses.includes("unhealthy")) {
      return "unhealthy";
    } else if (statuses.includes("warning") || statuses.includes("degraded")) {
      return "warning";
    } else {
      return "healthy";
    }
  }

  evaluateHealthStatus(healthReport) {
    const { overall, checks } = healthReport;

    if (overall === "critical") {
      logger.error("CRITICAL: System health is critical", { healthReport });
    } else if (overall === "unhealthy") {
      logger.error("UNHEALTHY: System health is degraded", { healthReport });
    } else if (overall === "warning") {
      logger.warn("WARNING: System health has warnings", { healthReport });
    } else {
      logger.info("System health is good", {
        overall,
        checkCount: Object.keys(checks).length,
        totalTime: healthReport.totalCheckTime,
      });
    }
  }

  checkMetricsAndAlert() {
    const { requests, errors, totalResponseTime, slowRequests } = this.metrics;

    if (requests < this.alertThresholds.minRequestsForAlert) {
      logger.debug(
        `Insufficient data for alerts: ${requests}/${this.alertThresholds.minRequestsForAlert} requests`
      );
      return;
    }

    const errorRate = (errors / requests) * 100;
    const avgResponseTime = totalResponseTime / requests;
    const slowRequestRate = (slowRequests / requests) * 100;

    if (errorRate > this.alertThresholds.errorRate) {
      const alertKey = "error_rate";
      if (this.shouldSendAlert(alertKey)) {
        logger.error("HIGH ERROR RATE ALERT", {
          errorRate: `${errorRate.toFixed(2)}%`,
          threshold: `${this.alertThresholds.errorRate}%`,
          totalRequests: requests,
          totalErrors: errors,
          sampleSize: `${requests} requests`,
          confidence: this.calculateConfidence(requests),
        });
        this.recordAlert(alertKey);
      }
    }

    if (avgResponseTime > this.alertThresholds.responseTime) {
      const alertKey = "response_time";
      if (this.shouldSendAlert(alertKey)) {
        logger.warn("HIGH RESPONSE TIME ALERT", {
          avgResponseTime: `${avgResponseTime.toFixed(0)}ms`,
          threshold: `${this.alertThresholds.responseTime}ms`,
          slowRequestRate: `${slowRequestRate.toFixed(2)}%`,
          totalRequests: requests,
          sampleSize: `${requests} requests`,
          confidence: this.calculateConfidence(requests),
        });
        this.recordAlert(alertKey);
      }
    }

    logger.info("Performance metrics summary", {
      requests,
      errors,
      errorRate: `${errorRate.toFixed(2)}%`,
      avgResponseTime: `${avgResponseTime.toFixed(0)}ms`,
      slowRequests,
      slowRequestRate: `${slowRequestRate.toFixed(2)}%`,
      sampleSize: `${requests} requests`,
      confidence: this.calculateConfidence(requests),
      threshold: `${this.alertThresholds.minRequestsForAlert} min requests`,
    });
  }

  resetMetrics() {
    this.metrics = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0,
      slowRequests: 0,
    };
  }

  calculateConfidence(requests) {
    if (requests >= 1000) return "high";
    if (requests >= 500) return "medium";
    if (requests >= 100) return "low";
    return "very_low";
  }

  shouldSendAlert(alertKey) {
    const now = Date.now();
    const lastAlert = this.alertHistory.get(alertKey);
    const cooldownPeriod = 5 * 60 * 1000;

    if (!lastAlert || now - lastAlert > cooldownPeriod) {
      return true;
    }
    return false;
  }

  recordAlert(alertKey) {
    this.alertHistory.set(alertKey, Date.now());
  }

  recordRequest(duration, isError = false) {
    this.metrics.requests++;
    this.metrics.totalResponseTime += duration;

    if (isError) {
      this.metrics.errors++;
    }

    if (duration > this.alertThresholds.responseTime) {
      this.metrics.slowRequests++;
    }

    if (this.metrics.requests % 50 === 0) {
      logger.debug(
        `Request milestone: ${this.metrics.requests} requests processed`
      );
    }
  }
  getMongooseStateText(state) {
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
      4: "unauthorized",
      99: "uninitialized",
    };
    return states[state] || "unknown";
  }

  async getHealthStatus() {
    return await this.runFullHealthCheck();
  }

  getDetailedMetrics() {
    const { requests, errors, totalResponseTime, slowRequests } = this.metrics;

    return {
      current: {
        requests,
        errors,
        totalResponseTime,
        slowRequests,
        avgResponseTime: requests > 0 ? totalResponseTime / requests : 0,
        errorRate: requests > 0 ? (errors / requests) * 100 : 0,
        slowRequestRate: requests > 0 ? (slowRequests / requests) * 100 : 0,
        confidence: this.calculateConfidence(requests),
        hasEnoughData: requests >= this.alertThresholds.minRequestsForAlert,
      },
      thresholds: {
        minRequestsForAlert: this.alertThresholds.minRequestsForAlert,
        errorRateThreshold: this.alertThresholds.errorRate,
        responseTimeThreshold: this.alertThresholds.responseTime,
      },
      alertHistory: Object.fromEntries(this.alertHistory),
      lastReset: this.lastResetTime
        ? new Date(this.lastResetTime).toISOString()
        : null,
    };
  }

  cleanup() {
    this.isMonitoring = false;
    this.healthChecks.clear();
    logger.info("Health monitoring system cleaned up");
  }
}

const healthMonitoring = new HealthMonitoringService();

export const healthMetricsMiddleware = (req, res, next) => {
  const startTime = Date.now();

  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - startTime;
    const isError = res.statusCode >= 400;

    healthMonitoring.recordRequest(duration, isError);
    originalEnd.apply(res, args);
  };

  next();
};

export default healthMonitoring;
