import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { ContactRequest } from '../models/ContactRequest.js';
import { PlayerProfile } from '../models/PlayerProfile.js';
import { ROLES, PLAN_CODES } from '../config/constants.js';
import { requireSubscription } from '../services/subscription.service.js';
import { createNotification } from '../services/notification.service.js';
import { sendContactEmail } from '../services/email.service.js';
import { emitToUser } from '../config/socket.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

function assertSender(req) {
  if (![ROLES.CLUB, ROLES.AGENT, ROLES.COACH].includes(req.user.role)) {
    throw new ApiError(403, 'common.forbidden', {}, req.t('common.forbidden'));
  }
}

export const requestContact = catchAsync(async (req, res) => {
  assertSender(req);

  if (req.user.role !== ROLES.COACH) {
    await requireSubscription(req.userId, [PLAN_CODES.CLUB_SCOUT, PLAN_CODES.AGENT_PRO], req.t);
  }

  const player = await PlayerProfile.findById(req.body.playerProfileId)
    .populate('user', 'email displayName lang')
    .lean();
  if (!player) throw new ApiError(404, 'player.notFound');
  if (player.user._id.toString() === req.userId) {
    throw new ApiError(400, 'offer.cannotOfferSelf', {}, req.t('offer.cannotOfferSelf'));
  }

  const existing = await ContactRequest.findOne({ sender: req.userId, player: player._id });
  if (existing) throw new ApiError(409, 'contact.alreadySent', {}, req.t('contact.alreadySent'));

  const request = await ContactRequest.create({
    sender: req.userId,
    senderRole: req.user.role,
    player: player._id,
    playerUser: player.user._id,
    message: req.body.message || '',
  });

  const senderName = req.user.displayName || req.user.firstName || '';
  createNotification({
    user: player.user._id,
    type: 'contact',
    title: { en: 'New contact request', ar: 'طلب تواصل جديد' },
    body: { en: `${senderName} wants to contact you`, ar: `${senderName} يريد التواصل معك` },
    data: { contactRequestId: request._id },
    lang: player.user.lang,
  }).catch(() => {});

  sendContactEmail({ to: player.user.email, lang: player.user.lang, senderName }).catch(() => {});
  emitToUser(player.user._id.toString(), 'contact:new', { id: request._id });

  res.status(201).json(new ApiResponse(201, req.t('contact.requestSent'), request));
});

export const listReceived = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = { playerUser: req.userId };
  if (req.query.status) filter.status = req.query.status;

  const total = await ContactRequest.countDocuments(filter);
  const data = await ContactRequest.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'displayName firstName lastName avatar role')
    .populate('player', 'sportCode primaryPosition')
    .lean();

  res.status(200).json(new ApiResponse(200, req.t('contact.fetched'), data, paginateMeta(total, page, limit)));
});

export const listSent = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = { sender: req.userId };
  const total = await ContactRequest.countDocuments(filter);
  const data = await ContactRequest.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('player', 'sportCode primaryPosition heightCm')
    .lean();
  res.status(200).json(new ApiResponse(200, req.t('contact.fetched'), data, paginateMeta(total, page, limit)));
});

export const respondContact = catchAsync(async (req, res) => {
  const request = await ContactRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'contact.notFound');
  if (request.playerUser.toString() !== req.userId) {
    throw new ApiError(403, 'contact.forbidden', {}, req.t('contact.forbidden'));
  }

  request.status = 'responded';
  request.response = req.body.response;
  request.respondedAt = new Date();
  await request.save();

  createNotification({
    user: request.sender,
    type: 'contact',
    title: { en: 'Contact request answered', ar: 'تم الرد على طلب التواصل' },
    body: { en: `The player responded to your contact request`, ar: 'رد اللاعب على طلب التواصل الخاص بك' },
    data: { contactRequestId: request._id },
  }).catch(() => {});

  res.status(200).json(new ApiResponse(200, req.t('contact.responded'), request));
});

export const markRead = catchAsync(async (req, res) => {
  const request = await ContactRequest.findOneAndUpdate(
    { _id: req.params.id, playerUser: req.userId, status: 'sent' },
    { status: 'read', readAt: new Date() },
    { new: true }
  );
  if (!request) throw new ApiError(404, 'contact.notFound');
  res.status(200).json(new ApiResponse(200, req.t('contact.markedRead'), request));
});
