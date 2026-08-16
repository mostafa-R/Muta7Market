import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Trial } from '../models/Trial.js';
import { Rating } from '../models/Rating.js';
import { User } from '../models/User.js';
import { PlayerProfile } from '../models/PlayerProfile.js';
import { CoachProfile } from '../models/CoachProfile.js';
import { ClubProfile } from '../models/ClubProfile.js';
import { AgentProfile } from '../models/AgentProfile.js';
import { ROLES, TRIAL_STATUS } from '../config/constants.js';
import { getSettingNumber } from '../services/settings.service.js';
import { createNotification } from '../services/notification.service.js';
import { emitToUser } from '../config/socket.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

const TARGET_MODEL_BY_ROLE = {
  player: 'PlayerProfile',
  coach: 'CoachProfile',
  club: 'ClubProfile',
  agent: 'AgentProfile',
};

// ---------- Trials ----------

export const scheduleTrial = catchAsync(async (req, res) => {
  if (req.user.role !== ROLES.CLUB) {
    throw new ApiError(403, 'common.forbidden', {}, req.t('common.forbidden'));
  }

  const playerUser = await User.findById(req.body.playerUserId).lean();
  if (!playerUser) throw new ApiError(404, 'user.notFound');
  if (playerUser.role !== ROLES.PLAYER) throw new ApiError(400, 'validation.invalidRole');

  const playerProfile = await PlayerProfile.findOne({ user: playerUser._id }).lean();
  const defaultDuration = await getSettingNumber('trials.defaultDurationMinutes', 90);

  const trial = await Trial.create({
    club: req.userId,
    player: playerUser._id,
    playerProfile: playerProfile?._id || null,
    offer: req.body.offerId || null,
    scheduledAt: req.body.scheduledAt,
    durationMinutes: req.body.durationMinutes || defaultDuration,
    location: req.body.location || {},
    notes: req.body.notes || '',
  });

  createNotification({
    user: playerUser._id,
    type: 'trial',
    title: { en: 'Trial scheduled', ar: 'تم جدولة اختبار' },
    body: {
      en: `A trial is scheduled for ${new Date(trial.scheduledAt).toLocaleString()}`,
      ar: `تم جدولة اختبار في ${new Date(trial.scheduledAt).toLocaleDateString('ar')}`,
    },
    data: { trialId: trial._id },
    lang: playerUser.lang,
  }).catch(() => {});
  emitToUser(playerUser._id.toString(), 'trial:new', { id: trial._id });

  res.status(201).json(new ApiResponse(201, req.t('evaluation.trialScheduled'), trial));
});

export const listTrials = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter =
    req.user.role === ROLES.PLAYER
      ? { player: req.userId }
      : req.user.role === ROLES.CLUB
        ? { club: req.userId }
        : {};

  if (req.query.status) filter.status = req.query.status;

  const total = await Trial.countDocuments(filter);
  const data = await Trial.find(filter)
    .sort({ scheduledAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('club', 'displayName')
    .populate('player', 'displayName')
    .lean();

  res.status(200).json(new ApiResponse(200, req.t('evaluation.trialUpdated'), data, paginateMeta(total, page, limit)));
});

async function loadOwnedTrial(req, id) {
  const trial = await Trial.findById(id);
  if (!trial) throw new ApiError(404, 'evaluation.trialNotFound');
  const isParticipant =
    trial.club.toString() === req.userId ||
    trial.player.toString() === req.userId ||
    req.user.role === 'admin';
  if (!isParticipant) throw new ApiError(403, 'evaluation.forbidden', {}, req.t('evaluation.forbidden'));
  return trial;
}

export const updateTrial = catchAsync(async (req, res) => {
  const trial = await loadOwnedTrial(req, req.params.id);
  const status = req.body.status;

  if (status === TRIAL_STATUS.COMPLETED && trial.club.toString() !== req.userId) {
    throw new ApiError(403, 'evaluation.forbidden', {}, req.t('evaluation.forbidden'));
  }

  Object.assign(trial, req.body);
  if (status === TRIAL_STATUS.CANCELLED) trial.cancelledBy = req.userId;
  await trial.save();

  const otherId = trial.club.toString() === req.userId ? trial.player : trial.club;
  emitToUser(otherId.toString(), 'trial:update', { id: trial._id, status });

  res.status(200).json(new ApiResponse(200, req.t('evaluation.trialUpdated'), trial));
});

// ---------- Ratings ----------

async function recomputeRating(targetModel, targetId) {
  const aggregate = await Rating.aggregate([
    { $match: { target: targetId } },
    { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } },
  ]);
  const result = aggregate[0];
  const update = {
    ratingAvg: result ? Math.round(result.avg * 10) / 10 : 0,
    ratingCount: result ? result.count : 0,
  };
  const Model = { PlayerProfile, CoachProfile, ClubProfile, AgentProfile }[targetModel];
  await Model.updateOne({ _id: targetId }, update);
}

export const submitRating = catchAsync(async (req, res) => {
  if (req.user.role === ROLES.ADMIN) {
    throw new ApiError(403, 'evaluation.forbidden', {}, req.t('evaluation.forbidden'));
  }
  if (req.body.toUserId === req.userId) {
    throw new ApiError(400, 'evaluation.cannotRateSelf', {}, req.t('evaluation.cannotRateSelf'));
  }

  const targetUser = await User.findById(req.body.toUserId).lean();
  if (!targetUser) throw new ApiError(404, 'user.notFound');

  const targetModel = TARGET_MODEL_BY_ROLE[targetUser.role];
  if (!targetModel) throw new ApiError(400, 'validation.invalidRole');

  const targetId =
    targetUser.role === ROLES.PLAYER
      ? (await PlayerProfile.findOne({ user: targetUser._id }).lean())?._id
      : targetUser.role === ROLES.COACH
        ? (await CoachProfile.findOne({ user: targetUser._id }).lean())?._id
        : targetUser.role === ROLES.CLUB
          ? (await ClubProfile.findOne({ user: targetUser._id }).lean())?._id
          : (await AgentProfile.findOne({ user: targetUser._id }).lean())?._id;

  if (!targetId) throw new ApiError(404, 'user.notFound');

  const existing = await Rating.findOne({ fromUser: req.userId, toUser: req.body.toUserId });
  if (existing) throw new ApiError(409, 'evaluation.alreadyRated', {}, req.t('evaluation.alreadyRated'));

  const rating = await Rating.create({
    fromUser: req.userId,
    toUser: req.body.toUserId,
    targetModel,
    target: targetId,
    type: req.body.type,
    offer: req.body.offerId || null,
    score: req.body.score,
    comment: req.body.comment || '',
  });

  await recomputeRating(targetModel, targetId);

  createNotification({
    user: req.body.toUserId,
    type: 'rating',
    title: { en: 'New rating received', ar: 'تقييم جديد' },
    body: { en: `You received a ${req.body.score}/5 rating`, ar: `حصلت على تقييم ${req.body.score}/5` },
    data: { ratingId: rating._id },
    lang: targetUser.lang,
  }).catch(() => {});

  res.status(201).json(new ApiResponse(201, req.t('evaluation.ratingSubmitted'), rating));
});

export const listRatings = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = { toUser: req.params.userId || req.userId };

  const total = await Rating.countDocuments(filter);
  const data = await Rating.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('fromUser', 'displayName firstName lastName avatar')
    .lean();

  res.status(200).json(new ApiResponse(200, req.t('evaluation.ratingsFetched'), data, paginateMeta(total, page, limit)));
});

export const getMyGivenRatings = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = { fromUser: req.userId };

  const total = await Rating.countDocuments(filter);
  const data = await Rating.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('toUser', 'displayName firstName lastName avatar')
    .lean();

  res.status(200).json(new ApiResponse(200, req.t('evaluation.ratingsFetched'), data, paginateMeta(total, page, limit)));
});
