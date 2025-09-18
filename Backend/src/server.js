import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import fs from "fs";
import helmet from "helmet";
import i18n from "i18n";
import morgan from "morgan";
import { dirname, join } from "path";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import swaggerDocument from "./docs/swagger.js";
import errorMiddleware from "./middleware/error.middleware.js";
import healthMonitoring, {
  healthMetricsMiddleware,
} from "./middleware/healthMonitoring.middleware.js";
import localizationMiddleware from "./middleware/localization.middleware.js";
import {
  errorMonitoring,
  metricsMiddleware,
  requestTimer,
} from "./middleware/monitoring.middleware.js";
import rateLimiter from "./middleware/rateLimiter.middleware.js";
import routes from "./routes/index.js";
import monitoringRoutes from "./routes/monitoring.routes.js";
import { initializeEmailService } from "./services/email.service.js";
import memoryOptimizer from "./utils/memoryOptimizer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

if (process.env.NODE_ENV === "production") {
  memoryOptimizer.initialize();
  healthMonitoring.initialize();
}

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:", "http:", "*"],
      },
    },
    crossOriginResourcePolicy: false,
  })
);

const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5001",
      "http://localhost:5173",
      "https://muta7markt.com",
      "https://www.muta7markt.com",
      "https://dash.muta7markt.com",
      "https://muta7markt.com",
      "http://muta7markt.com",
      "https://dashboard.muta7markt.com",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.use(mongoSanitize());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());

app.use(compression());

app.use(requestTimer);
app.use(metricsMiddleware);
app.use(healthMetricsMiddleware);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      skip: (req, res) => res.statusCode < 400,
    })
  );
}

i18n.configure({
  locales: ["en", "ar"],
  directory: join(__dirname, "locales"),
  defaultLocale: "en",
  objectNotation: true,
  queryParameter: "lang",
  cookie: "language",
  autoReload: process.env.NODE_ENV === "development",
  updateFiles: process.env.NODE_ENV === "development",
  syncFiles: process.env.NODE_ENV === "development",
});
app.use(i18n.init);
app.use(localizationMiddleware);

app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(join(__dirname, "../uploads"))
);

app.use("/public", express.static(join(__dirname, "../public")));

await initializeEmailService();

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Sports Platform API Documentation",
  })
);

app.use("/api/", rateLimiter);

app.use("/api/v1", routes);
app.use("/api/v1/monitoring", monitoringRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Sports Platform API",
    version: "1.0.0",
    documentation: "/api-docs",
    health: "/health",
    api: "/api/v1",
  });
});

app.get("/health", async (req, res) => {
  try {
    const healthStatus = await healthMonitoring.getHealthStatus();

    let statusCode = 200;
    if (
      healthStatus.overall === "critical" ||
      healthStatus.overall === "unhealthy"
    ) {
      statusCode = 503;
    } else if (healthStatus.overall === "warning") {
      statusCode = 200;
    }

    res.status(statusCode).json({
      status: healthStatus.overall.toUpperCase(),
      timestamp: healthStatus.timestamp,
      uptime: `${Math.floor(process.uptime())}s`,
      environment: process.env.NODE_ENV,
      version: "1.0.0",
      ...healthStatus,
    });
  } catch (error) {
    const uploadsDir = join(__dirname, "../uploads");
    let uploadsStatus = "accessible";
    try {
      fs.accessSync(uploadsDir, fs.constants.R_OK | fs.constants.W_OK);
    } catch (err) {
      uploadsStatus = "error: " + err.message;
    }

    const healthcheck = {
      uptime: process.uptime(),
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      baseUrl: process.env.BASE_URL || "not set",
      uploadsDirectory: uploadsStatus,
      memory: process.memoryUsage(),
      error: "Health monitoring unavailable: " + error.message,
    };
    res.status(200).json(healthcheck);
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: {
      statusCode: 404,
      message: "The requested resource could not be found",
    },
  });
});

app.use(errorMonitoring);
app.use(errorMiddleware);

export default app;
