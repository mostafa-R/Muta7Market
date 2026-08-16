import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { AgentProfile } from '../models/AgentProfile.js';
import { PlayerProfile } from '../models/PlayerProfile.js';
import { User } from '../models/User.js';
import { ROLES } from '../config/constants.js';
import { requireMongoId } from '../middleware/misc.middleware.js';

function assertAgent(user, t) {
  if (user.role !== ROLES.AGENT) throw new ApiError(403, 'common.forbidden', {}, t('common.forbidden'));
}

export const createProfile = catchAsync(async (req, res) => {
  assertAgent(req.user, req.t);
  const existing = await AgentProfile.findOne({ user: req.userId });
  if (existing) throw new ApiError(409, 'agent.profileUpdated');

  const profile = await AgentProfile.create({ ...req.body, user: req.userId });
  res.status(201).json(new ApiResponse(201, req.t('agent.profileCreated'), profile));
});

export const updateProfile = catchAsync(async (req, res) => {
  assertAgent(req.user, req.t);
  const profile = await AgentProfile.findOneAndUpdate({ user: req.userId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!profile) throw new ApiError(404, 'agent.notFound');
  res.status(200).json(new ApiResponse(200, req.t('agent.profileUpdated'), profile));
});

export const getMyProfile = catchAsync(async (req, res) => {
  assertAgent(req.user, req.t);
  const profile = await AgentProfile.findOne({ user: req.userId })
    .populate('user', 'displayName email avatar lang')
    .populate('clients', 'sportCode primaryPosition heightCm contractStatus isPublic')
    .lean();
  if (!profile) throw new ApiError(404, 'agent.notFound');
  res.status(200).json(new ApiResponse(200, req.t('agent.profileFetched'), profile));
});

export const getPublicProfile = catchAsync(async (req, res) => {
  const profile = await AgentProfile.findById(req.params.agentId)
    .populate('user', 'displayName avatar isEmailVerified')
    .lean();
  if (!profile) throw new ApiError(404, 'agent.notFound');
  if (!profile.isPublic) {
    res.status(200).json(new ApiResponse(200, req.t('agent.profileFetched'), { ...profile, clients: [] }));
    return;
  }
  res.status(200).json(new ApiResponse(200, req.t('agent.profileFetched'), profile));
});

export const listPublic = catchAsync(async (req, res) => {
  const profiles = await AgentProfile.find({ isPublic: true })
    .select('-clients -about')
    .populate('user', 'displayName avatar')
    .sort({ ratingAvg: -1 })
    .limit(50)
    .lean();
  res.status(200).json(new ApiResponse(200, req.t('agent.profileFetched'), profiles));
});

export const addClient = catchAsync(async (req, res) => {
  assertAgent(req.user, req.t);
  requireMongoId(req.body.playerProfileId, 'playerProfileId');

  const player = await PlayerProfile.findById(req.body.playerProfileId);
  if (!player) throw new ApiError(404, 'player.notFound');

  const profile = await AgentProfile.findOne({ user: req.userId });
  if (!profile) throw new ApiError(404, 'agent.notFound');
  if (profile.clients.includes(player._id)) throw new ApiError(409, 'agent.clientAlreadyAdded');

  profile.clients.push(player._id);
  await profile.save();
  res.status(200).json(new ApiResponse(200, req.t('agent.clientAdded'), { clients: profile.clients }));
});

export const removeClient = catchAsync(async (req, res) => {
  assertAgent(req.user, req.t);
  requireMongoId(req.params.playerId, 'playerId');

  const profile = await AgentProfile.findOne({ user: req.userId });
  if (!profile) throw new ApiError(404, 'agent.notFound');

  if (!profile.clients.some((id) => id.toString() === req.params.playerId)) {
    throw new ApiError(404, 'agent.clientNotFound');
  }
  profile.clients = profile.clients.filter((id) => id.toString() !== req.params.playerId);
  await profile.save();
  res.status(200).json(new ApiResponse(200, req.t('agent.clientRemoved'), { clients: profile.clients }));
});
