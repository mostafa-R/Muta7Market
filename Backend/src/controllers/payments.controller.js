import mongoose from "mongoose";
import { PRICING } from "../config/constants.js";
import Entitlement from "../models/entitlement.model.js";
import Invoice from "../models/invoice.model.js";
import PaymentEvent from "../models/paymentEvent.model.js";
import PlayerProfile from "../models/player.model.js";
import User from "../models/user.model.js";
import {
  paylinkCreateInvoice,
  paylinkGetInvoice,
} from "../services/paylink.client.js";
import { makeOrderNumber } from "../utils/orderNumber.js";

// helper: تطبيق آثار الدفع المدفوع (نفس منطق الويبهوك)
async function applyPaidEffects(invoice, verify, session) {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const ONE_YEAR_MS = (PRICING.ONE_YEAR_DAYS || 365) * ONE_DAY_MS;

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
    await invoice.save({ session });
  }

  if (invoice.product === "contacts_access") {
    const end = new Date(Date.now() + ONE_YEAR_MS);
    await Entitlement.updateOne(
      {
        userId: invoice.userId,
        type: "contacts_access",
        playerProfileId: null,
      },
      {
        $set: {
          active: true,
          grantedAt: new Date(),
          expiresAt: end,
          sourceInvoice: invoice._id,
        },
      },
      { upsert: true, session }
    );
    await User.updateOne(
      { _id: invoice.userId },
      { $set: { isActive: true } },
      { session }
    );
  } else if (invoice.product === "listing") {
    const end = new Date(Date.now() + ONE_YEAR_MS);
    if (invoice.playerProfileId) {
      await PlayerProfile.updateOne(
        { _id: invoice.playerProfileId, user: invoice.userId },
        { $set: { isListed: true, isActive: true, listingExpiresAt: end } },
        { session }
      );
    }
    await Entitlement.updateOne(
      {
        userId: invoice.userId,
        type: `listed_${invoice.targetType}`,
        playerProfileId: invoice.playerProfileId,
      },
      {
        $set: {
          active: true,
          grantedAt: new Date(),
          expiresAt: end,
          sourceInvoice: invoice._id,
        },
      },
      { upsert: true, session }
    );
  } else if (invoice.product === "promotion") {
    const end = new Date(
      Date.now() +
        Number(invoice.durationDays || PRICING.ONE_YEAR_DAYS) * ONE_DAY_MS
    );
    if (invoice.playerProfileId) {
      await PlayerProfile.updateOne(
        { _id: invoice.playerProfileId, user: invoice.userId },
        {
          $set: {
            "isPromoted.status": true,
            "isPromoted.type": invoice.featureType || "toplist",
            "isPromoted.startDate": new Date(),
            "isPromoted.endDate": end,
          },
        },
        { session }
      );
    }
    await Entitlement.updateOne(
      {
        userId: invoice.userId,
        type: `promoted_${invoice.targetType}`,
        playerProfileId: invoice.playerProfileId,
      },
      {
        $set: {
          active: true,
          grantedAt: new Date(),
          expiresAt: end,
          sourceInvoice: invoice._id,
        },
      },
      { upsert: true, session }
    );
  }
}

// NEW: مصالحة فواتير المستخدم الـ pending مع Paylink وتحديث الحالة إن اتغيّرت هناك
export const reconcileMyInvoices = async (req, res) => {
  const userId = req.user?._id;
  if (!userId)
    return res.status(401).json({ success: false, message: "unauthorized" });

  // نجلب الفواتير التي لها providerInvoiceId واتعمل لها initiate قبل كده
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

      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          const inv = await Invoice.findById(p._id).session(session);
          if (!inv) return;

          // سجّل آخر نتيجة تحقق من المزود
          inv.lastProviderStatus = providerStatus;
          inv.lastVerifiedAt = new Date();

          if (isPaid) {
            // لو المزود قال Paid وDB مش Paid → نفّذ آثار الدفع
            if (inv.status !== "paid") {
              await inv.save({ session }); // احفظ آخر حالة تحقق الأول
              await applyPaidEffects(inv, verify, session);
              updated += 1;
              return;
            }
            // لو بالفعل paid، بس حدّثنا حقول التحقق فقط
            await inv.save({ session });
            return;
          }

          // المزود يقول Not Paid الآن
          if (inv.status === "paid") {
            // نرجعها pending فقط لو مفيش دليل دفع عندنا (حدث webhook أو transactionNo سابق)
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

          // في باقي الحالات (pending && not paid) فقط سجلنا آخر تحقق
          await inv.save({ session });
        });
      } finally {
        session.endSession();
      }
    } catch (e) {
      // لو فشل التحقق من Paylink، خزّن الخطأ وخليك مكمل
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

  // كمان حالة: أي فاتورة DB=paid لكنها أصلاً ما اتعملها initiate (مفيش providerInvoiceId)
  // نرجّعها pending لأنها manual فقط.
  const manualPaid = await Invoice.updateMany(
    {
      $or: [{ userId }, { user: userId }],
      status: "paid",
      $or: [
        { providerInvoiceId: null },
        { providerInvoiceId: { $exists: false } },
      ],
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

/* ========== 1) إنشاء فاتورة داخلية (Draft) فقط ========== */
export const createDraftInvoice = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId)
      return res.status(401).json({ success: false, message: "unauthorized" });

    const { product, playerProfileId, durationDays, force } = req.body;
    const prod = String(product || "").toLowerCase();

    if (!["contacts_access", "listing", "promotion"].includes(prod)) {
      return res
        .status(400)
        .json({ success: false, message: "invalid_product" });
    }

    let targetType = null;
    let amount = 0;
    let dur = Number(durationDays) || PRICING.ONE_YEAR_DAYS; // سنة افتراضيًا
    let featureType = null;

    if (prod === "contacts_access") {
      amount = PRICING.contacts_access_year;
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
        amount = PRICING.listing_year[targetType];
        dur = PRICING.ONE_YEAR_DAYS;
      } else if (prod === "promotion") {
        featureType = "toplist";
        // سنوي ثابت
        if (PRICING.promotion_year[targetType] > 0 && !durationDays) {
          amount = PRICING.promotion_year[targetType];
          dur = PRICING.ONE_YEAR_DAYS;
        } else {
          // أو باليوم
          const perDay = PRICING.promotion_per_day[targetType] || 0;
          const d = Number(durationDays || PRICING.ONE_YEAR_DAYS);
          amount = perDay * d;
          dur = d;
        }
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
            durationDays: dur,
            featureType,
            amount,
            currency: "SAR",
            status: "pending",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
        { new: true, upsert: true }
      );
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

/* ========== 2) بدء الدفع لفاتورة داخلية (إنشاء فاتورة Paylink) ========== */
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

    // لو سبق واتعمل paymentUrl رجّعه
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
    const title =
      inv.product === "contacts_access"
        ? "Contacts access (1 year)"
        : inv.product === "listing"
        ? inv.targetType === "coach"
          ? "Coach listing (1 year)"
          : "Player listing (1 year)"
        : inv.product === "promotion"
        ? inv.targetType === "coach"
          ? "Top list (Coach) (1 year)"
          : "Top list (Player) (1 year)"
        : inv.product;

    // Build callback URLs using FRONTEND_URL if provided
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

/* ========== 3) Webhook من Paylink ========== */
export const paymentWebhook = async (req, res) => {
  if (req.headers.authorization !== process.env.PAYLINK_WEBHOOK_AUTH) {
    return res.status(401).send("unauthorized");
  }

  const payload = req.body || {};
  const transactionNo = String(payload.transactionNo || "");
  const orderNumber = String(
    payload.merchantOrderNumber || payload.orderNumber || ""
  );

  // تحقق من Paylink
  let verify;
  try {
    verify = await paylinkGetInvoice(transactionNo);
  } catch (err) {
    console.error("verify error", err);
    return res.status(200).json({ ok: false, verify: "failed" });
  }

  const isPaid = String(verify.orderStatus || "").toLowerCase() === "paid";

  // Idempotency
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

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const inv = await Invoice.findOne({ orderNumber }).session(session);
      if (!inv) return;

      if (!isPaid) {
        mapPaymentErrors(inv, verify);
        await inv.save({ session });
        return;
      }

      if (inv.status !== "paid") {
        inv.status = "paid";
        inv.paidAt = new Date();
        inv.providerTransactionNo = transactionNo;
        if (verify?.paymentReceipt?.url)
          inv.paymentReceiptUrl = verify.paymentReceipt.url;
        await inv.save({ session });
      }

      const ONE_YEAR_MS = (PRICING.ONE_YEAR_DAYS || 365) * 24 * 60 * 60 * 1000;

      if (inv.product === "contacts_access") {
        const end = new Date(Date.now() + ONE_YEAR_MS);
        await Entitlement.updateOne(
          {
            userId: inv.userId,
            type: "contacts_access",
            playerProfileId: null,
          },
          {
            $set: {
              active: true,
              grantedAt: new Date(),
              expiresAt: end,
              sourceInvoice: inv._id,
            },
          },
          { upsert: true, session }
        );
        await User.updateOne(
          { _id: inv.userId },
          { $set: { isActive: true } },
          { session }
        );
      }

      if (inv.product === "listing") {
        const end = new Date(Date.now() + ONE_YEAR_MS);
        if (inv.playerProfileId) {
          await PlayerProfile.updateOne(
            { _id: inv.playerProfileId, user: inv.userId },
            { $set: { isListed: true, isActive: true, listingExpiresAt: end } },
            { session }
          );
        }
        await Entitlement.updateOne(
          {
            userId: inv.userId,
            type: `listed_${inv.targetType}`,
            playerProfileId: inv.playerProfileId,
          },
          {
            $set: {
              active: true,
              grantedAt: new Date(),
              expiresAt: end,
              sourceInvoice: inv._id,
            },
          },
          { upsert: true, session }
        );
      }

      if (inv.product === "promotion") {
        const end = new Date(
          Date.now() +
            Number(inv.durationDays || PRICING.ONE_YEAR_DAYS) *
              24 *
              60 *
              60 *
              1000
        );
        if (inv.playerProfileId) {
          await PlayerProfile.updateOne(
            { _id: inv.playerProfileId, user: inv.userId },
            {
              $set: {
                "isPromoted.status": true,
                "isPromoted.type": inv.featureType || "toplist",
                "isPromoted.startDate": new Date(),
                "isPromoted.endDate": end,
              },
            },
            { session }
          );
        }
        await Entitlement.updateOne(
          {
            userId: inv.userId,
            type: `promoted_${inv.targetType}`,
            playerProfileId: inv.playerProfileId,
          },
          {
            $set: {
              active: true,
              grantedAt: new Date(),
              expiresAt: end,
              sourceInvoice: inv._id,
            },
          },
          { upsert: true, session }
        );
      }
    });
  } catch (err) {
    console.error("webhook txn error", err);
  } finally {
    session.endSession();
  }

  return res.status(200).json({ ok: true, verified: isPaid });
};

/* ========== 4) Helpers للـ UI ========== */
export const getPaymentStatus = async (req, res) => {
  const { id } = req.params;
  const inv = await Invoice.findById(id);
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

export const listMyInvoices = async (req, res) => {
  const userId = req.user?._id;
  if (!userId)
    return res.status(401).json({ success: false, message: "unauthorized" });

  const statusQ = req.query.status
    ? String(req.query.status).toLowerCase()
    : null;
  const q = { $or: [{ userId }, { user: userId }] };
  if (statusQ) q.status = new RegExp(`^${statusQ}$`, "i");

  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.max(1, Number(req.query.pageSize || 50));
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    Invoice.find(q).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    Invoice.countDocuments(q),
  ]);

  const mapped = items.map((inv) => ({
    id: String(inv._id),
    createdAt: inv.createdAt,
    product: inv.product,
    targetType: inv.targetType,
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
    paymentUrl: inv.status === "pending" ? inv.paymentUrl || null : null,
    receiptUrl: inv.paymentReceiptUrl || null,
    paidAt: inv.paidAt || null,
    durationDays: inv.durationDays || null,
  }));

  return res
    .status(200)
    .json({ success: true, data: { total, page, pageSize, items: mapped } });
};

// Admin: list all invoices with optional filters
export const listAllInvoices = async (req, res) => {
  // Authorization is enforced at the route level
  const statusQ = req.query.status
    ? String(req.query.status).toLowerCase()
    : null;
  const userQ = req.query.userId ? String(req.query.userId) : null;
  const productQ = req.query.product
    ? String(req.query.product).toLowerCase()
    : null;
  const orderQ = req.query.orderNumber ? String(req.query.orderNumber) : null;

  const q = {};
  if (statusQ) q.status = new RegExp(`^${statusQ}$`, "i");
  if (userQ) q.$or = [{ userId: userQ }, { user: userQ }];
  if (productQ) q.product = new RegExp(`^${productQ}$`, "i");
  if (orderQ) q.orderNumber = orderQ;

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
    targetType: inv.targetType,
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
    paymentUrl: inv.status === "pending" ? inv.paymentUrl || null : null,
    receiptUrl: inv.paymentReceiptUrl || null,
    paidAt: inv.paidAt || null,
    durationDays: inv.durationDays || null,
    lastProviderStatus: inv.lastProviderStatus || null,
    lastVerifiedAt: inv.lastVerifiedAt || null,
  }));

  return res
    .status(200)
    .json({ success: true, data: { total, page, pageSize, items: mapped } });
};

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

/* ========== 5) (DEV) محاكاة نجاح الدفع ========== */
export const simulateSuccess = async (req, res) => {
  try {
    const { id } = req.params;
    const inv = await Invoice.findById(id);
    if (!inv)
      return res
        .status(404)
        .json({ success: false, message: "invoice_not_found" });

    if (inv.status !== "paid") {
      inv.status = "paid";
      inv.paidAt = new Date();
      inv.providerTransactionNo =
        inv.providerTransactionNo || `SIM-${Date.now()}`;
      await inv.save();

      const ONE_YEAR_MS = (PRICING.ONE_YEAR_DAYS || 365) * 24 * 60 * 60 * 1000;

      if (inv.product === "contacts_access") {
        const end = new Date(Date.now() + ONE_YEAR_MS);
        await Entitlement.updateOne(
          {
            userId: inv.userId,
            type: "contacts_access",
            playerProfileId: null,
          },
          {
            $set: {
              active: true,
              grantedAt: new Date(),
              expiresAt: end,
              sourceInvoice: inv._id,
            },
          },
          { upsert: true }
        );
        await User.updateOne({ _id: inv.userId }, { $set: { isActive: true } });
      }

      if (inv.product === "listing") {
        const end = new Date(Date.now() + ONE_YEAR_MS);
        if (inv.playerProfileId) {
          await PlayerProfile.updateOne(
            { _id: inv.playerProfileId, user: inv.userId },
            { $set: { isListed: true, isActive: true, listingExpiresAt: end } }
          );
        }
        await Entitlement.updateOne(
          {
            userId: inv.userId,
            type: `listed_${inv.targetType}`,
            playerProfileId: inv.playerProfileId,
          },
          {
            $set: {
              active: true,
              grantedAt: new Date(),
              expiresAt: end,
              sourceInvoice: inv._id,
            },
          },
          { upsert: true }
        );
      }

      if (inv.product === "promotion") {
        const end = new Date(
          Date.now() +
            Number(inv.durationDays || PRICING.ONE_YEAR_DAYS) *
              24 *
              60 *
              60 *
              1000
        );
        if (inv.playerProfileId) {
          await PlayerProfile.updateOne(
            { _id: inv.playerProfileId, user: inv.userId },
            {
              $set: {
                "isPromoted.status": true,
                "isPromoted.type": inv.featureType || "toplist",
                "isPromoted.startDate": new Date(),
                "isPromoted.endDate": end,
              },
            }
          );
        }
        await Entitlement.updateOne(
          {
            userId: inv.userId,
            type: `promoted_${inv.targetType}`,
            playerProfileId: inv.playerProfileId,
          },
          {
            $set: {
              active: true,
              grantedAt: new Date(),
              expiresAt: end,
              sourceInvoice: inv._id,
            },
          },
          { upsert: true }
        );
      }
    }
    return res.status(200).json({
      success: true,
      data: { id: String(inv._id), status: inv.status },
    });
  } catch (e) {
    console.error("simulateSuccess error", e);
    return res.status(500).json({ success: false, message: "simulate_failed" });
  }
};
