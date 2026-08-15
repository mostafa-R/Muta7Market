import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Invoice from "../models/invoice.model.js";
import Player from "../models/player.model.js";
import Subscription from "../models/subscription.model.js";
import { getDefaultPricing } from "../utils/pricingUtils.js";
import { makeOrderNumber } from "../utils/orderNumber.js";
import { paylinkCreateInvoice } from "../services/paylink.client.js";

const STAFF_ROLES = ["admin", "super_admin"];

const canManagePlayer = (user, player) => {
  const userId = String(user?._id || user?.id || "");
  if (!userId) return false;
  if (STAFF_ROLES.includes(user?.role)) return true;
  if (String(player?.user) === userId) return true;
  return false;
};

const computeProDetails = (pricing, interval) => {
  const month = Number(
    pricing?.pro_player?.month || process.env.PRICE_PRO_PLAYER_MONTH || 49
  );
  const year = Number(
    pricing?.pro_player?.year || process.env.PRICE_PRO_PLAYER_YEAR || 499
  );
  const defaultDays = Number(
    process.env.PRO_DEFAULT_DAYS || pricing?.PRO_DEFAULT_DAYS || 30
  );

  if (interval === "year") {
    return { amount: year, durationDays: Math.max(defaultDays, 365) };
  }

  return { amount: month, durationDays: defaultDays };
};

async function initiateProPayment(invoice, user, req) {
  if (invoice.paymentUrl) {
    return invoice.paymentUrl;
  }

  const interval = invoice.featureType === "year" ? "year" : "month";
  const title =
    interval === "year"
      ? "Player Pro subscription (1 year)"
      : "Player Pro subscription (1 month)";

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
    note: `userId=${invoice.userId};product=pro;targetType=player;profileId=${
      invoice.playerProfileId || ""
    };durationDays=${invoice.durationDays || ""}`,
  };

  const data = await paylinkCreateInvoice(payload);
  invoice.provider = "paylink";
  invoice.providerInvoiceId = data.transactionNo || data.invoiceId || undefined;
  invoice.paymentUrl = data.url || null;
  if (!invoice.invoiceNumber) invoice.invoiceNumber = invoice.orderNumber;
  await invoice.save();
  return invoice.paymentUrl;
}

export const getProStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const player = await Player.findOne({ user: userId }).select(
    "isPro proSince proExpiresAt"
  );
  const activeSub = await Subscription.findActiveForUser(userId);

  const isPro =
    Boolean(player?.isPro) &&
    (!player?.proExpiresAt || new Date(player.proExpiresAt) > new Date());

  res.status(200).json(
    new ApiResponse(
      200,
      {
        isPro,
        proSince: player?.proSince || null,
        proExpiresAt: player?.proExpiresAt || null,
        subscription: activeSub
          ? {
              plan: activeSub.plan,
              status: activeSub.status,
              startDate: activeSub.startDate,
              endDate: activeSub.endDate,
              autoRenew: activeSub.autoRenew,
              billingInterval: activeSub.billingInterval,
            }
          : null,
      },
      "Pro status fetched successfully"
    )
  );
});

export const getMySubscription = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const subscriptions = await Subscription.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json(
    new ApiResponse(200, subscriptions, "Subscriptions fetched successfully")
  );
});

export const subscribeToPro = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { playerId, billingInterval = "month" } = req.body;

  const player = await Player.findById(playerId);

  if (!player) {
    throw new ApiError(404, "Player profile not found");
  }

  if (!canManagePlayer(req.user, player)) {
    throw new ApiError(403, "You can only subscribe Pro for your own profile");
  }

  const active = await Subscription.findActiveForUser(userId);

  if (active) {
    throw new ApiError(400, "You already have an active Pro subscription");
  }

  const pricing = getDefaultPricing();
  const { amount, durationDays } = computeProDetails(pricing, billingInterval);

  const invoice = await Invoice.create({
    orderNumber: makeOrderNumber("pro", String(userId)),
    invoiceNumber: makeOrderNumber("pro", String(userId)),
    userId,
    product: "pro",
    targetType: "player",
    playerProfileId: player._id,
    durationDays,
    featureType: billingInterval,
    amount,
    currency: "SAR",
    status: "pending",
    provider: "paylink",
  });

  const paymentUrl = await initiateProPayment(invoice, req.user, req);

  res.status(201).json(
    new ApiResponse(
      201,
      { invoice, paymentUrl },
      "Pro subscription invoice created successfully"
    )
  );
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const sub = await Subscription.findActiveForUser(userId);

  if (!sub) {
    throw new ApiError(404, "No active Pro subscription found");
  }

  sub.status = "canceled";
  sub.autoRenew = false;
  await sub.save();

  if (sub.playerProfileId) {
    const player = await Player.findById(sub.playerProfileId);
    if (player) {
      player.isPro = false;
      player.proExpiresAt = new Date();
      await player.save();
    }
  }

  res.status(200).json(
    new ApiResponse(200, sub, "Subscription cancelled successfully")
  );
});
