import winston from 'winston';
import { config } from '../config/env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) =>
    stack ? `${timestamp} [${level.toUpperCase()}] ${message}\n${stack}` : `${timestamp} [${level.toUpperCase()}] ${message}`
  )
);

export const logger = winston.createLogger({
  levels,
  level: config.isProduction ? 'info' : 'debug',
  format,
  transports: [
    new winston.transports.Console({ format: winston.format.colorize({ all: true }) }),
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error', maxsize: 10 * 1024 * 1024, maxFiles: 5, tailable: true }),
    new winston.transports.File({ filename: path.join(logsDir, 'combined.log'), maxsize: 20 * 1024 * 1024, maxFiles: 5, tailable: true }),
  ],
  exitOnError: false,
});
