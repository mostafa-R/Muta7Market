import path from 'path';
import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Media } from '../models/Media.js';
import { PlayerProfile } from '../models/PlayerProfile.js';
import { CoachProfile } from '../models/CoachProfile.js';
import { ClubProfile } from '../models/ClubProfile.js';
import { User } from '../models/User.js';
import { FREE_PLAYER_VIDEO_LIMIT, PLAN_CODES, VIDEO_CATEGORIES } from '../config/constants.js';
import { getSettingNumber, getSetting } from '../services/settings.service.js';
import { moveUploadedFile, toAbsolute, fileExists } from '../utils/fileUtils.js';
import { hasActiveSubscription } from '../services/subscription.service.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

function resolveOwnerModel(role) {
  switch (role) {
    case 'player':
      return 'PlayerProfile';
    case 'coach':
      return 'CoachProfile';
    case 'club':
      return 'ClubProfile';
    default:
      return 'User';
  }
}

async function findOwner(model, userId) {
  if (model === 'User') return { _id: userId };
  const Model = { PlayerProfile, CoachProfile, ClubProfile }[model];
  const doc = await Model.findOne({ user: userId }).lean();
  return doc;
}

export const uploadHighlight = catchAsync(async (req, res) => {
  const ownerModel = resolveOwnerModel(req.user.role);
  const owner = await findOwner(ownerModel, req.userId);
  if (!owner) throw new ApiError(404, 'media.notFound');

  if (req.user.role === 'player') {
    const count = await Media.countDocuments({ user: req.userId, kind: 'highlight' });
    const isPro = await hasActiveSubscription(req.userId, [PLAN_CODES.PLAYER_PRO]);
    const freeLimit = await getSettingNumber('media.freeVideoLimit', FREE_PLAYER_VIDEO_LIMIT);
    if (!isPro && count >= freeLimit) {
      throw new ApiError(403, 'player.videoLimitReached', {}, req.t('player.videoLimitReached'));
    }
  }

  const categories = await getSetting('media.videoCategories', VIDEO_CATEGORIES);
  const category = req.body?.category || 'other';
  if (Array.isArray(categories) && categories.length && !categories.includes(category)) {
    throw new ApiError(400, 'validation.invalidEnum', { field: 'category' }, req.t('validation.invalidEnum'));
  }

  const moved = moveUploadedFile(req, 'videos');
  if (!moved) throw new ApiError(400, 'validation.fieldRequired', {}, req.t('validation.fieldRequired'));

  const media = await Media.create({
    user: req.userId,
    ownerModel,
    owner: owner._id,
    kind: 'highlight',
    title: { en: '', ar: '' },
    description: { en: '', ar: '' },
    category,
    isPublic: req.body?.isPublic !== false,
    file: moved,
  });

  res.status(201).json(
    new ApiResponse(201, req.t('media.uploaded'), {
      id: media._id,
      title: media.title,
      category: media.category,
      file: media.file,
      isPublic: media.isPublic,
    })
  );
});

export const updateMedia = catchAsync(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) throw new ApiError(404, 'media.notFound');
  if (media.user.toString() !== req.userId && req.user.role !== 'admin') {
    throw new ApiError(403, 'media.forbidden', {}, req.t('media.forbidden'));
  }

  if (req.body.category) {
    const categories = await getSetting('media.videoCategories', VIDEO_CATEGORIES);
    if (Array.isArray(categories) && categories.length && !categories.includes(req.body.category)) {
      throw new ApiError(400, 'validation.invalidEnum', { field: 'category' }, req.t('validation.invalidEnum'));
    }
  }

  Object.assign(media, req.body);
  await media.save();
  res.status(200).json(new ApiResponse(200, req.t('media.updated'), media));
});

export const deleteMedia = catchAsync(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) throw new ApiError(404, 'media.notFound');
  if (media.user.toString() !== req.userId && req.user.role !== 'admin') {
    throw new ApiError(403, 'media.forbidden', {}, req.t('media.forbidden'));
  }
  await media.deleteOne();
  res.status(200).json(new ApiResponse(200, req.t('media.deleted')));
});

export const getMyMedia = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = { user: req.userId };
  if (req.query.kind) filter.kind = req.query.kind;

  const total = await Media.countDocuments(filter);
  const data = await Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  res.status(200).json(new ApiResponse(200, req.t('media.fetched'), data, paginateMeta(total, page, limit)));
});

export const getMediaByOwner = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = { kind: 'highlight', isPublic: true };

  if (req.params.ownerType === 'player') {
    const profile = await PlayerProfile.findById(req.params.ownerId).lean();
    if (!profile) throw new ApiError(404, 'player.notFound');
    filter.user = profile.user;
  } else if (req.params.ownerType === 'coach') {
    const profile = await CoachProfile.findById(req.params.ownerId).lean();
    if (!profile) throw new ApiError(404, 'coach.notFound');
    filter.user = profile.user;
  } else {
    throw new ApiError(400, 'validation.invalidEnum', { field: 'ownerType' });
  }

  const total = await Media.countDocuments(filter);
  const data = await Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-file.path -file.originalName').lean();
  res.status(200).json(new ApiResponse(200, req.t('media.fetched'), data, paginateMeta(total, page, limit)));
});

export const getMediaMeta = catchAsync(async (req, res) => {
  const media = await Media.findById(req.params.id).lean();
  if (!media) throw new ApiError(404, 'media.notFound');
  if (!media.isPublic && media.user.toString() !== req.userId) {
    throw new ApiError(403, 'media.forbidden', {}, req.t('media.forbidden'));
  }
  res.status(200).json(new ApiResponse(200, req.t('media.fetched'), media));
});

export const streamMedia = catchAsync(async (req, res) => {
  const media = await Media.findById(req.params.id).lean();
  if (!media) throw new ApiError(404, 'media.notFound');

  const isOwner = req.userId && media.user.toString() === req.userId;
  if (!isOwner && !media.isPublic && req.user?.role !== 'admin') {
    throw new ApiError(403, 'media.forbidden', {}, req.t('media.forbidden'));
  }

  const absPath = toAbsolute(media.file.path);
  if (!absPath || !fileExists(media.file.path)) throw new ApiError(404, 'media.notFound');

  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Type', media.file.mimeType);
  res.setHeader('Cache-Control', media.isPublic ? 'public, max-age=86400' : 'private, no-store');
  res.sendFile(absPath);
});
