import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Notification } from '../models/Notification.js';
import { localizeNotification } from '../services/notification.service.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

export const listMyNotifications = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = { user: req.userId };
  if (req.query.unreadOnly === 'true') filter.readAt = null;

  const total = await Notification.countDocuments(filter);
  const data = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .then((items) => items.map((n) => localizeNotification(n, req.lang)));

  res.status(200).json(new ApiResponse(200, req.t('notification.fetched'), data, paginateMeta(total, page, limit)));
});

export const unreadCount = catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.userId, readAt: null });
  res.status(200).json(new ApiResponse(200, req.t('notification.unreadCount'), { count }));
});

export const markRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { readAt: new Date() },
    { new: true }
  ).lean();
  if (!notification) throw new ApiError(404, 'notification.notFound');
  res.status(200).json(new ApiResponse(200, req.t('notification.markedRead'), localizeNotification(notification, req.lang)));
});

export const markAllRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ user: req.userId, readAt: null }, { readAt: new Date() });
  res.status(200).json(new ApiResponse(200, req.t('notification.allMarkedRead')));
});

export const clearAll = catchAsync(async (req, res) => {
  await Notification.deleteMany({ user: req.userId, readAt: { $ne: null } });
  res.status(200).json(new ApiResponse(200, req.t('notification.cleared')));
});
