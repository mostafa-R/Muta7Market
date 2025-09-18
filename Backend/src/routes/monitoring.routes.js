import { Router } from "express";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";
import {
  healthChecks,
  metricsCollector,
} from "../middleware/monitoring.middleware.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";

const router = Router();

/**
 * @route
 * @desc
 * @access
 */
router.get(
  "/health",
  asyncHandler(async (req, res) => {
    const startTime = Date.now();

    try {
      const checks = {
        database: await healthChecks.database(),
        redis: await healthChecks.redis(),
        storage: await healthChecks.storage(),
        memory: healthChecks.memory(),
        externalServices: await healthChecks.externalServices(),
      };

      const isHealthy = Object.values(checks).every((check) => {
        if (typeof check === "object" && check.status) {
          return ["healthy", "configured"].includes(check.status);
        }
        return true;
      });

      const overallStatus = isHealthy ? "healthy" : "unhealthy";
      const statusCode = isHealthy ? 200 : 503;

      const duration = Date.now() - startTime;
      logger.logHealth("overall", overallStatus, {
        duration: `${duration}ms`,
        checks,
      });

      const response = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0",
        checks,
        responseTime: `${duration}ms`,
      };

      res
        .status(statusCode)
        .json(
          new ApiResponse(statusCode, response, `System is ${overallStatus}`)
        );
    } catch (error) {
      logger.logError(error, { context: "health_check" });
      res.status(503).json(new ApiResponse(503, null, "Health check failed"));
    }
  })
);

/**
 * @route
 * @desc
 * @access
 */
router.get(
  "/health/simple",
  asyncHandler(async (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  })
);

/**
 * @route
 * @desc
 * @access
 */
router.get(
  "/metrics",
  authMiddleware,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    try {
      const metrics = metricsCollector.getMetrics();

      logger.logAnalytics("metrics_requested", {
        adminId: req.user.id,
        metricsCount: metrics.summary.totalRequests,
      });

      res
        .status(200)
        .json(new ApiResponse(200, metrics, "Metrics retrieved successfully"));
    } catch (error) {
      logger.logError(error, { context: "metrics_retrieval" });
      res
        .status(500)
        .json(new ApiResponse(500, null, "Failed to retrieve metrics"));
    }
  })
);

/**
 * @route
 * @desc
 * @access
 */
router.post(
  "/metrics/reset",
  authMiddleware,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    try {
      const oldMetrics = metricsCollector.getMetrics();
      metricsCollector.reset();

      logger.logAnalytics("metrics_reset", {
        adminId: req.user.id,
        previousMetrics: oldMetrics.summary,
      });

      res
        .status(200)
        .json(new ApiResponse(200, null, "Metrics reset successfully"));
    } catch (error) {
      logger.logError(error, { context: "metrics_reset" });
      res
        .status(500)
        .json(new ApiResponse(500, null, "Failed to reset metrics"));
    }
  })
);

/**
 * @route
 * @desc
 * @access
 */
router.get(
  "/logs",
  authMiddleware,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    try {
      const { level = "error", limit = 100 } = req.query;
      const fs = await import("fs/promises");
      const path = await import("path");
      const { fileURLToPath } = await import("url");

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      const logFiles = {
        error: "error.log",
        combined: "combined.log",
        analytics: "analytics.log",
      };

      const logFile = logFiles[level] || "error.log";
      const logPath = path.join(__dirname, "../../logs", logFile);

      try {
        await fs.access(logPath);
      } catch {
        return res
          .status(404)
          .json(new ApiResponse(404, null, "Log file not found"));
      }

      const logContent = await fs.readFile(logPath, "utf-8");
      const lines = logContent
        .trim()
        .split("\n")
        .filter((line) => line.length > 0);

      const logs = lines
        .slice(-limit)
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return { message: line, level: "unknown", timestamp: null };
          }
        })
        .reverse();

      logger.logAnalytics("logs_accessed", {
        adminId: req.user.id,
        level,
        count: logs.length,
      });

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { logs, total: logs.length },
            "Logs retrieved successfully"
          )
        );
    } catch (error) {
      logger.logError(error, { context: "logs_retrieval" });
      res
        .status(500)
        .json(new ApiResponse(500, null, "Failed to retrieve logs"));
    }
  })
);

/**
 * @route
 * @desc
 * @access
 */
router.get(
  "/system",
  authMiddleware,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    try {
      const systemInfo = {
        node: {
          version: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime: Math.floor(process.uptime()),
          pid: process.pid,
        },
        memory: process.memoryUsage(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          port: process.env.PORT || 5000,
          mongoUri: process.env.MONGODB_URI ? "configured" : "not configured",
          redisUrl: process.env.REDIS_URL ? "configured" : "not configured",
        },
        cpuUsage: process.cpuUsage(),
        resourceUsage: process.resourceUsage
          ? process.resourceUsage()
          : "not available",
      };

      logger.logAnalytics("system_info_accessed", {
        adminId: req.user.id,
      });

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            systemInfo,
            "System information retrieved successfully"
          )
        );
    } catch (error) {
      logger.logError(error, { context: "system_info_retrieval" });
      res
        .status(500)
        .json(
          new ApiResponse(500, null, "Failed to retrieve system information")
        );
    }
  })
);

export default router;
