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
import rateLimiter from "./middleware/rateLimiter.middleware.js";
import routes from "./routes/index.js";
import { initializeEmailService } from "./services/email.service.js";

// __dirname setup for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();

// Trust Proxy
app.set("trust proxy", 1);

// Security Middleware (Helmet CSP)
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
    crossOriginResourcePolicy: false, // Allow cross-origin requests for static files
  })
);

// CORS Configuration
const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:3001",
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

// Data Sanitization against NoSQL Injection
app.use(mongoSanitize());

// Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie Parser
app.use(cookieParser());

// Compression
app.use(compression());

// Logging Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      skip: (req, res) => res.statusCode < 400,
    })
  );
}

// i18n Configuration
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

// Static Files with CORS headers
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

// API Documentation (Swagger)
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Sports Platform API Documentation",
  })
);

// Rate Limiter for APIs
app.use("/api/", rateLimiter);

// API Routes
app.use("/api/v1", routes);

// Root Endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Sports Platform API",
    version: "1.0.0",
    documentation: "/api-docs",
    health: "/health",
    api: "/api/v1",
  });
});

// Health Check Endpoint
app.get("/health", (req, res) => {
  // Check if uploads directory is accessible
  const uploadsDir = join(__dirname, "../uploads");
  let uploadsStatus = "accessible";
  try {
    fs.accessSync(uploadsDir, fs.constants.R_OK | fs.constants.W_OK);
  } catch (error) {
    uploadsStatus = "error: " + error.message;
  }

  const healthcheck = {
    uptime: process.uptime(),
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    baseUrl: process.env.BASE_URL || "not set",
    uploadsDirectory: uploadsStatus,
    memory: process.memoryUsage(),
  };
  res.status(200).json(healthcheck);
});

// 404 Handler
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

// Global Error Handler
app.use(errorMiddleware);

export default app;
