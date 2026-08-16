import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { CoachProfile } from '../models/CoachProfile.js';
import { Sport } from '../models/Sport.js';
import { ROLES } from '../config/constants.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

function assertCoach(user, t) {
  if (user.role !== ROLES.COACH) throw new ApiError(403, 'common.forbidden', {}, t('common.forbidden'));
}

async function validateSport(sportCode) {
  const sport = await Sport.findOne({ code: sportCode, isActive: true }).lean();
  if (!sport) throw new ApiError(400, 'sport.notFound');
}

export const createProfile = catchAsync(async (req, res) => {
  assertCoach(req.user, req.t);
  const existing = await CoachProfile.findOne({ user: req.userId });
  if (existing) throw new ApiError(409, 'coach.profileUpdated');

  await validateSport(req.body.sportCode);
  const profile = await CoachProfile.create({ ...req.body, user: req.userId });
  res.status(201).json(new ApiResponse(201, req.t('coach.profileCreated'), profile));
});

export const updateProfile = catchAsync(async (req, res) => {
  assertCoach(req.user, req.t);
  if (req.body.sportCode) await validateSport(req.body.sportCode);

  const profile = await CoachProfile.findOneAndUpdate({ user: req.userId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!profile) throw new ApiError(404, 'coach.notFound');
  res.status(200).json(new ApiResponse(200, req.t('coach.profileUpdated'), profile));
});

export const getMyProfile = catchAsync(async (req, res) => {
  assertCoach(req.user, req.t);
  const profile = await CoachProfile.findOne({ user: req.userId })
    .populate('user', 'displayName firstName lastName email avatar lang')
    .lean();
  if (!profile) throw new ApiError(404, 'coach.notFound');
  res.status(200).json(new ApiResponse(200, req.t('coach.profileFetched'), profile));
});

export const getPublicProfile = catchAsync(async (req, res) => {
  const profile = await CoachProfile.findById(req.params.coachId)
    .populate('user', 'displayName firstName lastName avatar isEmailVerified')
    .lean();
  if (!profile) throw new ApiError(404, 'coach.notFound');
  if (!profile.isPublic && profile.user._id.toString() !== req.userId) {
    throw new ApiError(403, 'common.forbidden', {}, req.t('common.forbidden'));
  }

  if (profile.user._id.toString() !== req.userId) {
    CoachProfile.updateOne({ _id: profile._id }, { $inc: { views: 1 } }).exec().catch(() => {});
  }
  res.status(200).json(new ApiResponse(200, req.t('coach.profileFetched'), profile));
});

export const listPublic = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = { isPublic: true };
  if (req.query.sportCode) filter.sportCode = req.query.sportCode;
  if (req.query.country) filter.country = req.query.country;
  if (req.query.city) filter.city = req.query.city;

  const total = await CoachProfile.countDocuments(filter);
  const data = await CoachProfile.find(filter)
    .sort({ ratingAvg: -1 })
    .skip(skip)
    .limit(limit)
    .select('-services -about')
    .populate('user', 'displayName firstName lastName avatar')
    .lean();

  res.status(200).json(new ApiResponse(200, req.t('coach.profileFetched'), data, paginateMeta(total, page, limit)));
});
