import mongoose from "mongoose";
import NegotiationRoom from "../models/negotiationRoom.model.js";
import NegotiationMessage from "../models/negotiationMessage.model.js";
import TransferOffer from "../models/transferOffer.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { emitToRoom } from "../services/socket.service.js";

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

  if (!Array.isArray(participantIds) || participantIds.length === 0) {
    throw new ApiError(400, "At least one participant is required");
  }

  let offer = null;
  if (offerId) {
    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      throw new ApiError(400, "Invalid offer ID");
    }
    offer = await TransferOffer.findById(offerId);
    if (!offer) throw new ApiError(404, "Transfer offer not found");
  }

  const participants = [...new Set(
    [String(userId), ...participantIds.map(String)]
  )];

  const room = await NegotiationRoom.create({
    offer: offer ? offer._id : null,
    createdBy: userId,
    participants,
    status: "open",
  });

  if (offer && !offer.negotiationRoom) {
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

  res.status(200).json(
    new ApiResponse(200, messages, "Messages fetched successfully")
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

  const message = await NegotiationMessage.create({
    room: room._id,
    sender: userId,
    message: text,
    readBy: [userId],
  });

  const populated = await NegotiationMessage.findById(message._id).populate(
    "sender",
    "name email role verifiedBadge"
  );

  emitToRoom(`negotiation:${room._id}`, "negotiation:message", populated);
  room.updatedAt = new Date();
  await room.save();

  res.status(201).json(
    new ApiResponse(201, populated, "Message sent successfully")
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
