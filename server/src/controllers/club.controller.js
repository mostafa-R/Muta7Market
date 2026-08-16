import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { ClubProfile } from '../models/ClubProfile.js';
import { Sport } from '../models/Sport.js';
import { ROLES } from '../config/constants.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';
import { moveUploadedFile, publicFileUrl } from '../utils/fileUtils.js';

function assertClub(user, t) {
  if (user.role !== ROLES.CLUB) throw new ApiError(403, 'common.forbidden', {}, t('common.forbidden'));
}

export const createProfile = catchAsync(async (req, res) => {
  assertClub(req.user, req.t);
  const existing = await ClubProfile.findOne({ user: req.userId });
  if (existing) throw new ApiError(409, 'club.profileUpdated');

  const profile = await ClubProfile.create({ ...req.body, user: req.userId });
  res.status(201).json(new ApiResponse(201, req.t('club.profileCreated'), profile));
});

export const updateProfile = catchAsync(async (req, res) => {
  assertClub(req.user, req.t);
  const profile = await ClubProfile.findOneAndUpdate({ user: req.userId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!profile) throw new ApiError(404, 'club.notFound');
  res.status(200).json(new ApiResponse(200, req.t('club.profileUpdated'), profile));
});

export const getMyProfile = catchAsync(async (req, res) => {
  assertClub(req.user, req.t);
  const profile = await ClubProfile.findOne({ user: req.userId })
    .populate('user', 'displayName email avatar lang')
    .lean();
  if (!profile) throw new ApiError(404, 'club.notFound');
  res.status(200).json(new ApiResponse(200, req.t('club.profileFetched'), profile));
});

export const getPublicProfile = catchAsync(async (req, res) => {
  const profile = await ClubProfile.findById(req.params.clubId)
    .populate('user', 'displayName avatar isEmailVerified')
    .lean();
  if (!profile) throw new ApiError(404, 'club.notFound');

  ClubProfile.updateOne({ _id: profile._id }, { $inc: { views: 1 } }).exec().catch(() => {});
  res.status(200).json(new ApiResponse(200, req.t('club.profileFetched'), profile));
});

export const listPublic = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = {};
  if (req.query.country) filter.country = req.query.country;
  if (req.query.sportCode) filter.sportCode = req.query.sportCode;
  if (req.query.verified === 'true') filter.isVerified = true;

  const total = await ClubProfile.countDocuments(filter);
  const data = await ClubProfile.find(filter)
    .sort({ isVerified: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-about -vacancies')
    .populate('user', 'displayName avatar')
    .lean();

  res.status(200).json(new ApiResponse(200, req.t('club.profileFetched'), data, paginateMeta(total, page, limit)));
});

export const addVacancy = catchAsync(async (req, res) => {
  assertClub(req.user, req.t);
  const profile = await ClubProfile.findOne({ user: req.userId });
  if (!profile) throw new ApiError(404, 'club.notFound');

  profile.vacancies.push(req.body);
  await profile.save();
  res.status(201).json(new ApiResponse(201, req.t('club.vacancyCreated'), profile.vacancies));
});

export const updateVacancy = catchAsync(async (req, res) => {
  assertClub(req.user, req.t);
  const profile = await ClubProfile.findOne({ user: req.userId });
  if (!profile) throw new ApiError(404, 'club.notFound');

  const vacancy = profile.vacancies.id(req.params.vacancyId);
  if (!vacancy) throw new ApiError(404, 'club.vacancyNotFound');

  Object.assign(vacancy, req.body);
  await profile.save();
  res.status(200).json(new ApiResponse(200, req.t('club.vacancyUpdated'), profile.vacancies));
});

export const deleteVacancy = catchAsync(async (req, res) => {
  assertClub(req.user, req.t);
  const profile = await ClubProfile.findOne({ user: req.userId });
  if (!profile) throw new ApiError(404, 'club.notFound');

  const vacancy = profile.vacancies.id(req.params.vacancyId);
  if (!vacancy) throw new ApiError(404, 'club.vacancyNotFound');

  vacancy.deleteOne();
  await profile.save();
  res.status(200).json(new ApiResponse(200, req.t('club.vacancyDeleted')));
});

export const uploadLogo = catchAsync(async (req, res) => {
  assertClub(req.user, req.t);
  const moved = moveUploadedFile(req, 'images');
  if (!moved) throw new ApiError(400, 'validation.fieldRequired', {}, req.t('validation.fieldRequired'));

  const profile = await ClubProfile.findOneAndUpdate(
    { user: req.userId },
    { logo: moved.path },
    { new: true }
  );
  if (!profile) throw new ApiError(404, 'club.notFound');
  res.status(200).json(new ApiResponse(200, req.t('club.profileUpdated'), { logo: publicFileUrl(moved.path) }));
});
