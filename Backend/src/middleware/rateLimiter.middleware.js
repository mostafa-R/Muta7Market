import rateLimit from "express-rate-limit";
import ApiError from "../utils/ApiError.js";

export const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100,
    message: options.message || "Too many requests from this IP",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res) => {
      throw new ApiError(429, options.message || "Too many requests");
    },
  });
};

// Different rate limiters for different endpoints
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Reduced from 1005 (that was likely a typo)
  message: "Too many authentication attempts. Please try again later.",
});

export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 100 to 1000 for development
  message: "Too many requests from this IP. Please try again later.",
});

export const paymentLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 payment attempts per 5 minutes
  message: "Too many payment attempts. Please try again in a few minutes.",
});

export const uploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50, // Increased from 10 to 50
  message: "Too many upload requests. Please try again later.",
});

// Default export for general use
export default generalLimiter;
