import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Shortlist } from '../models/Shortlist.js';
import { PlayerProfile } from '../models/PlayerProfile.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

async function loadOwned(req, id) {
  const shortlist = await Shortlist.findById(id);
  if (!shortlist) throw new ApiError(404, 'shortlist.notFound');
  if (shortlist.owner.toString() !== req.userId) {
    throw new ApiError(403, 'shortlist.forbidden', {}, req.t('shortlist.forbidden'));
  }
  return shortlist;
}

export const listMyShortlists = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = { owner: req.userId };
  const total = await Shortlist.countDocuments(filter);
  const data = await Shortlist.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-members')
    .lean();
  res.status(200).json(new ApiResponse(200, req.t('shortlist.fetched'), data, paginateMeta(total, page, limit)));
});

export const createShortlist = catchAsync(async (req, res) => {
  const shortlist = await Shortlist.create({ ...req.body, owner: req.userId });
  res.status(201).json(new ApiResponse(201, req.t('shortlist.created'), shortlist));
});

export const getShortlist = catchAsync(async (req, res) => {
  const shortlist = await loadOwned(req, req.params.id);
  await shortlist.populate('members', 'sportCode primaryPosition heightCm contractStatus isPublic ratingAvg');
  res.status(200).json(new ApiResponse(200, req.t('shortlist.fetched'), shortlist));
});

export const updateShortlist = catchAsync(async (req, res) => {
  const shortlist = await loadOwned(req, req.params.id);
  Object.assign(shortlist, req.body);
  await shortlist.save();
  res.status(200).json(new ApiResponse(200, req.t('shortlist.updated'), shortlist));
});

export const deleteShortlist = catchAsync(async (req, res) => {
  const shortlist = await loadOwned(req, req.params.id);
  await shortlist.deleteOne();
  res.status(200).json(new ApiResponse(200, req.t('shortlist.deleted')));
});

export const addMember = catchAsync(async (req, res) => {
  const shortlist = await loadOwned(req, req.params.id);

  const player = await PlayerProfile.findById(req.body.playerProfileId);
  if (!player) throw new ApiError(404, 'player.notFound');

  const already = shortlist.members.some((id) => id.toString() === req.body.playerProfileId);
  if (already) throw new ApiError(409, 'shortlist.memberExists');

  shortlist.members.push(player._id);
  await shortlist.save();
  res.status(200).json(new ApiResponse(200, req.t('shortlist.memberAdded'), { membersCount: shortlist.members.length }));
});

export const removeMember = catchAsync(async (req, res) => {
  const shortlist = await loadOwned(req, req.params.id);
  const playerId = req.params.playerId;
  shortlist.members = shortlist.members.filter((id) => id.toString() !== playerId);
  await shortlist.save();
  res.status(200).json(new ApiResponse(200, req.t('shortlist.memberRemoved'), { membersCount: shortlist.members.length }));
});
