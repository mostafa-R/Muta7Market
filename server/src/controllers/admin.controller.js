import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';
import { SubscriptionPlan } from '../models/SubscriptionPlan.js';
import { Subscription } from '../models/Subscription.js';
import { Advertisement } from '../models/Advertisement.js';
import { KycRequest } from '../models/KycRequest.js';
import { Offer } from '../models/Offer.js';
import { PlayerProfile } from '../models/PlayerProfile.js';
import { CoachProfile } from '../models/CoachProfile.js';
import { ClubProfile } from '../models/ClubProfile.js';
import { AgentProfile } from '../models/AgentProfile.js';
import { Sport } from '../models/Sport.js';
import { Media } from '../models/Media.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { Notification } from '../models/Notification.js';
import { Shortlist } from '../models/Shortlist.js';
import { Negotiation } from '../models/Negotiation.js';
import { Message } from '../models/Message.js';
import { Trial } from '../models/Trial.js';
import { Rating } from '../models/Rating.js';
import { ContactRequest } from '../models/ContactRequest.js';
import { cacheDel } from '../config/redis.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

export const getStats = catchAsync(async (req, res) => {
  const [
    totalUsers,
    players,
    coaches,
    clubs,
    agents,
    totalOffers,
    pendingKyc,
    activeSubscriptions,
    activeAds,
    totalSports,
    totalMedia,
    verifiedProfiles,
  ] = await Promise.all([
    User.countDocuments(),
    PlayerProfile.countDocuments(),
    CoachProfile.countDocuments(),
    ClubProfile.countDocuments(),
    User.countDocuments({ role: 'agent' }),
    Offer.countDocuments(),
    KycRequest.countDocuments({ status: 'pending' }),
    Subscription.countDocuments({ status: 'active', endDate: { $gte: new Date() } }),
    Advertisement.countDocuments({ status: 'active', endsAt: { $gte: new Date() } }),
    Sport.countDocuments(),
    Media.countDocuments(),
    Promise.all([
      PlayerProfile.countDocuments({ isVerified: true }),
      CoachProfile.countDocuments({ isVerified: true }),
      ClubProfile.countDocuments({ isVerified: true }),
      AgentProfile.countDocuments({ isVerified: true }),
    ]).then(([p, c, cl, a]) => p + c + cl + a),
  ]);

  res.status(200).json(
    new ApiResponse(200, req.t('admin.statsFetched'), {
      totalUsers,
      players,
      coaches,
      clubs,
      agents,
      totalOffers,
      pendingKyc,
      activeSubscriptions,
      activeAds,
      totalSports,
      totalMedia,
      verifiedProfiles,
    })
  );
});

export const listUsers = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.q) filter.email = { $regex: req.query.q, $options: 'i' };

  const total = await User.countDocuments(filter);
  const data = await User.find(filter)
    .select('-password -emailVerificationTokenHash -passwordResetTokenHash')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json(new ApiResponse(200, req.t('admin.usersFetched'), data, paginateMeta(total, page, limit)));
});

export const banUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'user.notFound');
  if (user.role === 'admin') throw new ApiError(403, 'common.forbidden', {}, req.t('common.forbidden'));

  user.isActive = false;
  user.bannedAt = new Date();
  user.bannedReason = req.body.reason || 'Banned by admin';
  await user.save();

  res.status(200).json(new ApiResponse(200, req.t('admin.userBanned'), { id: user._id, isActive: false }));
});

export const unbanUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'user.notFound');

  user.isActive = true;
  user.bannedAt = null;
  user.bannedReason = null;
  await user.save();

  res.status(200).json(new ApiResponse(200, req.t('admin.userUnbanned'), { id: user._id, isActive: true }));
});

export const createPlan = catchAsync(async (req, res) => {
  const plan = await SubscriptionPlan.create(req.body);
  res.status(201).json(new ApiResponse(201, req.t('admin.planCreated'), plan));
});

export const updatePlan = catchAsync(async (req, res) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!plan) throw new ApiError(404, 'subscription.planNotFound');
  res.status(200).json(new ApiResponse(200, req.t('admin.planUpdated'), plan));
});

export const deletePlan = catchAsync(async (req, res) => {
  const plan = await SubscriptionPlan.findById(req.params.id);
  if (!plan) throw new ApiError(404, 'subscription.planNotFound');
  await plan.deleteOne();
  res.status(200).json(new ApiResponse(200, req.t('admin.planDeleted')));
});

export const listPlans = catchAsync(async (req, res) => {
  const plans = await SubscriptionPlan.find().sort({ createdAt: 1 }).lean();
  res.status(200).json(new ApiResponse(200, req.t('subscription.plansFetched'), plans));
});

export const listSubscriptions = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const total = await Subscription.countDocuments(filter);
  const data = await Subscription.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'displayName email')
    .populate('plan', 'code name')
    .lean();

  res.status(200).json(new ApiResponse(200, req.t('admin.subscriptionsFetched'), data, paginateMeta(total, page, limit)));
});

export const listAdvertisements = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const total = await Advertisement.countDocuments(filter);
  const data = await Advertisement.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('advertiser', 'displayName email')
    .lean();

  res.status(200).json(new ApiResponse(200, req.t('admin.adsFetched'), data, paginateMeta(total, page, limit)));
});

export const updateAdvertisementStatus = catchAsync(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id);
  if (!ad) throw new ApiError(404, 'advertisement.notFound');
  ad.status = req.body.status;
  await ad.save();
  res.status(200).json(new ApiResponse(200, req.t('admin.adUpdated'), ad));
});

export const createAdvertisement = catchAsync(async (req, res) => {
  const ad = await Advertisement.create({ ...req.body, advertiser: req.userId });
  res.status(201).json(new ApiResponse(201, req.t('admin.adCreated'), ad));
});

export const updateAdvertisement = catchAsync(async (req, res) => {
  const ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!ad) throw new ApiError(404, 'advertisement.notFound');
  res.status(200).json(new ApiResponse(200, req.t('admin.adUpdated'), ad));
});

export const deleteAdvertisement = catchAsync(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id);
  if (!ad) throw new ApiError(404, 'advertisement.notFound');
  await ad.deleteOne();
  res.status(200).json(new ApiResponse(200, req.t('admin.adDeleted')));
});

export const createSport = catchAsync(async (req, res) => {
  const exists = await Sport.exists({ code: req.body.code });
  if (exists) throw new ApiError(409, 'sport.exists', {}, req.t('sport.exists'));
  const sport = await Sport.create(req.body);
  await cacheDel('sports:list');
  res.status(201).json(new ApiResponse(201, req.t('admin.sportCreated'), sport));
});

export const updateSport = catchAsync(async (req, res) => {
  const sport = await Sport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!sport) throw new ApiError(404, 'sport.notFound', {}, req.t('sport.notFound'));
  await cacheDel('sports:list');
  res.status(200).json(new ApiResponse(200, req.t('admin.sportUpdated'), sport));
});

export const deleteSport = catchAsync(async (req, res) => {
  const sport = await Sport.findById(req.params.id);
  if (!sport) throw new ApiError(404, 'sport.notFound', {}, req.t('sport.notFound'));

  const [players, coaches, clubs] = await Promise.all([
    PlayerProfile.countDocuments({ sportCode: sport.code }),
    CoachProfile.countDocuments({ sportCode: sport.code }),
    ClubProfile.countDocuments({ sportCode: sport.code }),
  ]);
  if (players || coaches || clubs) {
    throw new ApiError(409, 'admin.sportInUse', {}, req.t('admin.sportInUse'));
  }

  await sport.deleteOne();
  await cacheDel('sports:list');
  res.status(200).json(new ApiResponse(200, req.t('admin.sportDeleted')));
});

export const listSports = catchAsync(async (req, res) => {
  const sports = await Sport.find().sort({ createdAt: 1 }).lean();
  res.status(200).json(new ApiResponse(200, req.t('sport.fetched'), sports));
});

export const updateUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'user.notFound', {}, req.t('user.notFound'));

  if (req.body.email && req.body.email !== user.email) {
    const dup = await User.exists({ email: req.body.email, _id: { $ne: user._id } });
    if (dup) throw new ApiError(409, 'auth.emailInUse', {}, req.t('auth.emailInUse'));
  }
  if (req.body.role && req.body.role !== user.role && req.body.role !== 'admin' && user.role === 'admin') {
    throw new ApiError(403, 'common.forbidden', {}, req.t('common.forbidden'));
  }

  Object.assign(user, req.body);
  await user.save();
  res.status(200).json(new ApiResponse(200, req.t('admin.userUpdated'), user.toSafeJSON()));
});

export const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'user.notFound', {}, req.t('user.notFound'));
  if (user.role === 'admin') throw new ApiError(403, 'common.forbidden', {}, req.t('common.forbidden'));

  const [playerProfiles, coachProfiles, clubProfiles, agentProfiles] = await Promise.all([
    PlayerProfile.find({ user: user._id }).lean(),
    CoachProfile.find({ user: user._id }).lean(),
    ClubProfile.find({ user: user._id }).lean(),
    AgentProfile.find({ user: user._id }).lean(),
  ]);
  const profileIds = [...playerProfiles, ...coachProfiles, ...clubProfiles, ...agentProfiles].map((p) => p._id);

  const offers = await Offer.find({ $or: [{ fromUser: user._id }, { toUser: user._id }] }).select('_id').lean();
  const offerIds = offers.map((o) => o._id);
  const negs = await Negotiation.find({ participants: user._id }).select('_id').lean();
  const negIds = negs.map((n) => n._id);

  await Promise.all([
    PlayerProfile.deleteMany({ user: user._id }),
    CoachProfile.deleteMany({ user: user._id }),
    ClubProfile.deleteMany({ user: user._id }),
    AgentProfile.deleteMany({ user: user._id }),
    Media.deleteMany({ user: user._id }),
    Shortlist.deleteMany({ owner: user._id }),
    Offer.deleteMany({ _id: { $in: offerIds } }),
    Negotiation.deleteMany({ _id: { $in: negIds } }),
    Message.deleteMany({ negotiation: { $in: negIds } }),
    KycRequest.deleteMany({ user: user._id }),
    Subscription.deleteMany({ user: user._id }),
    Trial.deleteMany({ $or: [{ player: user._id }, { club: user._id }] }),
    Rating.deleteMany({ $or: [{ fromUser: user._id }, { toUser: user._id }] }),
    Notification.deleteMany({ user: user._id }),
    ContactRequest.deleteMany({ $or: [{ sender: user._id }, { playerUser: user._id }] }),
    RefreshToken.deleteMany({ user: user._id }),
    Advertisement.deleteMany({ advertiser: user._id }),
    User.deleteOne({ _id: user._id }),
    AgentProfile.updateMany({ clients: { $in: profileIds } }, { $pull: { clients: { $in: profileIds } } }),
  ]);

  res.status(200).json(new ApiResponse(200, req.t('admin.userDeleted'), { id: user._id }));
});

export const listMedia = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = {};
  if (req.query.kind) filter.kind = req.query.kind;
  if (req.query.ownerType) filter.ownerModel = req.query.ownerType;
  if (req.query.isPublic !== undefined) filter.isPublic = req.query.isPublic === 'true';

  const total = await Media.countDocuments(filter);
  const data = await Media.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'email displayName role')
    .lean();

  res.status(200).json(new ApiResponse(200, req.t('admin.mediaFetched'), data, paginateMeta(total, page, limit)));
});

export const deleteMedia = catchAsync(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) throw new ApiError(404, 'media.notFound', {}, req.t('media.notFound'));
  await media.deleteOne();
  res.status(200).json(new ApiResponse(200, req.t('media.deleted')));
});
