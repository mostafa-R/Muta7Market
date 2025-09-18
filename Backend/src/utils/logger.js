import path, { dirname } from "path";
import { fileURLToPath } from "url";
import winston from "winston";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom format for console output in development
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    let metaStr = "";
    if (Object.keys(meta).length > 0) {
      metaStr = `\n${JSON.stringify(meta, null, 2)}`;
    }
    return `${timestamp} [${service}] ${level}: ${message}${metaStr}`;
  })
);

// Production format with structured JSON
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    // Ensure all properties are included
    const { timestamp, level, message, service, ...meta } = info;
    return JSON.stringify({
      timestamp,
      level,
      message,
      service,
      environment: process.env.NODE_ENV || "development",
      pid: process.pid,
      ...meta,
    });
  })
);

// Create the main logger
const logger = winston.createLogger({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  defaultMeta: {
    service: "sports-platform-api",
    version: "1.0.0",
  },
  transports: [
    // Error log - only errors
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
      format: prodFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),

    // Combined log - all levels
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/combined.log"),
      format: prodFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true,
    }),

    // Analytics specific log
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/analytics.log"),
      level: "info",
      format: prodFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 3,
      tailable: true,
    }),
  ],
});

// Console transport for non-production
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: devFormat,
    })
  );
}

// Add custom logging methods for structured logging
logger.logRequest = (req, res, duration) => {
  logger.info("HTTP Request", {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    userId: req.user?.id || "anonymous",
    contentLength: res.get("content-length") || 0,
  });
};

logger.logError = (error, context = {}) => {
  logger.error(error.message, {
    stack: error.stack,
    name: error.name,
    statusCode: error.statusCode || 500,
    isOperational: error.isOperational || false,
    ...context,
  });
};

logger.logAnalytics = (action, data = {}) => {
  logger.info("Analytics Event", {
    action,
    category: "analytics",
    ...data,
  });
};

logger.logAuth = (action, userId, metadata = {}) => {
  logger.info("Authentication Event", {
    action,
    category: "auth",
    userId,
    ...metadata,
  });
};

logger.logPayment = (action, data = {}) => {
  logger.info("Payment Event", {
    action,
    category: "payment",
    ...data,
  });
};

logger.logPerformance = (operation, duration, metadata = {}) => {
  logger.info("Performance Metric", {
    operation,
    duration: `${duration}ms`,
    category: "performance",
    ...metadata,
  });
};

logger.logSecurity = (event, metadata = {}) => {
  logger.warn("Security Event", {
    event,
    category: "security",
    timestamp: new Date().toISOString(),
    ...metadata,
  });
};

// Health check logging
logger.logHealth = (component, status, metadata = {}) => {
  const level = status === "healthy" ? "info" : "error";
  logger[level]("Health Check", {
    component,
    status,
    category: "health",
    ...metadata,
  });
};

export default logger;
