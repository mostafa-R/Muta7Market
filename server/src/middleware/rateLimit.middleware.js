import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

const standardLimiter = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests, please try again later',
  },
};

export const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMinutes * 60 * 1000,
  limit: config.rateLimit.max,
  ...standardLimiter,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.rateLimit.authMax,
  ...standardLimiter,
});

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: config.rateLimit.searchMax,
  ...standardLimiter,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  ...standardLimiter,
});

export const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 200,
  ...standardLimiter,
});
