import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';
import { PlayerProfile } from '../models/PlayerProfile.js';
import { CoachProfile } from '../models/CoachProfile.js';
import { ClubProfile } from '../models/ClubProfile.js';
import { AgentProfile } from '../models/AgentProfile.js';
import { Media } from '../models/Media.js';
import { Shortlist } from '../models/Shortlist.js';
import { Offer } from '../models/Offer.js';
import { Negotiation } from '../models/Negotiation.js';
import { Message } from '../models/Message.js';
import { KycRequest } from '../models/KycRequest.js';
import { Subscription } from '../models/Subscription.js';
import { Trial } from '../models/Trial.js';
import { Rating } from '../models/Rating.js';
import { Notification } from '../models/Notification.js';
import { ContactRequest } from '../models/ContactRequest.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { createNotification } from '../services/notification.service.js';
import { emitToUser } from '../config/socket.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

const ENTITY_CONFIG = {
  player: {
    model: PlayerProfile,
    label: 'player',
    listLabel: 'players',
    userRole: 'player',
    profileRequired: true,
  },
  coach: {
    model: CoachProfile,
    label: 'coach',
    listLabel: 'coaches',
    userRole: 'coach',
    profileRequired: true,
  },
  club: {
    model: ClubProfile,
    label: 'club',
    listLabel: 'clubs',
    userRole: 'club',
    profileRequired: true,
  },
  agent: {
    model: AgentProfile,
    label: 'agent',
    listLabel: 'agents',
    userRole: 'agent',
    profileRequired: true,
  },
};

function getConfig(role) {
  const cfg = ENTITY_CONFIG[role];
  if (!cfg) throw new ApiError(400, 'validation.invalidEnum', { field: 'role' }, 'Invalid entity type');
  return cfg;
}

function buildUserData(req, cfg) {
  const data = {
    email: req.body.email,
    password: req.body.password,
    role: cfg.userRole,
    lang: req.body.lang || 'en',
  };
  if (req.body.firstName) data.firstName = req.body.firstName;
  if (req.body.lastName) data.lastName = req.body.lastName;
  if (req.body.displayName) data.displayName = req.body.displayName;
  if (req.body.avatar) data.avatar = req.body.avatar;
  if (typeof req.body.isEmailVerified === 'boolean') data.isEmailVerified = req.body.isEmailVerified;
  if (typeof req.body.isActive === 'boolean') data.isActive = req.body.isActive;
  return data;
}

function extractUserFields(body) {
  const keys = ['email', 'password', 'firstName', 'lastName', 'displayName', 'lang', 'avatar', 'isEmailVerified', 'isActive'];
  const userPart = {};
  for (const key of keys) {
    if (body[key] !== undefined) userPart[key] = body[key];
  }
  return userPart;
}

function extractProfileFields(body) {
  const userKeys = new Set(['email', 'password', 'firstName', 'lastName', 'displayName', 'lang', 'avatar', 'isEmailVerified', 'isActive']);
  const profilePart = {};
  for (const key of Object.keys(body)) {
    if (!userKeys.has(key)) profilePart[key] = body[key];
  }
  return profilePart;
}

async function cascadeDeleteUser(userId, profileDoc) {
  const offers = await Offer.find({ $or: [{ fromUser: userId }, { toUser: userId }] }).select('_id').lean();
  const offerIds = offers.map((o) => o._id);
  const negs = await Negotiation.find({ participants: userId }).select('_id').lean();
  const negIds = negs.map((n) => n._id);

  const profileId = profileDoc?._id;
  const queries = [
    Media.deleteMany({ user: userId }),
    Shortlist.deleteMany({ owner: userId }),
    Offer.deleteMany({ _id: { $in: offerIds } }),
    Negotiation.deleteMany({ _id: { $in: negIds } }),
    Message.deleteMany({ negotiation: { $in: negIds } }),
    KycRequest.deleteMany({ user: userId }),
    Subscription.deleteMany({ user: userId }),
    Trial.deleteMany({ $or: [{ player: userId }, { club: userId }] }),
    Rating.deleteMany({ $or: [{ fromUser: userId }, { toUser: userId }] }),
    Notification.deleteMany({ user: userId }),
    ContactRequest.deleteMany({ $or: [{ sender: userId }, { playerUser: userId }] }),
    RefreshToken.deleteMany({ user: userId }),
  ];
  if (profileId) {
    queries.push(AgentProfile.updateMany({ clients: profileId }, { $pull: { clients: profileId } }));
  }
  await Promise.all(queries);
  await User.deleteOne({ _id: userId });
}

export const listEntity = (role) =>
  catchAsync(async (req, res) => {
    const cfg = getConfig(role);
    const { page, limit, skip } = await getPagination(req.query);
    const filter = {};

    if (req.query.q) {
      const users = await User.find({ role: cfg.userRole, $or: [
        { email: { $regex: req.query.q, $options: 'i' } },
        { displayName: { $regex: req.query.q, $options: 'i' } },
        { firstName: { $regex: req.query.q, $options: 'i' } },
        { lastName: { $regex: req.query.q, $options: 'i' } },
      ] }).select('_id').lean();
      const userIds = users.map((u) => u._id);
      if (userIds.length) {
        filter.user = { $in: userIds };
      } else {
        filter.user = { $in: [] };
      }
    }
    if (req.query.sportCode) filter.sportCode = req.query.sportCode;
    if (req.query.country) filter.country = req.query.country;
    if (req.query.city) filter.city = req.query.city;
    if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';
    if (req.query.isPublic !== undefined) filter.isPublic = req.query.isPublic === 'true';
    if (req.query.contractStatus) filter.contractStatus = req.query.contractStatus;
    if (req.query.position) filter.primaryPosition = req.query.position;

    const total = await cfg.model.countDocuments(filter);
    const data = await cfg.model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'email displayName firstName lastName avatar isEmailVerified isActive lang')
      .lean();

    res.status(200).json(new ApiResponse(200, req.t(`admin.${cfg.listLabel}Fetched`), data, paginateMeta(total, page, limit)));
  });

export const createEntity = (role) =>
  catchAsync(async (req, res) => {
    const cfg = getConfig(role);

    const emailExists = await User.exists({ email: req.body.email });
    if (emailExists) throw new ApiError(409, 'auth.emailInUse', {}, req.t('auth.emailInUse'));

    const user = await User.create(buildUserData(req, cfg));

    try {
      const profileData = extractProfileFields(req.body);
      if (cfg.model === PlayerProfile && !profileData.birthDate) {
        profileData.birthDate = new Date('2000-01-01');
      }
      if (cfg.model === ClubProfile && !profileData.clubName) {
        profileData.clubName = req.body.displayName || `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim() || 'Club';
      }
      const profile = await cfg.model.create({ user: user._id, ...profileData });

      createNotification({
        user: user._id,
        type: 'system',
        title: { en: 'Welcome to Muta7 Market', ar: 'مرحباً بك في سوق محترف' },
        body: { en: 'Your profile was created by the platform administration', ar: 'تم إنشاء ملفك بواسطة إدارة المنصة' },
        data: { role: cfg.userRole },
      }).catch(() => {});
      emitToUser(user._id.toString(), 'account:created', { role: cfg.userRole });

      res.status(201).json(new ApiResponse(201, req.t(`admin.${cfg.label}Created`), { user: user.toSafeJSON(), profile }));
    } catch (err) {
      await User.deleteOne({ _id: user._id });
      throw err;
    }
  });

export const updateEntity = (role) =>
  catchAsync(async (req, res) => {
    const cfg = getConfig(role);
    const profile = await cfg.model.findOne({ user: req.params.id });
    if (!profile) throw new ApiError(404, `${cfg.label}.notFound`, {}, req.t(`${cfg.label}.notFound`));

    const userPart = extractUserFields(req.body);
    if (userPart.email) {
      const dup = await User.exists({ email: userPart.email, _id: { $ne: req.params.id } });
      if (dup) throw new ApiError(409, 'auth.emailInUse', {}, req.t('auth.emailInUse'));
    }
    if (Object.keys(userPart).length) {
      await User.updateOne({ _id: req.params.id }, userPart);
    }

    const profilePart = extractProfileFields(req.body);
    if (Object.keys(profilePart).length) {
      Object.assign(profile, profilePart);
      await profile.save();
    }

    const user = await User.findById(req.params.id).select('-password -emailVerificationTokenHash -passwordResetTokenHash').lean();
    res.status(200).json(new ApiResponse(200, req.t(`admin.${cfg.label}Updated`), { user, profile }));
  });

export const deleteEntity = (role) =>
  catchAsync(async (req, res) => {
    const cfg = getConfig(role);
    const profile = await cfg.model.findOne({ user: req.params.id });
    if (!profile) throw new ApiError(404, `${cfg.label}.notFound`, {}, req.t(`${cfg.label}.notFound`));

    await cfg.model.deleteOne({ _id: profile._id });
    await cascadeDeleteUser(req.params.id, profile);
    res.status(200).json(new ApiResponse(200, req.t(`admin.${cfg.label}Deleted`), { id: req.params.id }));
  });

export const verifyEntity = (role) =>
  catchAsync(async (req, res) => {
    const cfg = getConfig(role);
    const profile = await cfg.model.findOne({ user: req.params.id });
    if (!profile) throw new ApiError(404, `${cfg.label}.notFound`, {}, req.t(`${cfg.label}.notFound`));

    const verified = req.body.verified === true;
    profile.isVerified = verified;
    if (verified) profile.kycStatus = 'approved';
    await profile.save();

    createNotification({
      user: profile.user,
      type: 'kyc',
      title: verified ? { en: 'Verified badge granted', ar: 'تم منح علامة التوثيق' } : { en: 'Verified badge removed', ar: 'تم إزالة علامة التوثيق' },
      body: verified
        ? { en: 'Your profile is now officially verified', ar: 'ملفك الشخصي موثق رسمياً الآن' }
        : { en: 'Your verified badge was removed by administration', ar: 'تمت إزالة علامة التوثيق من ملفك بواسطة الإدارة' },
      data: { verified },
    }).catch(() => {});
    emitToUser(profile.user.toString(), 'profile:verify', { verified });

    res.status(200).json(new ApiResponse(200, req.t(`admin.${cfg.label}Verified`), { id: profile.user, isVerified: verified }));
  });