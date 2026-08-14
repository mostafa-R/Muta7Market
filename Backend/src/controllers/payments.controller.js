import crypto from "crypto";
import Coach from "../models/coach.model.js";
import Entitlement from "../models/entitlement.model.js";
import Invoice from "../models/invoice.model.js";
import Offer from "../models/offer.model.js";
import PaymentEvent from "../models/paymentEvent.model.js";
import PlayerProfile from "../models/player.model.js";
import TransferOffer from "../models/transferOffer.model.js";
import User from "../models/user.model.js";
import {
  paylinkCreateInvoice,
  paylinkGetInvoice,
} from "../services/paylink.client.js";
import { makeOrderNumber } from "../utils/orderNumber.js";
import { getPricingSettings, computePromotionAmount } from "../utils/pricingUtils.js";
import { runInTransaction } from "../utils/transactions.js";
import { OFFER_STATUS } from "../config/constants.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const STAFF_ROLES = ["admin", "super_admin"];

function entitlementDurationDays(invoice, PRICING) {
  if (invoice.product === "contacts_access")
    return Number(
      invoice.durationDays ||
        PRICING.contacts_access_days ||
        PRICING.ONE_YEAR_DAYS ||
        365
    );
  if (invoice.product === "listing")
    return Number(invoice.durationDays || PRICING.ONE_YEAR_DAYS || 365);
  if (invoice.product === "promotion")
    return Number(
      invoice.durationDays || PRICING.PROMOTION_DEFAULT_DAYS || 15
    );
  return 0;
}

function entitlementKey(invoice) {
  if (invoice.product === "contacts_access") {
    return { type: "contacts_access", playerProfileId: null };
  }
  const prefix = invoice.product === "listing" ? "listed" : "promoted";
  return {
    type: `${prefix}_${invoice.targetType}`,
    playerProfileId: invoice.playerProfileId || null,
  };
}

async function grantPaidInvoiceEffects(invoice, PRICING, session) {
  const key = entitlementKey(invoice);
  const freshEnd = new Date(
    Date.now() + entitlementDurationDays(invoice, PRICING) * ONE_DAY_MS
  );

  let end = freshEnd;
  try {
    const existing = await Entitlement.findOne({
      userId: invoice.userId,
      ...key,
    })
      .select("expiresAt")
      .lean();
    if (
      existing?.expiresAt &&
      new Date(existing.expiresAt).getTime() > end.getTime()
    ) {
      end = existing.expiresAt;
    }
  } catch {
    // ignore lookup failure, fall back to fresh end
  }

  const opts = session ? { upsert: true, session } : { upsert: true };
  const profileOpts = session ? { session } : {};

  const entitlementSet = {
    active: true,
    grantedAt: new Date(),
    expiresAt: end,
    sourceInvoice: invoice._id,
  };

  if (invoice.product === "contacts_access") {
    await Entitlement.updateOne(
      { userId: invoice.userId, type: "contacts_access", playerProfileId: null },
      entitlementSet,
      opts
    );
    await User.updateOne(
      { _id: invoice.userId },
      { $set: { isActive: true, activeExpireAt: end } },
      profileOpts
    );
  } else if (invoice.product === "listing") {
    if (invoice.playerProfileId) {
      await PlayerProfile.updateOne(
        { _id: invoice.playerProfileId, user: invoice.userId },
        {
          $set: {
            isListed: true,
            isActive: true,
            listingExpiresAt: end,
            activeExpireAt: end,
          },
        },
        profileOpts
      );
    }
    await Entitlement.updateOne(
      { userId: invoice.userId, ...key },
      entitlementSet,
      opts
    );
  } else if (invoice.product === "promotion") {
    if (invoice.targetType === "coach") {
      await Coach.updateOne(
        { _id: invoice.playerProfileId, user: invoice.userId },
        {
          $set: {
            "isPromoted.status": true,
            "isPromoted.type":
              invoice.featureType === "premium" ? "premium" : "featured",
            "isPromoted.startDate": new Date(),
            "isPromoted.endDate": end,
          },
        },
        profileOpts
      );
    } else if (invoice.playerProfileId) {
      await PlayerProfile.updateOne(
        { _id: invoice.playerProfileId, user: invoice.userId },
        {
          $set: {
            "isPromoted.status": true,
            "isPromoted.type": invoice.featureType || "featured",
            "isPromoted.startDate": new Date(),
            "isPromoted.endDate": end,
          },
        },
        profileOpts
      );
    }
    await Entitlement.updateOne(
      { userId: invoice.userId, ...key },
      entitlementSet,
      opts
    );
  } else if (
    ["add_offer", "promote_offer", "unlock_contact"].includes(
      invoice.product
    ) &&
    invoice.relatedOffer
  ) {    let offerQuery = Offer.findById(invoice.relatedOffer);
    if (session) offerQuery = offerQuery.session(session);
    const offer = await offerQuery;
    if (offer) {
      if (invoice.product === "add_offer") {
        offer.payment.isPaid = true;
        offer.payment.paymentId = String(invoice._id);
        offer.payment.paidAmount = invoice.amount;
        offer.payment.paidAt = new Date();
        offer.payment.paymentMethod = "paylink";
        offer.status = OFFER_STATUS.ACTIVE;
        await offer.save({ session });
      } else if (invoice.product === "promote_offer") {
        const days = Number(invoice.durationDays || 15);
        const type = invoice.featureType || "featured";
        offer.promotion = {
          isPromoted: true,
          promotionType: type,
          startDate: new Date(),
          endDate: new Date(Date.now() + days * ONE_DAY_MS),
          position: type === "premium" ? 1 : type === "featured" ? 2 : 3,
        };
        offer.pricing.promotionCost.total =
          invoice.amount || offer.pricing.promotionCost.total;
        await offer.save({ session });
      } else if (invoice.product === "unlock_contact") {
        const already = offer.unlockedBy.some(
          (u) => u.user && String(u.user) === String(invoice.userId)
        );
        if (!already) {
          offer.unlockedBy.push({
            user: invoice.userId,
            unlockedAt: new Date(),
            paymentId: String(invoice._id),
          });
          offer.statistics.contactUnlocks += 1;
          await offer.save({ session });
        }
      }
    }
  } else if (invoice.product === "transfer_offer" && invoice.relatedTransferOffer) {
    let offerQuery = TransferOffer.findById(invoice.relatedTransferOffer);
    if (session) offerQuery = offerQuery.session(session);
    const transfer = await offerQuery;
    if (transfer) {
      transfer.payment.isPaid = true;
      transfer.payment.paidAt = new Date();
      transfer.payment.paidAmount = invoice.amount;
      transfer.payment.invoiceId = invoice._id;
      await transfer.save({ session });
    }
  }

  return end;
}

export async function applyPaidEffects(invoice, verify, session) {
  const PRICING = await getPricingSettings();
  const saveOpts = session ? { session } : {};

  const transactionNo =
    String(verify?.transactionNo || "") ||
    String(invoice.providerInvoiceId || "") ||
    String(invoice.providerTransactionNo || "");

  if (invoice.status !== "paid") {
    invoice.status = "paid";
    invoice.paidAt = new Date();
    if (transactionNo) invoice.providerTransactionNo = transactionNo;
    if (verify?.paymentReceipt?.url) {
      invoice.paymentReceiptUrl = verify.paymentReceipt.url;
    }
    await invoice.save(saveOpts);
  }

  await grantPaidInvoiceEffects(invoice, PRICING, session);
}

export const reconcileMyInvoices = async (req, res) => {
  const userId = req.user?._id;
  if (!userId)
    return res.status(401).json({ success: false, message: "unauthorized" });

  const candidates = await Invoice.find({
    $or: [{ userId }, { user: userId }],
    providerInvoiceId: { $exists: true, $ne: null },
    status: { $in: ["pending", "paid"] },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  let updated = 0;

  for (const p of candidates) {
    try {
      const verify = await paylinkGetInvoice(String(p.providerInvoiceId));
      const providerStatus = String(verify?.orderStatus || "").toLowerCase();
      const isPaid = providerStatus === "paid";

      await runInTransaction(async (session) => {
        const inv = await Invoice.findById(p._id).session(session);
        if (!inv) return;

        inv.lastProviderStatus = providerStatus;
        inv.lastVerifiedAt = new Date();

        if (isPaid) {
          if (inv.status !== "paid") {
            await applyPaidEffects(inv, verify, session);
            updated += 1;
            return;
          }
          await inv.save({ session });
          return;
        }

        if (inv.status === "paid") {
          const hasPaidEvent = await PaymentEvent.exists({
            orderNumber: inv.orderNumber,
            type: "invoice.paid",
          }).session(session);

          if (!hasPaidEvent && !inv.providerTransactionNo) {
            inv.status = "pending";
            inv.paidAt = null;
            inv.paymentReceiptUrl = null;
            await inv.save({ session });
            updated += 1;
            return;
          }
        }

        await inv.save({ session });
      });
    } catch (e) {
      try {
        await Invoice.updateOne(
          { _id: p._id },
          {
            $push: {
              lastPaymentErrors: {
                $each: [
                  {
                    code: "RECONCILE_ERROR",
                    title: "Reconcile failed",
                    message: String(e?.message || e),
                    at: new Date(),
                  },
                ],
                $slice: -10,
              },
            },
          }
        );
      } catch {}
    }
  }

  const manualPaid = await Invoice.updateMany(
    {
      $or: [{ userId }, { user: userId }],
      status: "paid",
      providerInvoiceId: null,
    },
    { $set: { status: "pending", paidAt: null, paymentReceiptUrl: null } }
  );
  updated += manualPaid?.modifiedCount || 0;

  return res
    .status(200)
    .json({ success: true, data: { checked: candidates.length, updated } });
};

function detectTargetTypeFromProfile(profileDoc) {
  const j = String(profileDoc?.jop || profileDoc?.job || "").toLowerCase();
  return j === "coach" ? "coach" : "player";
}

function mapPaymentErrors(inv, verify) {
  const errs = Array.isArray(verify?.paymentErrors) ? verify.paymentErrors : [];
  if (errs.length) {
    inv.lastPaymentErrors = [
      ...errs.map((e) => ({
        code: e.code,
        title: e.title,
        message: e.message,
        at: new Date(),
      })),
      ...(inv.lastPaymentErrors || []),
    ].slice(0, 10);
  }
}

export const createDraftInvoice = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId)
      return res.status(401).json({ success: false, message: "unauthorized" });

    const PRICING = await getPricingSettings();

    const { product, playerProfileId, durationDays, force, featureType: requestedFeatureType } =
      req.body;
    const prod = String(product || "").toLowerCase();
    const requestedTier = requestedFeatureType === "premium" ? "premium" : "featured";

    if (!["contacts_access", "listing", "promotion"].includes(prod)) {
      return res
        .status(400)
        .json({ success: false, message: "invalid_product" });
    }

    let targetType = null;
    let amount = 0;
    let dur = Number(durationDays) || PRICING.ONE_YEAR_DAYS;
    let featureType = null;

    if (prod === "contacts_access") {
      amount = PRICING.contacts_access_price || PRICING.contacts_access_year;
      dur = PRICING.contacts_access_days || PRICING.ONE_YEAR_DAYS;
    } else {
      if (!playerProfileId)
        return res
          .status(400)
          .json({ success: false, message: "playerProfileId_required" });
      const profile = await PlayerProfile.findOne({
        _id: playerProfileId,
        user: userId,
      }).select("jop job user");
      if (!profile)
        return res
          .status(404)
          .json({ success: false, message: "profile_not_found" });
      targetType = detectTargetTypeFromProfile(profile);

      if (prod === "listing") {
        amount =
          PRICING.listing_price?.[targetType] ||
          PRICING.listing_year[targetType];
        dur = PRICING.listing_days?.[targetType] || PRICING.ONE_YEAR_DAYS;
      } else if (prod === "promotion") {
        featureType = requestedTier;
        const promo = computePromotionAmount(
          PRICING,
          targetType,
          requestedTier,
          durationDays
        );
        amount = promo.amount;
        dur = promo.durationDays;
      }
    }

    const q = {
      userId,
      product: prod,
      targetType: targetType || null,
      playerProfileId: playerProfileId || null,
      status: "pending",
    };
    let invoice = await Invoice.findOne(q);
    if (!invoice || force) {
      const orderNo = makeOrderNumber(prod, String(userId));
      invoice = await Invoice.findOneAndUpdate(
        q,
        {
          $setOnInsert: {
            orderNumber: orderNo,
            invoiceNumber: orderNo,
            userId,
            product: prod,
            targetType: targetType || null,
            playerProfileId: playerProfileId || null,
            status: "pending",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          $set: {
            durationDays: dur,
            featureType,
            amount,
            currency: "SAR",
          },
        },
        { new: true, upsert: true }
      );
    } else if (!invoice.paymentUrl) {
      invoice.durationDays = dur;
      invoice.featureType = featureType;
      invoice.amount = amount;
      await invoice.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        id: String(invoice._id),
        product: invoice.product,
        targetType: invoice.targetType,
        playerProfileId: invoice.playerProfileId,
        amount: invoice.amount,
        durationDays: invoice.durationDays,
        status: invoice.status,
      },
    });
  } catch (e) {
    console.error("createDraftInvoice error", e);
    return res.status(500).json({ success: false, message: "draft_failed" });
  }
};

export const initiatePaymentByInvoiceId = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const inv = await Invoice.findOne({
      _id: id,
      $or: [{ userId }, { user: userId }],
      status: "pending",
    });
    if (!inv)
      return res
        .status(404)
        .json({ success: false, message: "invoice_not_found_or_not_pending" });

    if (inv.paymentUrl) {
      if (!inv.invoiceNumber) {
        inv.invoiceNumber = inv.orderNumber;
        await inv.save();
      }
      return res.status(200).json({
        success: true,
        data: {
          paymentUrl: inv.paymentUrl,
          orderNumber: inv.orderNumber,
          invoiceId: String(inv._id),
        },
      });
    }

    const user = req.user;
    const PRICING = await getPricingSettings();
    const title = (() => {
      if (inv.product === "contacts_access") return "Contacts access (1 year)";
      if (inv.product === "listing")
        return inv.targetType === "coach"
          ? "Coach listing (1 year)"
          : "Player listing (1 year)";
      if (inv.product === "promotion") {
        const days = Number(
          inv.durationDays || PRICING.PROMOTION_DEFAULT_DAYS || 15
        );
        const label = inv.targetType === "coach" ? "Coach" : "Player";
        const tier = inv.featureType === "premium" ? "Premium" : "Featured";
        return `${tier} (${label}) (${days} day${days === 1 ? "" : "s"})`;
      }
      return inv.product;
    })();

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
    )}/profile?tab=payments&invoiceId=${String(inv._id)}`;
    const cancelUrl = `${frontUrl.replace(/\/$/, "")}/profile?tab=payments`;

    const payload = {
      orderNumber: inv.orderNumber,
      amount: inv.amount,
      currency: inv.currency || "SAR",
      clientName: user?.name || user?.email,
      clientEmail: user?.email,
      clientMobile: user?.phone || "0500000000",
      products: [{ title, price: inv.amount, qty: 1, isDigital: true }],
      supportedCardBrands: ["mada", "visaMastercard", "stcpay"],
      callBackUrl,
      cancelUrl,
      note: `userId=${inv.userId};product=${inv.product};targetType=${
        inv.targetType || ""
      };profileId=${inv.playerProfileId || ""};durationDays=${
        inv.durationDays || ""
      };feature=${inv.featureType || ""}`,
    };

    const data = await paylinkCreateInvoice(payload);
    inv.provider = "paylink";
    inv.providerInvoiceId = data.transactionNo || data.invoiceId || undefined;
    inv.paymentUrl = data.url || null;
    if (!inv.invoiceNumber) inv.invoiceNumber = inv.orderNumber;
    await inv.save();

    return res.status(200).json({
      success: true,
      data: {
        paymentUrl: inv.paymentUrl,
        orderNumber: inv.orderNumber,
        invoiceId: String(inv._id),
      },
    });
  } catch (err) {
    console.error("initiatePaymentByInvoiceId error", err);
    return res.status(500).json({ success: false, message: "initiate_failed" });
  }
};

function safeEqual(a, b) {
  const hash = (v) => crypto.createHash("sha256").update(String(v)).digest();
  return crypto.timingSafeEqual(hash(a), hash(b));
}

export const paymentWebhook = async (req, res) => {
  const expectedAuth = process.env.PAYLINK_WEBHOOK_AUTH;
  const suppliedAuth = req.headers.authorization || "";
  if (!expectedAuth || !safeEqual(suppliedAuth, expectedAuth)) {
    return res.status(401).send("unauthorized");
  }

  const PRICING = await getPricingSettings();

  const payload = req.body || {};
  const transactionNo = String(payload.transactionNo || "");
  const orderNumber = String(
    payload.merchantOrderNumber || payload.orderNumber || ""
  );

  let verify;
  try {
    verify = await paylinkGetInvoice(transactionNo);
  } catch (err) {
    console.error("verify error", err);
    return res.status(502).json({ ok: false, verify: "failed" });
  }

  const verifyOrder = String(
    verify?.orderNumber || verify?.merchantOrderNumber || ""
  );
  if (verifyOrder && orderNumber && verifyOrder !== orderNumber) {
    return res.status(200).json({ ok: false, mismatch: "orderNumber" });
  }

  const isPaid = String(verify.orderStatus || "").toLowerCase() === "paid";

  try {
    await PaymentEvent.create({
      provider: "paylink",
      providerEventId: transactionNo,
      orderNumber,
      type: isPaid ? "invoice.paid" : "invoice.update",
      raw: payload,
    });
  } catch {
    return res.status(200).json({ ok: true, duplicate: true });
  }

  try {
    await runInTransaction(async (session) => {
      const inv = await Invoice.findOne({ orderNumber }).session(session);
      if (!inv) return;

      if (verifyOrder && inv.orderNumber && verifyOrder !== inv.orderNumber) {
        return;
      }

      if (isPaid && verify?.amount) {
        const paidAmount = Number(verify.amount);
        const expectedAmount = Number(inv.amount);
        if (
          !Number.isNaN(paidAmount) &&
          !Number.isNaN(expectedAmount) &&
          Math.abs(paidAmount - expectedAmount) > 0.01
        ) {
          mapPaymentErrors(inv, {
            paymentErrors: [
              { code: "AMOUNT_MISMATCH", title: "Amount mismatch", message: `expected ${expectedAmount}, got ${paidAmount}`, at: new Date() },
            ],
          });
          inv.lastProviderStatus = String(verify.orderStatus || "");
          await inv.save({ session });
          return;
        }
      }

      if (!isPaid) {
        mapPaymentErrors(inv, verify);
        inv.lastProviderStatus = String(verify.orderStatus || "");
        await inv.save({ session });
        return;
      }

      if (inv.status !== "paid") {
        inv.status = "paid";
        inv.paidAt = new Date();
        inv.providerTransactionNo = transactionNo;
        inv.lastProviderStatus = "paid";
        inv.lastVerifiedAt = new Date();
        if (verify?.paymentReceipt?.url)
          inv.paymentReceiptUrl = verify.paymentReceipt.url;
        await inv.save({ session });
      }

      await grantPaidInvoiceEffects(inv, PRICING, session);
    });
  } catch (err) {
    console.error("webhook txn error", err);
  }

  return res.status(200).json({ ok: true, verified: isPaid });
};

export const getPaymentStatus = async (req, res) => {
  const { id } = req.params;
  const isStaff = STAFF_ROLES.includes(req.user?.role);
  const inv = isStaff
    ? await Invoice.findById(id)
    : await Invoice.findOne({
        _id: id,
        $or: [{ userId: req.user?._id }, { user: req.user?._id }],
      });
  if (!inv)
    return res.status(404).json({ success: false, message: "not_found" });
  return res.status(200).json({
    success: true,
    data: {
      id: String(inv._id),
      status: inv.status,
      product: inv.product,
      paymentErrors: inv.lastPaymentErrors || [],
    },
  });
};

const normalizeProductParam = (p) => {
  const v = String(p || "")
    .toLowerCase()
    .trim();
  if (/^contacts?_access$/.test(v)) return "contact_access";
  return v;
};

const normalizeStatus = (s) => {
  const v = String(s || "")
    .toLowerCase()
    .trim();
  if (v === "notpaid" || v === "unpaid") return "pending";
  return v;
};

export const listMyInvoices = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "unauthorized" });
  }

  const statusQ = req.query.status ? normalizeStatus(req.query.status) : null;
  const productQ = req.query.product
    ? normalizeProductParam(req.query.product)
    : null;
  const orderQ = req.query.orderNumber ? String(req.query.orderNumber) : null;

  const and = [{ $or: [{ userId }, { user: userId }] }];

  if (statusQ) and.push({ status: new RegExp(`^${statusQ}$`, "i") });
  if (productQ) {
    if (productQ === "contact_access") {
      and.push({
        product: { $in: [/^contact_access$/i, /^contacts_access$/i] },
      });
    } else {
      and.push({ product: new RegExp(`^${productQ}$`, "i") });
    }
  }
  if (orderQ) and.push({ orderNumber: orderQ });

  const q = and.length > 1 ? { $and: and } : and[0];

  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.max(1, Math.min(200, Number(req.query.pageSize || 50)));
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    Invoice.find(q).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    Invoice.countDocuments(q),
  ]);

  const mapped = items.map((inv) => ({
    id: String(inv._id),
    createdAt: inv.createdAt,
    product: inv.product,
    targetType: inv.targetType || "user",
    profileId: inv.playerProfileId || null,
    amount: inv.amount,
    currency: inv.currency || "SAR",
    status: String(inv.status || "").toLowerCase(),
    orderNumber: inv.orderNumber || inv.invoiceNumber || String(inv._id),
    providerInvoiceId:
      inv.providerInvoiceId ||
      (inv.provider && inv.provider.invoiceId) ||
      inv.paylinkInvoiceId ||
      inv.invoiceId ||
      null,
    paymentUrl:
      String(inv.status).toLowerCase() === "pending"
        ? inv.paymentUrl || null
        : null,
    receiptUrl: inv.paymentReceiptUrl || null,
    paidAt: inv.paidAt || null,
    durationDays: inv.durationDays || null,
  }));

  return res.status(200).json({
    success: true,
    data: { total, page, pageSize, items: mapped },
  });
};

export const listAllInvoices = async (req, res) => {
  const statusQRaw = req.query.status ? String(req.query.status) : null;
  const statusQ = statusQRaw ? normalizeStatus(statusQRaw) : null;

  const userQ = req.query.userId ? String(req.query.userId) : null;

  const productQRaw = req.query.product ? String(req.query.product) : null;
  const productQ = productQRaw ? normalizeProductParam(productQRaw) : null;

  const orderQ = req.query.orderNumber ? String(req.query.orderNumber) : null;

  const and = [];

  if (statusQ) and.push({ status: new RegExp(`^${statusQ}$`, "i") });

  if (userQ) and.push({ $or: [{ userId: userQ }, { user: userQ }] });

  if (productQ) {
    if (productQ === "contact_access") {
      and.push({
        product: { $in: [/^contact_access$/i, /^contacts_access$/i] },
      });
    } else {
      and.push({ product: new RegExp(`^${productQ}$`, "i") });
    }
  }

  if (orderQ) and.push({ orderNumber: orderQ });

  const q = and.length ? { $and: and } : {};

  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.max(1, Math.min(200, Number(req.query.pageSize || 50)));
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    Invoice.find(q).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    Invoice.countDocuments(q),
  ]);

  const mapped = items.map((inv) => ({
    id: String(inv._id),
    createdAt: inv.createdAt,
    product: inv.product,
    targetType: inv.targetType || "user",
    profileId: inv.playerProfileId || null,
    userId: inv.userId || inv.user || null,
    amount: inv.amount,
    currency: inv.currency || "SAR",
    status: String(inv.status || "").toLowerCase(),
    orderNumber: inv.orderNumber || inv.invoiceNumber || String(inv._id),
    providerInvoiceId:
      inv.providerInvoiceId ||
      (inv.provider && inv.provider.invoiceId) ||
      inv.paylinkInvoiceId ||
      inv.invoiceId ||
      null,
    paymentUrl:
      String(inv.status).toLowerCase() === "pending"
        ? inv.paymentUrl || null
        : null,
    receiptUrl: inv.paymentReceiptUrl || null,
    paidAt: inv.paidAt || null,
    durationDays: inv.durationDays || null,
    lastProviderStatus: inv.lastProviderStatus || null,
    lastVerifiedAt: inv.lastVerifiedAt || null,
  }));

  return res.status(200).json({
    success: true,
    data: { total, page, pageSize, items: mapped },
  });
};

async function verifyWithPaylinkAndApply(inv) {
  const transactionNo = inv.providerInvoiceId || inv.providerTransactionNo;
  if (!transactionNo) {
    return { verified: false, paid: false, error: "no_provider_reference" };
  }
  try {
    const verify = await paylinkGetInvoice(String(transactionNo));
    const isPaid = String(verify.orderStatus || "").toLowerCase() === "paid";
    if (isPaid && inv.status !== "paid") {
      await applyPaidEffects(inv, verify);
    }
    return {
      verified: true,
      paid: isPaid,
      status: String(verify.orderStatus || ""),
    };
  } catch (err) {
    return { verified: false, paid: false, error: String(err?.message || err) };
  }
}

export const recheckByOrderNumber = async (req, res) => {
  try {
    const userId = req.user?._id;
    const orderNumber = String(
      req.params.orderNumber || req.query.orderNumber || ""
    );
    if (!orderNumber) {
      return res
        .status(400)
        .json({ success: false, message: "orderNumber_required" });
    }
    const inv = await Invoice.findOne({
      orderNumber,
      $or: [{ userId }, { user: userId }],
    });
    if (!inv) {
      return res
        .status(404)
        .json({ success: false, message: "invoice_not_found" });
    }
    const result = await verifyWithPaylinkAndApply(inv);
    return res.status(200).json({
      success: true,
      data: {
        id: String(inv._id),
        orderNumber: inv.orderNumber,
        status: inv.status,
        verified: Boolean(result.verified),
        paid: Boolean(result.paid),
        error: result.error || null,
      },
    });
  } catch (err) {
    console.error("[Payments][recheckByOrderNumber] error", err);
    return res.status(500).json({ success: false, message: "recheck_failed" });
  }
};

export const simulateSuccess = async (req, res) => {
  try {
    // إغلاق حاسم: يجب تفعيل المحاكاة صراحةً في بيئة غير الإنتاج فقط
    const simulationEnabled =
      process.env.NODE_ENV !== "production" &&
      process.env.PAYMENT_SIMULATION_ENABLED === "true";
    if (!simulationEnabled) {
      return res.status(404).json({ success: false, message: "not_found" });
    }

    const { id } = req.params;

    const inv = await Invoice.findById(id);
    if (!inv)
      return res
        .status(404)
        .json({ success: false, message: "invoice_not_found" });

    const isOwner = String(inv.userId || "") === String(req.user?._id || "");
    const isStaff = STAFF_ROLES.includes(req.user?.role);

    if (!isOwner && !isStaff) {
      return res
        .status(403)
        .json({ success: false, message: "forbidden" });
    }

    const simTx = inv.providerTransactionNo || `SIM-${Date.now()}`;
    await applyPaidEffects(inv, { transactionNo: simTx });

    return res.status(200).json({
      success: true,
      data: { id: String(inv._id), status: inv.status },
    });
  } catch (e) {
    console.error("simulateSuccess error", e);
    return res.status(500).json({ success: false, message: "simulate_failed" });
  }
};
