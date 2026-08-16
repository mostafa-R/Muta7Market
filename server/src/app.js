import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { config } from './config/env.js';
import { globalLimiter } from './middleware/rateLimit.middleware.js';
import { i18nMiddleware } from './middleware/i18n.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import { routes } from './routes/index.js';
import { ensureUploadDirs } from './utils/fileUtils.js';
import { logger } from './utils/logger.js';

export function createApp() {
  const app = express();

  ensureUploadDirs();

  app.set('trust proxy', config.trustProxy);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || !config.corsOrigins.length || config.corsOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('CORS not allowed'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'X-Lang'],
      maxAge: 86400,
    })
  );

  app.use(compression({ threshold: 1024 }));
  app.use(cookieParser());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(mongoSanitize());

  if (config.nodeEnv !== 'production') {
    app.use(morgan('dev', { stream: { write: (msg) => logger.http(msg.trim()) } }));
  } else {
    app.use(
      morgan('combined', {
        skip: (req) => req.path === '/health',
        stream: { write: (msg) => logger.info(msg.trim()) },
      })
    );
  }

  app.use(globalLimiter);
  app.use(i18nMiddleware);

  app.get('/health', (req, res) => {
    res.json({ success: true, status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  app.use(config.apiPrefix, routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
