import mongoose from "mongoose";
import { OFFER_TYPE, STAFF_ROLES } from "../config/constants.js";
import { isEmailEnabled, sendEmail } from "../config/email.js";
import Invoice from "../models/invoice.model.js";
import Player from "../models/player.model.js";
import Coach from "../models/coach.model.js";
import NegotiationRoom from "../models/negotiationRoom.model.js";
import TransferOffer from "../models/transferOffer.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildSortQuery, paginate } from "../utils/helpers.js";
import { makeOrderNumber } from "../utils/orderNumber.js";
import { paylinkCreateInvoice, paylinkGetInvoice } from "../services/paylink.client.js";
import { emitToUser } from "../services/socket.service.js";
import { applyPaidEffects } from "./payments.controller.js";
import { sendInternalNotification } from "./notification.controller.js";

const toNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const validateMoney = (value, fieldName) => {
  if (value == null) return;
  const amount = toNumber(value.amount, NaN);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new ApiError(400, `${fieldName} amount must be a non-negative number`);
  }
};

const closeOfferRooms = async (offer) => {
  if (!offer?.negotiationRoom) return;
  try {
    await NegotiationRoom.updateOne(
      { _id: offer.negotiationRoom, status: "open" },
      { $set: { status: "closed" } }
    );
  } catch (error) {
    console.error("Failed to close negotiation room:", error.message);
  }
};


const TRANSFER_ALLOWED_FIELDS = [
  "message",
  "salary",
  "contractDuration",
  "transferFee",
];

const notifyTransferTarget = async (targetUserId, offer) => {
  if (!targetUserId) return;

  emitToUser(targetUserId, "transfer_offer:new", {
    transferOfferId: String(offer._id),
    type: offer.type || "official",
    status: offer.status || "pending",
    targetType: offer.targetType || "player",
  });

  try {
    const targetUser = await User.findById(targetUserId)
      .select("name email")
      .lean();
    if (!targetUser?.email || !isEmailEnabled) return;

    const offerTypeLabel =
      offer.type === "interest" ? "expression of interest" : "official transfer offer";
    const subject = `You received a new ${offerTypeLabel} on Muta7 Market`;
    const text =
      `Hello ${targetUser.name},\n\n` +
      `A club sent you a new ${offerTypeLabel} on Muta7 Market.\n` +
      `Please log in to review the details and respond.\n\n` +
      `â€” Muta7 Market Team`;

    await sendEmail(targetUser.email, subject, text, text.split("\n").join("<br/>"));
  } catch (error) {
    console.error("Failed to send transfer offer email:", error.message);
  }
};

async function initiateTransferPayment(invoice, user, req) {
  if (invoice.paymentUrl) {
    return invoice.paymentUrl;
  }

  const title = `Transfer offer for ${invoice.targetType || "player"}`;

  const originFallback =
    req.get && req.get("origin") ? req.get("origin") : null;
  const frontUrl =
    process.env.FRONTEND_URL ||
    originFallback ||
    process.env.APP_URL ||
    "http://localhost:3000";
  const callBackUrl = `${frontUrl.replace(
    /\/$/,
    ""
  )}/profile?tab=payments&invoiceId=${String(invoice._id)}`;
  const cancelUrl = `${frontUrl.replace(/\/$/, "")}/profile?tab=payments`;

  const payload = {
    orderNumber: invoice.orderNumber,
    amount: invoice.amount,
    currency: invoice.currency || "SAR",
    clientName: user?.name || user?.email,
    clientEmail: user?.email,
    clientMobile: user?.phone || "0500000000",
    products: [{ title, price: invoice.amount, qty: 1, isDigital: true }],
    supportedCardBrands: ["mada", "visaMastercard", "stcpay"],
    callBackUrl,
    cancelUrl,
    note: `userId=${invoice.userId};product=transfer_offer;relatedTransferOffer=${
      invoice.relatedTransferOffer || ""
    }`,
  };

  const data = await paylinkCreateInvoice(payload);
  invoice.provider = "paylink";
  invoice.providerInvoiceId = data.transactionNo || data.invoiceId || undefined;
  invoice.paymentUrl = data.url || null;
  if (!invoice.invoiceNumber) invoice.invoiceNumber = invoice.orderNumber;
  await invoice.save();
  return invoice.paymentUrl;
}

export const createTransferOffer = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isStaff = STAFF_ROLES.includes(req.user.role);

  const {
    targetProfileId,
    toUserId,
    targetType = "player",
    type = OFFER_TYPE.OFFICIAL,
    relatedInterest,
  } = req.body;

  if (!Object.values(OFFER_TYPE).includes(type)) {
    throw new ApiError(400, "Invalid offer type");
  }

  if (!mongoose.Types.ObjectId.isValid(targetProfileId)) {
    throw new ApiError(400, "targetProfileId is required and must be valid");
  }

  const isCoachTarget = targetType === "coach";
  const targetProfile = isCoachTarget
    ? await Coach.findById(targetProfileId)
    : await Player.findById(targetProfileId);
  if (!targetProfile) throw new ApiError(404, "Target profile not found");

  if (isCoachTarget) {
    if (!targetProfile.isActive) {
      throw new ApiError(
        400,
        "Target profile must be active to receive transfer offers"
      );
    }
  } else if (!targetProfile.isActive || !targetProfile.isConfirmed) {
    throw new ApiError(
      400,
      "Target profile must be active and confirmed to receive transfer offers"
    );
  }

  const ownerUser = isCoachTarget
    ? targetProfile.user
    : targetProfile.user || null;
  const agentUser = !isCoachTarget ? targetProfile.agentUser || null : null;

  const boundTargetIds = [ownerUser, agentUser]
    .filter(Boolean)
    .map(String);

  if (!boundTargetIds.length) {
    throw new ApiError(400, "Target profile has no owner");
  }

  const targetUserId = toUserId || ownerUser;
  if (!targetUserId || !boundTargetIds.includes(String(targetUserId))) {
    throw new ApiError(
      400,
      "toUserId must match the target profile owner or its agent"
    );
  }
  if (String(targetUserId) === String(userId)) {
    throw new ApiError(400, "You cannot send an offer to yourself");
  }

  const data = {};
  for (const key of TRANSFER_ALLOWED_FIELDS) {
    if (key in req.body) data[key] = req.body[key];
  }

  validateMoney(data.transferFee, "transferFee");
  validateMoney(data.salary, "salary");
  if (data.contractDuration != null) {
    const duration = toNumber(data.contractDuration, NaN);
    if (!Number.isFinite(duration) || duration < 1 || !Number.isInteger(duration)) {
      throw new ApiError(
        400,
        "contractDuration must be a positive whole number of years"
      );
    }
    data.contractDuration = duration;
  }

  const transferFee = toNumber(data.transferFee?.amount, 0);

  if (type === OFFER_TYPE.OFFICIAL && !isStaff) {
    if (!req.user.verifiedBadge) {
      throw new ApiError(
        403,
        "Only verified clubs can send official transfer offers. Please complete KYC verification first"
      );
    }
  }

  if (type === OFFER_TYPE.INTEREST) {
    const existingInterest = await TransferOffer.findOne({
      type: OFFER_TYPE.INTEREST,
      fromUser: userId,
      toUser: targetUserId,
      targetProfileId,
      status: { $in: ["pending", "accepted", "countered"] },
    });
    if (existingInterest) {
      throw new ApiError(
        400,
        "You already sent an expression of interest for this profile"
      );
    }
  }

  const offerData = {
    type,
    fromUser: userId,
    toUser: targetUserId,
    targetProfileId,
    targetType: targetType === "coach" ? "coach" : "player",
    ...data,
    status: "pending",
    payment: {
      isPaid: isStaff,
      paidAt: isStaff ? new Date() : null,
    },
  };

  if (type === OFFER_TYPE.OFFICIAL && relatedInterest) {
    if (!mongoose.Types.ObjectId.isValid(relatedInterest)) {
      throw new ApiError(400, "relatedInterest must be a valid transfer offer id");
    }
    const interest = await TransferOffer.findOne({
      _id: relatedInterest,
      type: OFFER_TYPE.INTEREST,
      status: "accepted",
    });
    if (!interest) {
      throw new ApiError(
        400,
        "relatedInterest must be an accepted expression of interest"
      );
    }
    if (
      String(interest.fromUser) !== String(userId) ||
      String(interest.toUser) !== String(targetUserId) ||
      String(interest.targetProfileId) !== String(targetProfileId)
    ) {
      throw new ApiError(
        400,
        "relatedInterest does not match the offer parties"
      );
    }

    const existingOfficial = await TransferOffer.findOne({
      type: OFFER_TYPE.OFFICIAL,
      relatedInterest: interest._id,
      status: { $in: ["pending", "accepted"] },
    });
    if (existingOfficial) {
      throw new ApiError(
        400,
        "An official offer already exists for this expression of interest"
      );
    }

    offerData.relatedInterest = interest._id;
  }

  const offer = await TransferOffer.create(offerData);

  if (type === OFFER_TYPE.INTEREST) {
    await sendInternalNotification(
      targetUserId,
      "Expression of Interest",
      "You received a new expression of interest",
      { transferOfferId: String(offer._id) }
    );

    await notifyTransferTarget(targetUserId, offer);

    res.status(201).json(
      new ApiResponse(201, offer, "Expression of interest sent successfully")
    );
    return;
  }

  if (!isStaff) {
    if (transferFee <= 0) {
      await offer.deleteOne();
      throw new ApiError(
        400,
        "A positive transfer fee is required to submit an official transfer offer"
      );
    }

    const orderNo = makeOrderNumber("transfer_offer", String(userId));
    const invoice = await Invoice.create({
      orderNumber: orderNo,
      invoiceNumber: orderNo,
      userId,
      product: "transfer_offer",
      targetType: offer.targetType,
      playerProfileId: targetProfileId,
      durationDays: 1,
      amount: transferFee,
      currency: String(data.transferFee?.currency || "SAR"),
      status: "pending",
      relatedTransferOffer: offer._id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const paymentUrl = await initiateTransferPayment(invoice, req.user, req);

    await sendInternalNotification(
      userId,
      "Payment Required",
      "Please complete payment to submit your official transfer offer",
      { transferOfferId: String(offer._id), invoiceId: String(invoice._id) }
    );

    res.status(201).json(
      new ApiResponse(
        201,
        {
          offer,
          paymentUrl,
          invoiceId: String(invoice._id),
        },
        "Please complete payment to submit your official transfer offer"
      )
    );
    return;
  }

  await sendInternalNotification(
    targetUserId,
    "New Transfer Offer",
    "You received a new official transfer offer",
    { transferOfferId: String(offer._id) }
  );

  await notifyTransferTarget(targetUserId, offer);

  res.status(201).json(
    new ApiResponse(201, offer, "Transfer offer created successfully")
  );
});

export const getTransferOffers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy,
    status,
    type,
    targetType,
  } = req.query;

  const query = {};
  if (status) query.status = status;
  if (type) query.type = type;
  if (targetType) query.targetType = targetType;

  const isStaff = STAFF_ROLES.includes(req.user?.role);
  if (!isStaff) {
    query.$or = [{ fromUser: req.user._id }, { toUser: req.user._id }];
  }

  const { skip, limit: limitNum } = paginate(page, limit);
  const sort = buildSortQuery(sortBy) || { createdAt: -1 };

  const baseQuery = TransferOffer.find(query)
    .sort(sort)
    .limit(limitNum)
    .skip(skip);

  if (isStaff) {
    baseQuery
      .populate("fromUser", "name email role")
      .populate("toUser", "name email role");
  } else {
    baseQuery
      .populate("fromUser", "name role")
      .populate("toUser", "name role");
  }

  const [offers, total] = await Promise.all([
    baseQuery.populate("targetProfileId", "name age nationality position job jop"),
    TransferOffer.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        offers,
        pagination: {
          total,
          pages: Math.ceil(total / limitNum),
          page: Math.max(1, parseInt(page) || 1),
          limit: limitNum,
        },
      },
      "Transfer offers fetched successfully"
    )
  );
});

export const getMyTransferOffers = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  const { skip, limit: limitNum } = paginate(page, limit);

  const query = { $or: [{ fromUser: userId }, { toUser: userId }] };

  const [offers, total] = await Promise.all([
    TransferOffer.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .populate("fromUser", "name email role")
      .populate("toUser", "name email role")
      .populate("targetProfileId", "name age nationality position job jop"),
    TransferOffer.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        offers,
        pagination: {
          total,
          pages: Math.ceil(total / limitNum),
          page: Math.max(1, parseInt(page) || 1),
          limit: limitNum,
        },
      },
      "Your transfer offers fetched successfully"
    )
  );
});

export const getTransferOfferById = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const offer = await TransferOffer.findById(req.params.id)
    .populate("fromUser", "name email role")
    .populate("toUser", "name email role")
    .populate("targetProfileId")
    .populate("relatedInterest", "type status fromUser toUser targetProfileId createdAt")
    .populate("negotiationRoom");

  if (!offer) throw new ApiError(404, "Transfer offer not found");

  const isParty =
    userId &&
    (String(offer.fromUser._id) === String(userId) ||
      String(offer.toUser._id) === String(userId));
  const isStaff = STAFF_ROLES.includes(req.user?.role);

  if (!isParty && !isStaff) {
    throw new ApiError(403, "You can only view offers you are a part of");
  }

  res.status(200).json(
    new ApiResponse(200, offer, "Transfer offer fetched successfully")
  );
});

export const respondToTransferOffer = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { action } = req.params; // accept | reject | withdraw | counter
  const { salary, transferFee, contractDuration } = req.body;

  const offer = await TransferOffer.findById(req.params.id);
  if (!offer) throw new ApiError(404, "Transfer offer not found");

  const isFrom = String(offer.fromUser) === String(userId);
  const isTo = String(offer.toUser) === String(userId);
  if (!isFrom && !isTo) {
    throw new ApiError(403, "You are not a party to this offer");
  }

  if (action === "withdraw") {
    if (!isFrom) throw new ApiError(403, "Only the sender can withdraw");
    if (offer.status !== "pending" && offer.status !== "countered") {
      throw new ApiError(400, "Only pending or countered offers can be withdrawn");
    }
    offer.status = "withdrawn";
    await offer.save();
    await closeOfferRooms(offer);
    res.status(200).json(
      new ApiResponse(200, offer, "Transfer offer withdrawn successfully")
    );
    return;
  }

  if (action === "counter") {
    if (offer.status !== "pending" && offer.status !== "countered") {
      throw new ApiError(400, "This offer can no longer be countered");
    }
    validateMoney(salary, "salary");
    validateMoney(transferFee, "transferFee");
    if (contractDuration != null) {
      const duration = toNumber(contractDuration, NaN);
      if (!Number.isFinite(duration) || duration < 1 || !Number.isInteger(duration)) {
        throw new ApiError(
          400,
          "contractDuration must be a positive whole number of years"
        );
      }
      offer.contractDuration = duration;
    }
    if (salary) offer.salary = { ...offer.salary, ...salary };
    if (transferFee) offer.transferFee = { ...offer.transferFee, ...transferFee };
    offer.status = "countered";
    await offer.save();

    const otherParty = isFrom ? offer.toUser : offer.fromUser;
    await sendInternalNotification(
      otherParty,
      "Transfer Offer Countered",
      "Your transfer offer was countered",
      { transferOfferId: String(offer._id) }
    );
    emitToUser(otherParty, "transfer_offer:updated", {
      transferOfferId: String(offer._id),
      status: "countered",
    });

    res.status(200).json(
      new ApiResponse(200, offer, "Counter offer submitted successfully")
    );
    return;
  }

  const isPending = offer.status === "pending";
  const isCountered = offer.status === "countered";
  if (!isPending && !isCountered) {
    throw new ApiError(400, "This offer can no longer be responded to");
  }
  if (isPending && !isTo) {
    throw new ApiError(403, "Only the recipient can respond to a pending offer");
  }

  if (action === "accept") {
    if (
      offer.type === OFFER_TYPE.OFFICIAL &&
      !offer.payment?.isPaid
    ) {
      throw new ApiError(
        400,
        "This transfer offer cannot be accepted until its payment is completed"
      );
    }

    const TargetModel = offer.targetType === "coach" ? Coach : Player;
    const targetProfile = await TargetModel.findById(
      offer.targetProfileId
    ).select("user agentUser");
    if (targetProfile) {
      const boundTargetIds = [targetProfile.user, targetProfile.agentUser]
        .filter(Boolean)
        .map(String);
      if (!boundTargetIds.includes(String(userId))) {
        throw new ApiError(
          403,
          "Only the target profile owner or its agent can accept this offer"
        );
      }
    }

    offer.status = "accepted";
    await offer.save();

    if (offer.type === OFFER_TYPE.OFFICIAL) {
      if (targetProfile) {
        targetProfile.contractStatus = "contracted";
        await targetProfile.save();
      }
    }

    await closeOfferRooms(offer);

    const label =
      offer.type === OFFER_TYPE.INTEREST
        ? "Expression of Interest Accepted"
        : "Transfer Offer Accepted";
    const message =
      offer.type === OFFER_TYPE.INTEREST
        ? "Your expression of interest was accepted. You can now send an official offer"
        : "Your transfer offer was accepted";

    await sendInternalNotification(offer.fromUser, label, message, {
      transferOfferId: String(offer._id),
    });
    emitToUser(offer.fromUser, "transfer_offer:updated", {
      transferOfferId: String(offer._id),
      status: "accepted",
    });

    res.status(200).json(
      new ApiResponse(200, offer, "Transfer offer accepted successfully")
    );
    return;
  }

  if (action === "reject") {
    offer.status = "rejected";
    await offer.save();
    await closeOfferRooms(offer);

    await sendInternalNotification(
      offer.fromUser,
      "Transfer Offer Rejected",
      "Your transfer offer was rejected",
      { transferOfferId: String(offer._id) }
    );
    emitToUser(offer.fromUser, "transfer_offer:updated", {
      transferOfferId: String(offer._id),
      status: "rejected",
    });

    res.status(200).json(
      new ApiResponse(200, offer, "Transfer offer rejected successfully")
    );
    return;
  }

  throw new ApiError(400, "Invalid action");
});

export const confirmTransferOfferPayment = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;
  const userId = req.user._id;
  const isStaff = STAFF_ROLES.includes(req.user.role);

  const q = isStaff
    ? { _id: invoiceId }
    : { _id: invoiceId, $or: [{ userId }, { user: userId }] };

  const invoice = await Invoice.findOne(q);
  if (!invoice) throw new ApiError(404, "Invoice not found");
  if (invoice.product !== "transfer_offer") {
    throw new ApiError(400, "Invoice is not a transfer offer invoice");
  }

  let verify = null;
  if (invoice.providerInvoiceId) {
    try {
      verify = await paylinkGetInvoice(String(invoice.providerInvoiceId));
    } catch (e) {
      verify = null;
    }
  }

  const paid = verify
    ? String(verify.orderStatus || "").toLowerCase() === "paid"
    : false;

  if (paid && invoice.status !== "paid") {
    await applyPaidEffects(invoice, verify);
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        invoiceId: String(invoice._id),
        orderNumber: invoice.orderNumber,
        status: invoice.status,
        paid,
      },
      "Payment status confirmed"
    )
  );
});

