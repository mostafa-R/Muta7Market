import mongoose from "mongoose";
import Shortlist from "../models/shortlist.model.js";
import Player from "../models/player.model.js";
import ProfileChange from "../models/profileChange.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getUserId = (req) => req.user._id || req.user.id;

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
  const items = await Shortlist.find({ user: userId })
    .sort({ updatedAt: -1 })
    .populate("players", "name age nationality position job jop isActive");

  res.status(200).json(
    new ApiResponse(200, items, "Shortlists fetched successfully")
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
      Shortlist.findById(s._id).populate(
        "players",
        "name age nationality position job jop roleType game contractStatus isActive media isListed"
      )
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

export const getShortlistChanges = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const shortlist = await loadOwnedShortlist(req.params.id, userId);

  const playerIds = shortlist.players;
  if (!playerIds.length) {
    return res.status(200).json(
      new ApiResponse(
        200,
        { changes: [], players: [], updatedPlayers: [] },
        "No players in this shortlist"
      )
    );
  }

  const { limit = 50 } = req.query;
  const limitNum = Math.min(parseInt(limit) || 50, 200);

  const [changes, players, updatedPlayers] = await Promise.all([
    ProfileChange.find({
      profileType: "player",
      profileId: { $in: playerIds },
    })
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .lean(),
    Player.find({ _id: { $in: playerIds } })
      .select("name age nationality position job jop isActive updatedAt")
      .lean(),
    Player.find({
      _id: { $in: playerIds },
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .select("name age nationality position job jop isActive updatedAt")
      .lean(),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { changes, players, updatedPlayers },
      "Shortlist changes fetched successfully"
    )
  );
});
