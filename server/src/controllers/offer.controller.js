import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Offer } from '../models/Offer.js';
import { PlayerProfile } from '../models/PlayerProfile.js';
import { ClubProfile } from '../models/ClubProfile.js';
import { AgentProfile } from '../models/AgentProfile.js';
import { User } from '../models/User.js';
import { ROLES, OFFER_TYPE, OFFER_STATUS, OFFER_DEFAULT_EXPIRY_DAYS, PLAN_CODES } from '../config/constants.js';
import { getSettingNumber } from '../services/settings.service.js';
import { requireSubscription } from '../services/subscription.service.js';
import { createNotification } from '../services/notification.service.js';
import { sendOfferEmail } from '../services/email.service.js';
import { emitToUser } from '../config/socket.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

async function nextOfferNumber() {
  const doc = await Offer.findOne().sort({ createdAt: -1 }).select('offerNumber').lean();
  const last = doc?.offerNumber?.replace(/\D/g, '') || '0';
  const next = String(Number(last) + 1).padStart(6, '0');
  return `OF-${next}`;
}

function isClubLike(user) {
  return user.role === ROLES.CLUB || user.role === ROLES.AGENT;
}

export const createOffer = catchAsync(async (req, res) => {
  if (!isClubLike(req.user)) {
    throw new ApiError(403, 'common.forbidden', {}, req.t('common.forbidden'));
  }

  await requireSubscription(req.userId, [PLAN_CODES.CLUB_SCOUT, PLAN_CODES.AGENT_PRO], req.t);

  const player = await PlayerProfile.findById(req.body.playerProfileId)
    .populate('user', 'email displayName lang')
    .lean();
  if (!player) throw new ApiError(404, 'player.notFound');

  const toUserId = player.user._id.toString();
  if (toUserId === req.userId) {
    throw new ApiError(400, 'offer.cannotOfferSelf', {}, req.t('offer.cannotOfferSelf'));
  }

  if (req.body.type === OFFER_TYPE.OFFICIAL) {
    const hasInterest = await Offer.exists({
      fromUser: req.userId,
      toUser: toUserId,
      type: OFFER_TYPE.INTEREST,
      status: { $in: [OFFER_STATUS.SENT, OFFER_STATUS.VIEWED] },
    });
    if (!hasInterest) {
      throw new ApiError(400, 'offer.interestRequired', {}, req.t('offer.interestRequired'));
    }
  }

  if (req.body.type === OFFER_TYPE.OFFICIAL && req.body.salaryPerYear <= 0) {
    throw new ApiError(400, 'validation.salaryPositive', {}, req.t('validation.salaryPositive'));
  }

  const clubProfile = await ClubProfile.findOne({ user: req.userId }).lean();
  const defaultExpiryDays = await getSettingNumber('offers.defaultExpiryDays', OFFER_DEFAULT_EXPIRY_DAYS);

  const offer = await Offer.create({
    offerNumber: await nextOfferNumber(),
    type: req.body.type,
    fromUser: req.userId,
    fromClub: clubProfile?._id || null,
    toUser: toUserId,
    toPlayer: player._id,
    salaryPerYear: req.body.salaryPerYear,
    currency: req.body.currency,
    contractDurationMonths: req.body.contractDurationMonths,
    transferFee: req.body.transferFee,
    bonus: req.body.bonus,
    notes: req.body.notes || { en: '', ar: '' },
    expiresAt: req.body.expiresAt || new Date(Date.now() + defaultExpiryDays * 24 * 60 * 60 * 1000),
    statusHistory: [{ status: OFFER_STATUS.SENT, by: req.userId }],
  });

  const clubName = clubProfile?.clubName || req.user.displayName || req.user.firstName || '';
  const typeLabel = offer.type === OFFER_TYPE.OFFICIAL ? req.t('offer.officialSent') : req.t('offer.interestSent');

  createNotification({
    user: toUserId,
    type: offer.type === OFFER_TYPE.OFFICIAL ? 'offer' : 'interest',
    title: { en: `${typeLabel} — ${clubName}`, ar: `${typeLabel} — ${clubName}` },
    body: { en: offer.type === OFFER_TYPE.OFFICIAL ? `Official offer received from ${clubName}` : `Expression of interest from ${clubName}`, ar: `عرض رسمي من ${clubName}` },
    data: { offerId: offer._id, type: offer.type },
    lang: player.user.lang,
  }).catch(() => {});

  sendOfferEmail({
    to: player.user.email,
    lang: player.user.lang,
    clubName,
    type: offer.type,
  }).catch(() => {});

  emitToUser(toUserId, 'offer:new', { id: offer._id, type: offer.type });

  res.status(201).json(
    new ApiResponse(201, offer.type === OFFER_TYPE.OFFICIAL ? req.t('offer.officialSent') : req.t('offer.interestSent'), offer)
  );
});

export const listMyOffers = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const direction = req.query.direction === 'sent' ? 'sent' : 'received';
  const filter = direction === 'sent' ? { fromUser: req.userId } : { toUser: req.userId };

  if (req.query.status) filter.status = req.query.status;

  const total = await Offer.countDocuments(filter);
  const data = await Offer.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate(direction === 'sent' ? 'toUser' : 'fromUser', 'displayName firstName lastName avatar')
    .populate('fromClub', 'clubName logo isVerified')
    .populate('toPlayer', 'sportCode primaryPosition heightCm')
    .lean();

  res.status(200).json(new ApiResponse(200, req.t('offer.fetched'), data, paginateMeta(total, page, limit)));
});

export const getOffer = catchAsync(async (req, res) => {
  const offer = await Offer.findById(req.params.id)
    .populate('fromUser', 'displayName firstName lastName avatar')
    .populate('fromClub', 'clubName logo isVerified')
    .populate('toUser', 'displayName firstName lastName avatar')
    .populate('toPlayer', 'sportCode primaryPosition heightCm contractStatus')
    .lean();
  if (!offer) throw new ApiError(404, 'offer.notFound');

  const isParticipant = offer.fromUser._id.toString() === req.userId || offer.toUser._id.toString() === req.userId;
  if (!isParticipant && req.user.role !== 'admin') {
    throw new ApiError(403, 'offer.forbidden', {}, req.t('offer.forbidden'));
  }

  if (offer.toUser._id.toString() === req.userId && !offer.viewedAt) {
    Offer.updateOne(
      { _id: offer._id, viewedAt: null },
      { $set: { viewedAt: new Date(), status: OFFER_STATUS.VIEWED }, $push: { statusHistory: { status: OFFER_STATUS.VIEWED } } }
    ).exec().catch(() => {});
    offer.viewedAt = new Date();
    offer.status = OFFER_STATUS.VIEWED;
  }

  res.status(200).json(new ApiResponse(200, req.t('offer.fetched'), offer));
});

export const respondOffer = catchAsync(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw new ApiError(404, 'offer.notFound');
  if (offer.toUser.toString() !== req.userId) {
    throw new ApiError(403, 'offer.forbidden', {}, req.t('offer.forbidden'));
  }

  const settled = [OFFER_STATUS.ACCEPTED, OFFER_STATUS.DECLINED, OFFER_STATUS.WITHDRAWN];
  if (settled.includes(offer.status)) {
    throw new ApiError(409, 'offer.alreadyResponded', {}, req.t('offer.alreadyResponded'));
  }
  if (offer.expiresAt && offer.expiresAt < new Date()) {
    throw new ApiError(400, 'offer.expired', {}, req.t('offer.expired'));
  }

  const status = req.body.action === 'accept' ? OFFER_STATUS.ACCEPTED : OFFER_STATUS.DECLINED;
  offer.status = status;
  offer.respondedAt = new Date();
  offer.statusHistory.push({ status, by: req.userId, note: req.body.note || '' });
  await offer.save();

  createNotification({
    user: offer.fromUser,
    type: 'offer',
    title: status === OFFER_STATUS.ACCEPTED ? { en: 'Offer accepted', ar: 'تم قبول العرض' } : { en: 'Offer declined', ar: 'تم رفض العرض' },
    body: status === OFFER_STATUS.ACCEPTED ? { en: 'Your offer was accepted', ar: 'تم قبول عرضك' } : { en: 'Your offer was declined', ar: 'تم رفض عرضك' },
    data: { offerId: offer._id },
  }).catch(() => {});
  emitToUser(offer.fromUser.toString(), 'offer:update', { id: offer._id, status });

  res.status(200).json(
    new ApiResponse(200, status === OFFER_STATUS.ACCEPTED ? req.t('offer.accepted') : req.t('offer.declined'), offer)
  );
});

export const withdrawOffer = catchAsync(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw new ApiError(404, 'offer.notFound');
  if (offer.fromUser.toString() !== req.userId) {
    throw new ApiError(403, 'offer.forbidden', {}, req.t('offer.forbidden'));
  }

  const settled = [OFFER_STATUS.ACCEPTED, OFFER_STATUS.DECLINED, OFFER_STATUS.WITHDRAWN];
  if (settled.includes(offer.status)) {
    throw new ApiError(409, 'offer.alreadyResponded', {}, req.t('offer.alreadyResponded'));
  }

  offer.status = OFFER_STATUS.WITHDRAWN;
  offer.statusHistory.push({ status: OFFER_STATUS.WITHDRAWN, by: req.userId });
  await offer.save();

  emitToUser(offer.toUser.toString(), 'offer:update', { id: offer._id, status: OFFER_STATUS.WITHDRAWN });
  res.status(200).json(new ApiResponse(200, req.t('offer.withdrawn'), offer));
});
