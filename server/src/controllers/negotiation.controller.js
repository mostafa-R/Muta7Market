import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Negotiation } from '../models/Negotiation.js';
import { Message } from '../models/Message.js';
import { Offer } from '../models/Offer.js';
import { NEGOTIATION_STATUS, ROLES } from '../config/constants.js';
import { emitToNegotiation } from '../config/socket.js';
import { createNotification } from '../services/notification.service.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

async function loadParticipating(req, id) {
  const negotiation = await Negotiation.findById(id);
  if (!negotiation) throw new ApiError(404, 'negotiation.notFound');
  const isParticipant = negotiation.participants.some((p) => p.toString() === req.userId);
  if (!isParticipant && req.user.role !== 'admin') {
    throw new ApiError(403, 'negotiation.forbidden', {}, req.t('negotiation.forbidden'));
  }
  return negotiation;
}

export const createNegotiation = catchAsync(async (req, res) => {
  if (![ROLES.CLUB, ROLES.AGENT].includes(req.user.role)) {
    throw new ApiError(403, 'common.forbidden', {}, req.t('common.forbidden'));
  }

  let offer = null;
  if (req.body.offerId) {
    offer = await Offer.findById(req.body.offerId);
    if (!offer) throw new ApiError(404, 'offer.notFound');
    if (offer.fromUser.toString() !== req.userId) {
      throw new ApiError(403, 'offer.forbidden', {}, req.t('offer.forbidden'));
    }
  }

  const playerSide = offer ? offer.toUser : req.body.playerUserId;
  if (!playerSide) throw new ApiError(400, 'validation.fieldRequired', { field: 'playerUserId' }, req.t('validation.fieldRequired'));

  const existing = await Negotiation.findOne({ participants: { $all: [req.userId, playerSide] }, status: NEGOTIATION_STATUS.OPEN });
  if (existing) {
    return res.status(200).json(new ApiResponse(200, req.t('negotiation.created'), existing));
  }

  const negotiation = await Negotiation.create({
    offer: offer?._id || null,
    participants: [req.userId, playerSide],
    clubSide: req.userId,
    playerSide,
  });

  const otherId = playerSide.toString();
  emitToNegotiation(negotiation._id.toString(), 'negotiation:new', { id: negotiation._id });
  createNotification({
    user: otherId,
    type: 'negotiation',
    title: { en: 'New negotiation room', ar: 'غرفة مفاوضات جديدة' },
    body: { en: 'A club opened a negotiation room with you', ar: 'فتح نادٍ غرفة مفاوضات معك' },
    data: { negotiationId: negotiation._id },
  }).catch(() => {});

  res.status(201).json(new ApiResponse(201, req.t('negotiation.created'), negotiation));
});

export const listMyNegotiations = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = { participants: req.userId };
  if (req.query.status) filter.status = req.query.status;

  const total = await Negotiation.countDocuments(filter);
  const data = await Negotiation.find(filter)
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('participants', 'displayName firstName lastName avatar')
    .populate('offer', 'offerNumber type status')
    .lean();

  res.status(200).json(new ApiResponse(200, req.t('negotiation.fetched'), data, paginateMeta(total, page, limit)));
});

export const getNegotiation = catchAsync(async (req, res) => {
  const negotiation = await loadParticipating(req, req.params.id);
  await negotiation.populate('participants', 'displayName firstName lastName avatar');
  await negotiation.populate('offer', 'offerNumber type status salaryPerYear currency');
  res.status(200).json(new ApiResponse(200, req.t('negotiation.fetched'), negotiation));
});

export const listMessages = catchAsync(async (req, res) => {
  const negotiation = await loadParticipating(req, req.params.id);
  const { page, limit, skip } = await getPagination(req.query);

  const total = await Message.countDocuments({ negotiation: negotiation._id });
  const data = await Message.find({ negotiation: negotiation._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'displayName firstName lastName avatar')
    .lean();

  const reversed = data.reverse();
  const otherParticipants = negotiation.participants.filter((p) => p.toString() !== req.userId);
  if (otherParticipants.length) {
    const others = otherParticipants.map((p) => p.toString());
    const unread = reversed.filter((m) => m.sender._id.toString() !== req.userId && !m.readBy.some((r) => others.includes(r.toString())));
    if (unread.length) {
      const msgIds = unread.map((m) => m._id);
      await Message.updateMany({ _id: { $in: msgIds } }, { $addToSet: { readBy: req.userId } });
      const set = {};
      set[`lastReadAt.${req.userId}`] = new Date();
      await Negotiation.updateOne({ _id: negotiation._id }, { $set: set });
    }
  }

  res.status(200).json(new ApiResponse(200, req.t('negotiation.messagesFetched'), reversed, paginateMeta(total, page, limit)));
});

export const sendMessage = catchAsync(async (req, res) => {
  const negotiation = await loadParticipating(req, req.params.id);
  if (negotiation.status !== NEGOTIATION_STATUS.OPEN) {
    throw new ApiError(400, 'negotiation.cannotSend', {}, req.t('negotiation.cannotSend'));
  }

  const message = await Message.create({
    negotiation: negotiation._id,
    sender: req.userId,
    body: req.body.body,
  });

  await Negotiation.updateOne({ _id: negotiation._id }, { lastMessageAt: new Date() });

  const payload = {
    id: message._id,
    negotiationId: negotiation._id,
    sender: { _id: req.userId, displayName: req.user.displayName },
    body: message.body,
    createdAt: message.createdAt,
  };
  emitToNegotiation(negotiation._id.toString(), 'negotiation:message', payload);

  const otherIds = negotiation.participants.filter((p) => p.toString() !== req.userId);
  otherIds.forEach((id) => {
    createNotification({
      user: id,
      type: 'message',
      title: { en: 'New message', ar: 'رسالة جديدة' },
      body: { en: `${req.user.displayName}: ${message.body.slice(0, 120)}`, ar: `${req.user.displayName}: ${message.body.slice(0, 120)}` },
      data: { negotiationId: negotiation._id },
    }).catch(() => {});
  });

  res.status(201).json(new ApiResponse(201, req.t('negotiation.messageSent'), message));
});

export const closeNegotiation = catchAsync(async (req, res) => {
  const negotiation = await loadParticipating(req, req.params.id);
  if (negotiation.status === NEGOTIATION_STATUS.CLOSED) {
    return res.status(200).json(new ApiResponse(200, req.t('negotiation.closed'), negotiation));
  }

  negotiation.status = NEGOTIATION_STATUS.CLOSED;
  negotiation.closedBy = req.userId;
  negotiation.closedAt = new Date();
  await negotiation.save();

  emitToNegotiation(negotiation._id.toString(), 'negotiation:closed', { id: negotiation._id, closedBy: req.userId });
  res.status(200).json(new ApiResponse(200, req.t('negotiation.closed'), negotiation));
});
