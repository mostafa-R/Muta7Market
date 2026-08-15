import rateLimit from "express-rate-limit";
import ApiError from "../utils/ApiError.js";

const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || "Too many requests from this IP",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res) => {
      throw new ApiError(429, options.message || "Too many requests");
    },
  });
};

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts. Please try again later.",
});

export const verifyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many verification attempts. Please try again later.",
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 60,
  message: "Too many upload requests. Please try again later.",
});

const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP. Please try again later.",
});

export default generalLimiter;
