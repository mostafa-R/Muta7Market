import mongoose from "mongoose";
import NegotiationRoom from "../models/negotiationRoom.model.js";
import NegotiationMessage from "../models/negotiationMessage.model.js";
import Player from "../models/player.model.js";
import TransferOffer from "../models/transferOffer.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { emitToRoom } from "../services/socket.service.js";
import { encryptMessage } from "../services/chatEncryption.service.js";

const getUserId = (req) => req.user._id || req.user.id;

async function loadRoomForUser(id, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid room ID");
  }
  const room = await NegotiationRoom.findOne({
    _id: id,
    participants: userId,
  });
  if (!room) throw new ApiError(404, "Negotiation room not found");
  return room;
}

export const createRoom = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { participantIds = [], offerId } = req.body;

  if (!offerId) {
    throw new ApiError(400, "offerId is required to create a negotiation room");
  }
  if (!mongoose.Types.ObjectId.isValid(offerId)) {
    throw new ApiError(400, "Invalid offer ID");
  }
  if (!Array.isArray(participantIds) || participantIds.length === 0) {
    throw new ApiError(400, "At least one participant is required");
  }
  for (const id of participantIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid participant ID");
    }
  }

  const offer = await TransferOffer.findById(offerId);
  if (!offer) throw new ApiError(404, "Transfer offer not found");

  if (!["pending", "countered"].includes(offer.status)) {
    throw new ApiError(
      400,
      "Negotiation rooms can only be created for pending or countered offers"
    );
  }

  const existingOpen = await NegotiationRoom.findOne({
    offer: offer._id,
    status: "open",
  });
  if (existingOpen) {
    throw new ApiError(
      400,
      "An open negotiation room already exists for this offer"
    );
  }

  const allowedParties = new Set([
    String(offer.fromUser),
    String(offer.toUser),
  ]);

  if (offer.targetProfileId) {
    const targetProfile = await Player.findById(
      offer.targetProfileId
    ).select("agentUser");
    if (targetProfile?.agentUser) {
      allowedParties.add(String(targetProfile.agentUser));
    }
  }

  if (!allowedParties.has(String(userId))) {
    throw new ApiError(403, "You are not a party of this transfer offer");
  }

  const requested = participantIds.map(String);
  const participants = [...new Set([String(userId), ...requested])];
  for (const id of participants) {
    if (!allowedParties.has(id)) {
      throw new ApiError(
        403,
        "Only parties of this transfer offer (sender, recipient, or the target's agent) can join the room"
      );
    }
  }

  const room = await NegotiationRoom.create({
    offer: offer._id,
    createdBy: userId,
    participants,
    status: "open",
  });

  if (!offer.negotiationRoom) {
    offer.negotiationRoom = room._id;
    await offer.save();
  }

  res.status(201).json(
    new ApiResponse(201, room, "Negotiation room created successfully")
  );
});

export const getMyRooms = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const items = await NegotiationRoom.find({ participants: userId })
    .sort({ updatedAt: -1 })
    .populate("participants", "name email phone role verifiedBadge")
    .populate("offer", "status targetProfileId targetType salary transferFee");

  res.status(200).json(
    new ApiResponse(200, items, "Negotiation rooms fetched successfully")
  );
});

export const getRoomMessages = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const room = await loadRoomForUser(req.params.id, userId);

  const messages = await NegotiationMessage.find({ room: room._id })
    .sort({ createdAt: 1 })
    .populate("sender", "name email role verifiedBadge");

  await NegotiationMessage.updateMany(
    { room: room._id, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );

  const clientMessages = messages.map((msg) => msg.toClientJSON(msg.sender));

  res.status(200).json(
    new ApiResponse(200, clientMessages, "Messages fetched successfully")
  );
});

export const sendMessage = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const room = await loadRoomForUser(req.params.id, userId);

  const text = String(req.body.message || "").trim();
  if (!text) throw new ApiError(400, "Message cannot be empty");

  if (room.status !== "open") {
    throw new ApiError(400, "This negotiation room is closed");
  }

  const encrypted = encryptMessage(text);

  const message = await NegotiationMessage.create({
    room: room._id,
    sender: userId,
    message: encrypted ? encrypted.content : text,
    encryption: encrypted || null,
    readBy: [userId],
  });

  const populated = await NegotiationMessage.findById(message._id).populate(
    "sender",
    "name email role verifiedBadge"
  );

  const clientMessage = populated.toClientJSON(populated.sender);

  emitToRoom(`negotiation:${room._id}`, "negotiation:message", clientMessage);
  room.updatedAt = new Date();
  await room.save();

  res.status(201).json(
    new ApiResponse(201, clientMessage, "Message sent successfully")
  );
});

export const closeRoom = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const room = await loadRoomForUser(req.params.id, userId);

  const offer = room.offer
    ? await TransferOffer.findById(room.offer)
    : null;
  const isOwner = String(room.createdBy) === String(userId);
  const isOfferParty =
    offer &&
    (String(offer.fromUser) === String(userId) ||
      String(offer.toUser) === String(userId));

  if (!isOwner && !isOfferParty) {
    throw new ApiError(403, "Only room participants can close this room");
  }

  room.status = "closed";
  await room.save();

  emitToRoom(`negotiation:${room._id}`, "negotiation:closed", {
    roomId: String(room._id),
  });

  res.status(200).json(
    new ApiResponse(200, room, "Negotiation room closed")
  );
});
