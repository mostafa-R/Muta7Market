import mongoose from 'mongoose';
import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Sport } from '../models/Sport.js';
import { cacheGet, cacheSet } from '../config/redis.js';

export const health = catchAsync(async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const status = dbState === 1 ? 'ok' : 'degraded';
  res.status(status === 'ok' ? 200 : 503).json({
    success: true,
    status,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: dbState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage().rss,
  });
});

export const listSports = catchAsync(async (req, res) => {
  const cacheKey = 'sports:list';
  const cached = await cacheGet(cacheKey);
  if (cached) return res.status(200).json(new ApiResponse(200, req.t('sport.fetched'), cached));

  const sports = await Sport.find({ isActive: true }).select('code name positions -_id').lean();
  await cacheSet(cacheKey, sports, 600);
  res.status(200).json(new ApiResponse(200, req.t('sport.fetched'), sports));
});

export const getSport = catchAsync(async (req, res) => {
  const sport = await Sport.findOne({ code: req.params.code }).lean();
  if (!sport) {
    return res.status(404).json({ success: false, statusCode: 404, message: req.t('sport.notFound') });
  }
  res.status(200).json(new ApiResponse(200, req.t('sport.fetched'), sport));
});
