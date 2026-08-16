import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { PlayerProfile } from '../models/PlayerProfile.js';
import { User } from '../models/User.js';
import { Sport } from '../models/Sport.js';
import { ROLES } from '../config/constants.js';
import { indexPlayer } from '../services/elastic.service.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

function assertRole(user, roles, t) {
  if (!roles.includes(user.role)) throw new ApiError(403, 'common.forbidden', {}, t('common.forbidden'));
}

async function validateSport(sportCode) {
  const sport = await Sport.findOne({ code: sportCode, isActive: true }).lean();
  if (!sport) throw new ApiError(400, 'sport.notFound');
  return sport;
}

export const createProfile = catchAsync(async (req, res) => {
  assertRole(req.user, [ROLES.PLAYER], req.t);
  const existing = await PlayerProfile.findOne({ user: req.userId });
  if (existing) throw new ApiError(409, 'player.profileUpdated');

  await validateSport(req.body.sportCode);
  const profile = await PlayerProfile.create({ ...req.body, user: req.userId });
  indexPlayer(profile).catch(() => {});

  res.status(201).json(new ApiResponse(201, req.t('player.profileCreated'), profile));
});

export const updateProfile = catchAsync(async (req, res) => {
  assertRole(req.user, [ROLES.PLAYER], req.t);
  if (req.body.sportCode) await validateSport(req.body.sportCode);

  const profile = await PlayerProfile.findOneAndUpdate({ user: req.userId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!profile) throw new ApiError(404, 'player.notFound');
  indexPlayer(profile).catch(() => {});

  res.status(200).json(new ApiResponse(200, req.t('player.profileUpdated'), profile));
});

export const getMyProfile = catchAsync(async (req, res) => {
  assertRole(req.user, [ROLES.PLAYER], req.t);
  const profile = await PlayerProfile.findOne({ user: req.userId })
    .populate('user', 'displayName firstName lastName email avatar lang')
    .lean();
  if (!profile) throw new ApiError(404, 'player.notFound');
  res.status(200).json(new ApiResponse(200, req.t('player.profileFetched'), profile));
});

export const getPublicProfile = catchAsync(async (req, res) => {
  const profile = await PlayerProfile.findById(req.params.playerId)
    .populate('user', 'displayName firstName lastName avatar isEmailVerified isActive')
    .lean();

  if (!profile) throw new ApiError(404, 'player.notFound');
  if (!profile.isPublic && profile.user._id.toString() !== req.userId) {
    throw new ApiError(403, 'common.forbidden', {}, req.t('common.forbidden'));
  }

  if (profile.user._id.toString() !== req.userId) {
    PlayerProfile.updateOne({ _id: profile._id }, { $inc: { views: 1 } }).exec().catch(() => {});
  }

  res.status(200).json(new ApiResponse(200, req.t('player.profileFetched'), profile));
});

export const listPublic = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = { isPublic: true };
  if (req.query.sportCode) filter.sportCode = req.query.sportCode;
  if (req.query.position) {
    filter.$or = [{ primaryPosition: req.query.position }, { secondaryPositions: req.query.position }];
  }
  if (req.query.country) filter.country = req.query.country;
  if (req.query.featuredOnly === 'true') filter.isFeatured = true;

  const total = await PlayerProfile.countDocuments(filter);
  const data = await PlayerProfile.find(filter)
    .sort({ isFeatured: -1, ratingAvg: -1 })
    .skip(skip)
    .limit(limit)
    .select('-careerHistory -about -stats')
    .populate('user', 'displayName firstName lastName avatar')
    .lean();

  res.status(200).json(new ApiResponse(200, req.t('player.profileFetched'), data, paginateMeta(total, page, limit)));
});

export const toggleVisibility = catchAsync(async (req, res) => {
  assertRole(req.user, [ROLES.PLAYER], req.t);
  const profile = await PlayerProfile.findOneAndUpdate(
    { user: req.userId },
    { isPublic: req.body.isPublic },
    { new: true }
  );
  if (!profile) throw new ApiError(404, 'player.notFound');
  indexPlayer(profile).catch(() => {});
  res.status(200).json(new ApiResponse(200, req.t('player.visibilityUpdated'), { isPublic: profile.isPublic }));
});

export const updateContractStatus = catchAsync(async (req, res) => {
  assertRole(req.user, [ROLES.PLAYER], req.t);
  const profile = await PlayerProfile.findOneAndUpdate(
    { user: req.userId },
    {
      contractStatus: req.body.contractStatus,
      currentClub: req.body.currentClub,
      contractEndDate: req.body.contractEndDate,
    },
    { new: true, runValidators: true }
  );
  if (!profile) throw new ApiError(404, 'player.notFound');
  indexPlayer(profile).catch(() => {});
  res.status(200).json(new ApiResponse(200, req.t('player.contractUpdated'), profile));
});
