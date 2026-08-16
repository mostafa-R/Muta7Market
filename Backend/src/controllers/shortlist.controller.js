import mongoose from "mongoose";
import Shortlist from "../models/shortlist.model.js";
import Player from "../models/player.model.js";
import Coach from "../models/coach.model.js";
import ProfileChange from "../models/profileChange.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { paginate } from "../utils/helpers.js";

const getUserId = (req) => req.user._id || req.user.id;

const PLAYER_SUMMARY_FIELDS =
  "name age nationality position job roleType game contractStatus isActive media isListed";
const COACH_SUMMARY_FIELDS =
  "name age nationality category contractStatus isActive media";

async function loadOwnedShortlist(id, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid shortlist ID");
  }
  const shortlist = await Shortlist.findOne({ _id: id, user: userId });
  if (!shortlist) throw new ApiError(404, "Shortlist not found");
  return shortlist;
}

export const getMyShortlists = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { page = 1, limit = 20 } = req.query;
  const { skip, limit: limitNum } = paginate(page, limit);

  const [items, total] = await Promise.all([
    Shortlist.find({ user: userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("players", "name age nationality position job isActive")
      .populate("coaches", "name age nationality category isActive"),
    Shortlist.countDocuments({ user: userId }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        shortlists: items,
        pagination: {
          total,
          pages: Math.ceil(total / limitNum),
          page: Math.max(1, parseInt(page) || 1),
          limit: limitNum,
        },
      },
      "Shortlists fetched successfully"
    )
  );
});

export const createShortlist = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const name = String(req.body.name || "My shortlist").trim();
  if (!name) throw new ApiError(400, "Shortlist name is required");

  const shortlist = await Shortlist.create({ user: userId, name });
  res.status(201).json(
    new ApiResponse(201, shortlist, "Shortlist created successfully")
  );
});

export const getShortlist = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const shortlist = await loadOwnedShortlist(req.params.id, userId).then(
    (s) =>
      Shortlist.findById(s._id)
        .populate("players", PLAYER_SUMMARY_FIELDS)
        .populate("coaches", COACH_SUMMARY_FIELDS)
  );

  res.status(200).json(
    new ApiResponse(200, shortlist, "Shortlist fetched successfully")
  );
});

export const updateShortlist = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const shortlist = await loadOwnedShortlist(req.params.id, userId);
  const name = String(req.body.name || "").trim();
  if (!name) throw new ApiError(400, "Shortlist name is required");

  shortlist.name = name;
  await shortlist.save();

  res.status(200).json(
    new ApiResponse(200, shortlist, "Shortlist updated successfully")
  );
});

export const deleteShortlist = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const shortlist = await loadOwnedShortlist(req.params.id, userId);
  await shortlist.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, "Shortlist deleted successfully")
  );
});

export const addPlayerToShortlist = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { playerId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(playerId)) {
    throw new ApiError(400, "Invalid player ID");
  }

  const player = await Player.findById(playerId);
  if (!player) throw new ApiError(404, "Player not found");

  const shortlist = await loadOwnedShortlist(req.params.id, userId);
  if (!shortlist.players.some((p) => String(p) === String(playerId))) {
    shortlist.players.push(playerId);
    await shortlist.save();
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { id: String(shortlist._id), players: shortlist.players },
      "Player added to shortlist"
    )
  );
});

export const removePlayerFromShortlist = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { playerId } = req.params;

  const shortlist = await loadOwnedShortlist(req.params.id, userId);
  shortlist.players = shortlist.players.filter(
    (p) => String(p) !== String(playerId)
  );
  await shortlist.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { id: String(shortlist._id), players: shortlist.players },
      "Player removed from shortlist"
    )
  );
});

export const addCoachToShortlist = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { coachId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(coachId)) {
    throw new ApiError(400, "Invalid coach ID");
  }

  const coach = await Coach.findById(coachId);
  if (!coach) throw new ApiError(404, "Coach not found");

  const shortlist = await loadOwnedShortlist(req.params.id, userId);
  if (!shortlist.coaches.some((c) => String(c) === String(coachId))) {
    shortlist.coaches.push(coachId);
    await shortlist.save();
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { id: String(shortlist._id), coaches: shortlist.coaches },
      "Coach added to shortlist"
    )
  );
});

export const removeCoachFromShortlist = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { coachId } = req.params;

  const shortlist = await loadOwnedShortlist(req.params.id, userId);
  shortlist.coaches = shortlist.coaches.filter(
    (c) => String(c) !== String(coachId)
  );
  await shortlist.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { id: String(shortlist._id), coaches: shortlist.coaches },
      "Coach removed from shortlist"
    )
  );
});

export const getShortlistChanges = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const shortlist = await loadOwnedShortlist(req.params.id, userId);

  const playerIds = shortlist.players;
  const coachIds = shortlist.coaches || [];
  if (!playerIds.length && !coachIds.length) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          changes: [],
          players: [],
          coaches: [],
          updatedPlayers: [],
          updatedCoaches: [],
        },
        "No profiles in this shortlist"
      )
    );
  }

  const { limit = 50 } = req.query;
  const limitNum = Math.min(parseInt(limit) || 50, 200);

  const [changes, players, coaches, updatedPlayers, updatedCoaches] =
    await Promise.all([
      ProfileChange.find({
        $or: [
          { profileType: "player", profileId: { $in: playerIds } },
          { profileType: "coach", profileId: { $in: coachIds } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .lean(),
      playerIds.length
        ? Player.find({ _id: { $in: playerIds } })
            .select(PLAYER_SUMMARY_FIELDS)
            .lean()
        : [],
      coachIds.length
        ? Coach.find({ _id: { $in: coachIds } })
            .select(COACH_SUMMARY_FIELDS)
            .lean()
        : [],
      Player.find({
        _id: { $in: playerIds },
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      })
        .select(PLAYER_SUMMARY_FIELDS)
        .lean(),
      Coach.find({
        _id: { $in: coachIds },
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      })
        .select(COACH_SUMMARY_FIELDS)
        .lean(),
    ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { changes, players, coaches, updatedPlayers, updatedCoaches },
      "Shortlist changes fetched successfully"
    )
  );
});

export const getScoutDashboard = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { limit = 20 } = req.query;
  const limitNum = Math.min(parseInt(limit) || 20, 100);

  const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const shortlists = await Shortlist.find({ user: userId })
    .sort({ updatedAt: -1 })
    .lean();

  const playerIds = [
    ...new Set(shortlists.flatMap((s) => s.players.map(String))),
  ];
  const coachIds = [
    ...new Set((shortlists.flatMap((s) => s.coaches || [])).map(String)),
  ];

  const [playerCount, coachCount, changes7d, changes30d, updatedPlayers, updatedCoaches, recentChanges] =
    await Promise.all([
      playerIds.length
        ? Player.countDocuments({ _id: { $in: playerIds } })
        : 0,
      coachIds.length
        ? Coach.countDocuments({ _id: { $in: coachIds } })
        : 0,
      ProfileChange.countDocuments({
        createdAt: { $gte: last7 },
        $or: [
          { profileType: "player", profileId: { $in: playerIds } },
          { profileType: "coach", profileId: { $in: coachIds } },
        ],
      }),
      ProfileChange.countDocuments({
        createdAt: { $gte: last30 },
        $or: [
          { profileType: "player", profileId: { $in: playerIds } },
          { profileType: "coach", profileId: { $in: coachIds } },
        ],
      }),
      playerIds.length
        ? Player.find({
            _id: { $in: playerIds },
            updatedAt: { $gte: last7 },
          })
            .select(PLAYER_SUMMARY_FIELDS)
            .sort({ updatedAt: -1 })
            .limit(10)
            .lean()
        : [],
      coachIds.length
        ? Coach.find({
            _id: { $in: coachIds },
            updatedAt: { $gte: last7 },
          })
            .select(COACH_SUMMARY_FIELDS)
            .sort({ updatedAt: -1 })
            .limit(10)
            .lean()
        : [],
      ProfileChange.find({
        $or: [
          { profileType: "player", profileId: { $in: playerIds } },
          { profileType: "coach", profileId: { $in: coachIds } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .lean(),
    ]);

  const changeCountsByProfile = new Map();
  const changeBuckets = await ProfileChange.aggregate([
    {
      $match: {
        createdAt: { $gte: last7 },
        $or: [
          { profileType: "player", profileId: { $in: playerIds } },
          { profileType: "coach", profileId: { $in: coachIds } },
        ],
      },
    },
    { $group: { _id: "$profileId", count: { $sum: 1 } } },
  ]);
  changeBuckets.forEach((bucket) =>
    changeCountsByProfile.set(String(bucket._id), bucket.count)
  );

  const shortlistSummary = shortlists.map((s) => {
    const ids = s.players.map(String);
    const cids = (s.coaches || []).map(String);
    let changes = 0;
    ids.forEach((id) => (changes += changeCountsByProfile.get(id) || 0));
    cids.forEach((id) => (changes += changeCountsByProfile.get(id) || 0));
    return {
      _id: s._id,
      name: s.name,
      playerCount: ids.length,
      coachCount: cids.length,
      changes7d: changes,
      updatedAt: s.updatedAt,
    };
  });

  const changeProfileIds = new Set(recentChanges.map((c) => String(c.profileId)));
  const [changePlayers, changeCoaches] = await Promise.all([
    Player.find({ _id: { $in: [...changeProfileIds] } })
      .select("name age nationality position job roleType game contractStatus isActive media")
      .lean(),
    Coach.find({ _id: { $in: [...changeProfileIds] } })
      .select("name age nationality category contractStatus isActive media")
      .lean(),
  ]);
  const profileMap = new Map();
  changePlayers.forEach((p) => profileMap.set(String(p._id), p));
  changeCoaches.forEach((c) => profileMap.set(String(c._id), c));
  const changesWithProfile = recentChanges.map((c) => ({
    ...c,
    profile: profileMap.get(String(c.profileId)) || null,
  }));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totals: {
          shortlists: shortlists.length,
          playersTracked: playerCount,
          coachesTracked: coachCount,
          changes7d,
          changes30d,
        },
        shortlists: shortlistSummary,
        recentlyUpdated: {
          players: updatedPlayers,
          coaches: updatedCoaches,
        },
        recentChanges: changesWithProfile,
      },
      "Scout dashboard fetched successfully"
    )
  );
});
