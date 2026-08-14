import mongoose from "mongoose";
import { OFFER_TYPE } from "../config/constants.js";
import Invoice from "../models/invoice.model.js";
import Player from "../models/player.model.js";
import TransferOffer from "../models/transferOffer.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildSortQuery, paginate } from "../utils/helpers.js";
import { makeOrderNumber } from "../utils/orderNumber.js";
import { paylinkCreateInvoice, paylinkGetInvoice } from "../services/paylink.client.js";
import { applyPaidEffects } from "./payments.controller.js";
import { sendInternalNotification } from "./notification.controller.js";

const STAFF_ROLES = ["admin", "super_admin"];

const TRANSFER_ALLOWED_FIELDS = [
  "message",
  "salary",
  "contractDuration",
  "transferFee",
];

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
  const requirePayment = !STAFF_ROLES.includes(req.user.role);

  const {
    targetProfileId,
    toUserId,
    targetType = "player",
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(targetProfileId)) {
    throw new ApiError(400, "targetProfileId is required and must be valid");
  }

  const targetProfile = await Player.findById(targetProfileId);
  if (!targetProfile) throw new ApiError(404, "Target profile not found");

  const targetUserId = toUserId || targetProfile.user;
  if (!targetUserId) {
    throw new ApiError(400, "Target profile has no owner");
  }
  if (String(targetUserId) === String(userId)) {
    throw new ApiError(400, "You cannot send an offer to yourself");
  }

  const data = {};
  for (const key of TRANSFER_ALLOWED_FIELDS) {
    if (key in req.body) data[key] = req.body[key];
  }

  const transferFee = Number(data.transferFee?.amount || 0);
  if (transferFee < 0) throw new ApiError(400, "Invalid transfer fee");

  const offer = await TransferOffer.create({
    type: OFFER_TYPE.OFFICIAL,
    fromUser: userId,
    toUser: targetUserId,
    targetProfileId,
    targetType: targetType === "coach" ? "coach" : "player",
    ...data,
    status: "pending",
    payment: { isPaid: !requirePayment, paidAt: requirePayment ? null : new Date() },
  });

  if (requirePayment) {
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

  const { skip } = paginate(page, limit);
  const sort = buildSortQuery(sortBy) || { createdAt: -1 };

  const isStaff = STAFF_ROLES.includes(req.user?.role);
  const baseQuery = TransferOffer.find(query)
    .sort(sort)
    .limit(parseInt(limit))
    .skip(skip);

  if (isStaff) {
    baseQuery
      .populate("fromUser", "name email role")
      .populate("toUser", "name email role");
  } else {
    baseQuery
      .select("-salary -transferFee -contractDuration -message")
      .populate("fromUser", "name role")
      .populate("toUser", "name role");
  }

  const [offers, total] = await Promise.all([
    baseQuery.populate("targetProfileId", "name age nationality position jop"),
    TransferOffer.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        offers,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
      "Transfer offers fetched successfully"
    )
  );
});

export const getMyTransferOffers = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  const { skip } = paginate(page, limit);

  const query = { $or: [{ fromUser: userId }, { toUser: userId }] };

  const [offers, total] = await Promise.all([
    TransferOffer.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate("fromUser", "name email role")
      .populate("toUser", "name email role")
      .populate("targetProfileId", "name age nationality position jop"),
    TransferOffer.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        offers,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page: parseInt(page),
          limit: parseInt(limit),
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
  const { action } = req.params; // accept | reject | withdraw
  const { salary, transferFee, contractDuration } = req.body;

  const offer = await TransferOffer.findById(req.params.id);
  if (!offer) throw new ApiError(404, "Transfer offer not found");

  const isFrom = String(offer.fromUser) === String(userId);
  const isTo = String(offer.toUser) === String(userId);

  if (action === "withdraw") {
    if (!isFrom) throw new ApiError(403, "Only the sender can withdraw");
    if (offer.status !== "pending") {
      throw new ApiError(400, "Only pending offers can be withdrawn");
    }
    offer.status = "withdrawn";
    await offer.save();
    res.status(200).json(
      new ApiResponse(200, offer, "Transfer offer withdrawn successfully")
    );
    return;
  }

  if (action === "counter") {
    if (!isTo) throw new ApiError(403, "Only the recipient can counter");
    if (offer.status !== "pending" && offer.status !== "countered") {
      throw new ApiError(400, "This offer can no longer be countered");
    }
    if (salary) offer.salary = { ...offer.salary, ...salary };
    if (transferFee) offer.transferFee = { ...offer.transferFee, ...transferFee };
    if (contractDuration) offer.contractDuration = Number(contractDuration);
    offer.status = "countered";
    await offer.save();

    await sendInternalNotification(
      offer.fromUser,
      "Transfer Offer Countered",
      "Your transfer offer was countered",
      { transferOfferId: String(offer._id) }
    );

    res.status(200).json(
      new ApiResponse(200, offer, "Counter offer submitted successfully")
    );
    return;
  }

  if (!isTo) throw new ApiError(403, "Only the recipient can respond");

  if (offer.status !== "pending") {
    throw new ApiError(400, "Only pending offers can be responded to");
  }

  if (action === "accept") {
    offer.status = "accepted";
    await offer.save();

    const targetProfile = await Player.findById(offer.targetProfileId);
    if (targetProfile) {
      targetProfile.contractStatus = "contracted";
      await targetProfile.save();
    }

    await sendInternalNotification(
      offer.fromUser,
      "Transfer Offer Accepted",
      "Your transfer offer was accepted",
      { transferOfferId: String(offer._id) }
    );

    res.status(200).json(
      new ApiResponse(200, offer, "Transfer offer accepted successfully")
    );
    return;
  }

  if (action === "reject") {
    offer.status = "rejected";
    await offer.save();

    await sendInternalNotification(
      offer.fromUser,
      "Transfer Offer Rejected",
      "Your transfer offer was rejected",
      { transferOfferId: String(offer._id) }
    );

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
