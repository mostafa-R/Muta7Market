import { STAFF_ROLES } from "../config/constants.js";
import mongoose from "mongoose";
import Player from "../models/player.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { escapeRegex } from "../utils/helpers.js";
import { sendInternalNotification } from "./notification.controller.js";


const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const loadPlayer = async (playerId) => {
  if (!isValidObjectId(playerId)) {
    throw new ApiError(400, "Invalid player ID");
  }
  const player = await Player.findById(playerId);
  if (!player) throw new ApiError(404, "Player not found");
  return player;
};

const isOwnerOrStaff = (req, player) => {
  const userId = String(req.user._id || req.user.id);
  return (
    STAFF_ROLES.includes(req.user.role) || String(player.user) === userId
  );
};

const generateAgentCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const AGENT_CODE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const getManagedPlayers = asyncHandler(async (req, res) => {
  const agentId = req.user._id;
  const { page = 1, limit = 20, search } = req.query;

  const filter = { agentUser: agentId };
  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { "name.en": { $regex: safeSearch, $options: "i" } },
      { "name.ar": { $regex: safeSearch, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), 100);

  const [players, total] = await Promise.all([
    Player.find(filter)
      .sort({ agentLinkedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("user", "name email phone"),
    Player.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        players,
        totalManaged: total,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
      "Managed players fetched successfully"
    )
  );
});

export const assignAgent = asyncHandler(async (req, res) => {
  const { playerId } = req.params;
  const { agentId } = req.body;

  if (!isValidObjectId(agentId)) {
    throw new ApiError(400, "Invalid agent ID");
  }

  const player = await loadPlayer(playerId);

  if (!isOwnerOrStaff(req, player)) {
    throw new ApiError(
      403,
      "Only the player owner or staff can assign an agent"
    );
  }

  const agent = await User.findById(agentId);
  if (!agent) throw new ApiError(404, "Agent account not found");
  if (agent.role !== "agent") {
    throw new ApiError(400, "The selected user is not an agent");
  }

  player.agentUser = agentId;
  player.agentLinkedAt = new Date();
  if (player.contactInfo?.agent) {
    player.contactInfo.agent.name = agent.name || player.contactInfo.agent.name;
    if (agent.email) player.contactInfo.agent.email = agent.email;
    if (agent.phone) player.contactInfo.agent.phone = agent.phone;
  }
  await player.save();

  await sendInternalNotification(
    agentId,
    "New managed player",
    `You have been assigned as the agent for ${player.name?.en || player.name}`,
    { playerId: player._id, action: "assign_agent" }
  );

  res.status(200).json(
    new ApiResponse(200, player, "Agent assigned to player successfully")
  );
});

export const removeAgent = asyncHandler(async (req, res) => {
  const { playerId } = req.params;

  const player = await loadPlayer(playerId);

  const isAgentSelf =
    player.agentUser && String(player.agentUser) === String(req.user._id);
  if (!isOwnerOrStaff(req, player) && !isAgentSelf) {
    throw new ApiError(
      403,
      "You are not allowed to remove this agent link"
    );
  }

  const previousAgent = player.agentUser;
  player.agentUser = null;
  player.agentCode = null;
  player.agentCodeExpiresAt = null;
  player.agentLinkedAt = null;
  await player.save();

  if (previousAgent) {
    await sendInternalNotification(
      previousAgent,
      "Agent link removed",
      `Your agent link with ${player.name?.en || player.name} was removed`,
      { playerId: player._id, action: "remove_agent" }
    );
  }

  res.status(200).json(
    new ApiResponse(200, player, "Agent removed from player successfully")
  );
});

export const generateAgentLinkCode = asyncHandler(async (req, res) => {
  const { playerId } = req.params;

  const player = await loadPlayer(playerId);

  if (!isOwnerOrStaff(req, player)) {
    throw new ApiError(
      403,
      "Only the player owner or staff can generate an agent link"
    );
  }

  player.agentCode = generateAgentCode();
  player.agentCodeExpiresAt = new Date(Date.now() + AGENT_CODE_TTL_MS);
  await player.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { playerId: player._id, code: player.agentCode },
      "Agent link code generated successfully"
    )
  );
});

export const redeemAgentCode = asyncHandler(async (req, res) => {
  const agentId = req.user._id;
  const { code } = req.body;

  if (!code || String(code).trim().length < 6) {
    throw new ApiError(400, "A valid agent link code is required");
  }

  const player = await Player.findOne({ agentCode: String(code).trim() });
  if (!player) {
    throw new ApiError(404, "Invalid or expired agent link code");
  }

  if (player.agentCodeExpiresAt && player.agentCodeExpiresAt < new Date()) {
    player.agentCode = null;
    player.agentCodeExpiresAt = null;
    await player.save();
    throw new ApiError(404, "Invalid or expired agent link code");
  }

  if (
    player.agentUser &&
    String(player.agentUser) !== String(agentId)
  ) {
    throw new ApiError(400, "This player is already managed by an agent");
  }

  player.agentUser = agentId;
  player.agentLinkedAt = new Date();
  player.agentCode = null;
  player.agentCodeExpiresAt = null;
  await player.save();

  await sendInternalNotification(
    player.user,
    "Agent linked",
    `${req.user.name || "Your agent"} linked to your player profile`,
    { playerId: player._id, action: "redeem_agent_code" }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      { playerId: player._id, playerName: player.name },
      "Player linked successfully"
    )
  );
});

