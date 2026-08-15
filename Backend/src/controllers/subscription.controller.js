import { STAFF_ROLES } from "../config/constants.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Invoice from "../models/invoice.model.js";
import Entitlement from "../models/entitlement.model.js";
import Player from "../models/player.model.js";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";
import { getPricingSettings } from "../utils/pricingUtils.js";
import { makeOrderNumber } from "../utils/orderNumber.js";
import { paylinkCreateInvoice } from "../services/paylink.client.js";


const canManagePlayer = (user, player) => {
  const userId = String(user?._id || user?.id || "");
  if (!userId) return false;
  if (STAFF_ROLES.includes(user?.role)) return true;
  if (String(player?.user) === userId) return true;
  return false;
};

const safeNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

const computePlanDetails = (plan, pricing, interval) => {
  const month = safeNumber(
    pricing?.[`${plan}_subscription`]?.month ||
      process.env[`PRICE_${plan.toUpperCase()}_SUBSCRIPTION_MONTH`],
    plan === "club" ? 149 : plan === "agent" ? 99 : 49
  );
  const year = safeNumber(
    pricing?.[`${plan}_subscription`]?.year ||
      process.env[`PRICE_${plan.toUpperCase()}_SUBSCRIPTION_YEAR`],
    plan === "club" ? 1499 : plan === "agent" ? 999 : 499
  );
  const defaultDays = safeNumber(
    process.env.PRO_DEFAULT_DAYS || pricing?.PRO_DEFAULT_DAYS,
    30
  );

  if (interval === "year") {
    return { amount: year, durationDays: Math.max(defaultDays, 365) };
  }

  return { amount: month, durationDays: defaultDays };
};

const computeProDetails = (pricing, interval) =>
  computePlanDetails("pro", pricing, interval);

const PLAN_PRODUCT = {
  pro: "pro",
  club: "club_subscription",
  agent: "agent_subscription",
};

const PLAN_ENTITLEMENT = {
  pro: "pro_player",
  club: "club_subscription",
  agent: "agent_subscription",
};

async function initiatePlanPayment(invoice, user, req, plan) {
  if (invoice.paymentUrl) {
    return invoice.paymentUrl;
  }

  const interval = invoice.featureType === "year" ? "year" : "month";
  const planLabel =
    plan === "club"
      ? "Club scouting subscription"
      : plan === "agent"
        ? "Agent scouting subscription"
        : "Player Pro subscription";
  const title = `${planLabel} (1 ${interval})`;

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
    note: `userId=${invoice.userId};product=${PLAN_PRODUCT[plan] || "pro"};plan=${plan};profileId=${
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
  const activeSub = await Subscription.findActiveForUser(
    userId,
    ["pro", "club", "agent"]
  );

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

export const subscribeToPlan = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    plan = "pro",
    playerId,
    billingInterval = "month",
  } = req.body;

  if (!["pro", "club", "agent"].includes(plan)) {
    throw new ApiError(400, "Invalid plan");
  }

  if (plan === "club" && req.user.role !== "club" && !STAFF_ROLES.includes(req.user.role)) {
    throw new ApiError(403, "Only club accounts can subscribe to the club plan");
  }
  if (plan === "agent" && req.user.role !== "agent" && !STAFF_ROLES.includes(req.user.role)) {
    throw new ApiError(403, "Only agent accounts can subscribe to the agent plan");
  }

  let profileId = null;
  if (plan === "pro") {
    if (!playerId) {
      throw new ApiError(400, "playerId is required for the Pro plan");
    }
    const player = await Player.findById(playerId);
    if (!player) {
      throw new ApiError(404, "Player profile not found");
    }
    if (!canManagePlayer(req.user, player)) {
      throw new ApiError(403, "You can only subscribe Pro for your own profile");
    }
    profileId = player._id;
  }

  const active = await Subscription.findActiveForUser(userId, [plan]);

  if (active) {
    throw new ApiError(400, `You already have an active ${plan} subscription`);
  }

  const pricing = await getPricingSettings();
  const { amount, durationDays } = computePlanDetails(
    plan,
    pricing,
    billingInterval
  );

  const invoice = await Invoice.create({
    orderNumber: makeOrderNumber(PLAN_PRODUCT[plan], String(userId)),
    invoiceNumber: makeOrderNumber(PLAN_PRODUCT[plan], String(userId)),
    userId,
    product: PLAN_PRODUCT[plan],
    targetType: plan === "pro" ? "player" : null,
    playerProfileId: profileId,
    durationDays,
    featureType: billingInterval,
    amount,
    currency: "SAR",
    status: "pending",
    provider: "paylink",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const paymentUrl = await initiatePlanPayment(invoice, req.user, req, plan);

  res.status(201).json(
    new ApiResponse(
      201,
      { invoice, paymentUrl, plan },
      `${plan} subscription invoice created successfully`
    )
  );
});

export const subscribeToPro = asyncHandler(async (req, res) => {
  req.body = { ...req.body, plan: "pro" };
  return subscribeToPlan(req, res);
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { plan } = req.body;

  const plans = ["pro", "club", "agent"].includes(plan) ? [plan] : ["pro", "club", "agent"];
  const sub = await Subscription.findActiveForUser(userId, plans);

  if (!sub) {
    throw new ApiError(404, "No active subscription found");
  }

  sub.status = "canceled";
  sub.autoRenew = false;
  await sub.save();

  if (sub.plan === "pro" && sub.playerProfileId) {
    const player = await Player.findById(sub.playerProfileId);
    if (player) {
      player.isPro = false;
      player.proExpiresAt = new Date();
      await player.save();
    }
  }

  if (sub.plan === "club" || sub.plan === "agent") {
    await User.updateOne(
      { _id: userId },
      { $set: { isActive: false, activeExpireAt: null } }
    );
  }

  const entitlementType =
    sub.plan === "club"
      ? "club_subscription"
      : sub.plan === "agent"
        ? "agent_subscription"
        : "pro_player";

  await Entitlement.updateMany(
    {
      userId,
      type: entitlementType,
      active: true,
      playerProfileId: sub.playerProfileId || null,
    },
    { $set: { active: false, revokedAt: new Date() } }
  );

  res.status(200).json(
    new ApiResponse(200, sub, "Subscription cancelled successfully")
  );
});

