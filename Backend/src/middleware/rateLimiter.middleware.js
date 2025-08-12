import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';

export const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100,
    message: options.message || 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res) => {
      throw new ApiError(429, options.message || 'Too many requests');
    }
  });
};

// Different rate limiters for different endpoints
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1005,
  message: 'Too many authentication attempts. Please try again later.'
});

export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100
});

export const uploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many upload requests. Please try again later.'
});

// Default export for general use
export default generalLimiter;
