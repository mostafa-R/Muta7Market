import mongoose from "mongoose";
import Invoice from "../models/invoice.model.js";
import PaymentEvent from "../models/paymentEvent.model.js";
import Entitlement from "../models/entitlement.model.js";
import {
  paylinkCreateInvoice,
  paylinkGetInvoice,
} from "../services/paylink.client.js";
import { makeOrderNumber } from "../utils/orderNumber.js";
import PlayerProfile from "../models/player.model.js"; // adjust path/name if different

const PRICE_CONTACTS = Number(process.env.PRICE_CONTACTS_ACCESS || 55);
const PRICE_LISTING = Number(process.env.PRICE_PLAYER_LISTING || 55);

/* ------------ Create invoice + Paylink session ------------ */
export const initiatePayment = async (req, res) => {
  try {
    const user = req.user;
    const { product, playerProfileId } = req.body;

    if (!["contacts_access", "player_listing"].includes(product)) {
      return res
        .status(400)
        .json({ success: false, message: "invalid_product" });
    }
    if (product === "player_listing" && !playerProfileId) {
      return res
        .status(400)
        .json({ success: false, message: "playerProfileId_required" });
    }

    const amount =
      product === "contacts_access" ? PRICE_CONTACTS : PRICE_LISTING;

    // Reuse pending invoice
    let invoice = await Invoice.findOne({
      userId: user._id,
      product,
      playerProfileId: playerProfileId || null,
      status: "pending",
    });

    if (!invoice) {
      invoice = await Invoice.create({
        orderNumber: makeOrderNumber(product, String(user._id)),
        invoiceNumber: makeOrderNumber(product, String(user._id)),
        userId: user._id,
        product,
        amount,
        currency: "SAR",
        status: "pending",
        playerProfileId: playerProfileId || null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    const payload = {
      orderNumber: invoice.orderNumber,
      amount,
      currency: "SAR",
      clientName: user.name || user.email,
      clientEmail: user.email,
      clientMobile: user.mobile || "0500000000",
      products: [
        {
          title:
            product === "contacts_access"
              ? "Contacts access (lifetime)"
              : "Player listing",
          price: amount,
          qty: 1,
          isDigital: true,
        },
      ],
      supportedCardBrands: ["mada", "visaMastercard", "stcpay"],
      callBackUrl: `${process.env.BACKEND_URL}/api/v1/payments/return`,
      cancelUrl: `${process.env.APP_URL}/payments/cancelled`,
      note: `userId=${user._id};product=${product};playerProfileId=${
        playerProfileId || ""
      }`,
    };

    const data = await paylinkCreateInvoice(payload);
    invoice.provider = "paylink";
    invoice.providerInvoiceId = data.transactionNo || data.invoiceId || null;
    invoice.paymentUrl = data.url || null;
    await invoice.save();

    return res.status(200).json({
      success: true,
      data: {
        invoiceId: String(invoice._id),
        orderNumber: invoice.orderNumber,
        paymentUrl: invoice.paymentUrl,
        status: invoice.status,
        amount: invoice.amount,
        currency: invoice.currency,
        product: invoice.product,
        playerProfileId: invoice.playerProfileId,
      },
    });
  } catch (err) {
    console.error("initiatePayment error", err);
    return res
      .status(500)
      .json({ success: false, message: "initiate_failed" + err });
  }
};

/* ------------------------- Webhook ------------------------ */
export const paymentWebhook = async (req, res) => {
  if (req.headers.authorization !== process.env.PAYLINK_WEBHOOK_AUTH) {
    return res.status(401).send("unauthorized");
  }

  const payload = req.body || {};
  const transactionNo = String(payload.transactionNo || "");
  const orderNumber = String(
    payload.merchantOrderNumber || payload.orderNumber || ""
  );

  // Verify with Paylink
  let verify;
  try {
    verify = await paylinkGetInvoice(transactionNo);
  } catch (err) {
    console.error("verify error", err);
    return res.status(200).json({ ok: false, verify: "failed" }); // retry later
  }
  const isPaid = String(verify.orderStatus || "").toLowerCase() === "paid";
  if (!isPaid) return res.status(200).json({ ok: true, verified: false });
  if (invoice.product === "player_listing") {
    await Entitlement.updateOne(
      {
        userId: invoice.userId,
        type: "player_listed",
        playerProfileId: invoice.playerProfileId,
      },
      {
        $setOnInsert: {
          active: true,
          grantedAt: new Date(),
          sourceInvoice: invoice._id,
        },
      },
      { upsert: true, session }
    );
    if (invoice.playerProfileId) {
      await PlayerProfile.updateOne(
        { _id: invoice.playerProfileId, userId: invoice.userId },
        { $set: { isListed: true, isActive: true } }, // <- set BOTH
        { session }
      );
    }
  }
  // Idempotency
  try {
    await PaymentEvent.create({
      provider: "paylink",
      providerEventId: transactionNo,
      orderNumber,
      type: "invoice.paid",
      raw: payload,
    });
  } catch {
    return res.status(200).json({ ok: true, duplicate: true }); // already processed
  }

  // Transition invoice & grant entitlement & list profile
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const invoice = await Invoice.findOne({ orderNumber }).session(session);
      if (!invoice) return;

      if (invoice.status !== "paid") {
        invoice.status = "paid";
        invoice.paidAt = new Date();
        invoice.providerTransactionNo = transactionNo;
        if (verify.paymentReceipt && verify.paymentReceipt.url) {
          invoice.paymentReceiptUrl = verify.paymentReceipt.url;
        }
        await invoice.save({ session });
      }

      if (invoice.product === "contacts_access") {
        await Entitlement.updateOne(
          {
            userId: invoice.userId,
            type: "contacts_access",
            playerProfileId: null,
          },
          {
            $setOnInsert: {
              active: true,
              grantedAt: new Date(),
              sourceInvoice: invoice._id,
            },
          },
          { upsert: true, session }
        );
      } else if (invoice.product === "player_listing") {
        await Entitlement.updateOne(
          {
            userId: invoice.userId,
            type: "player_listed",
            playerProfileId: invoice.playerProfileId,
          },
          {
            $setOnInsert: {
              active: true,
              grantedAt: new Date(),
              sourceInvoice: invoice._id,
            },
          },
          { upsert: true, session }
        );
        // Make the profile visible in the list
        if (invoice.playerProfileId) {
          await PlayerProfile.updateOne(
            { _id: invoice.playerProfileId, userId: invoice.userId },
            { $set: { isListed: true } },
            { session }
          );
        }
      }
    });
  } catch (err) {
    console.error("webhook txn error", err);
  } finally {
    session.endSession();
  }

  return res.status(200).json({ ok: true, verified: true });
};

export const confirmReturn = async (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Payment received. Access unlocks once verified.",
  });
};

/* -------------------- Status helpers --------------------- */
export const getPaymentStatus = async (req, res) => {
  const { id } = req.params;
  const inv = await Invoice.findById(id);
  if (!inv)
    return res.status(404).json({ success: false, message: "not_found" });
  return res
    .status(200)
    .json({ success: true, data: { id: String(inv._id), status: inv.status } });
};

export const getPaymentStatusByTransaction = async (req, res) => {
  const { transactionNo } = req.params;
  const inv = await Invoice.findOne({ providerTransactionNo: transactionNo });
  if (!inv)
    return res.status(404).json({ success: false, message: "not_found" });
  return res
    .status(200)
    .json({ success: true, data: { id: String(inv._id), status: inv.status } });
};

/* -------------------- Invoices (UI) ---------------------- */
export const listMyInvoices = async (req, res) => {
  const userId = req.user?._id;
  if (!userId)
    return res.status(401).json({ success: false, message: "unauthorized" });

  const statusQ = req.query.status
    ? String(req.query.status).toLowerCase()
    : null;
  const ownerFilter = { $or: [{ userId }, { user: userId }] }; // backward compat

  const q = { ...ownerFilter };
  if (statusQ) q.status = new RegExp(`^${statusQ}$`, "i");

  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.max(1, Number(req.query.pageSize || 50));
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    Invoice.find(q).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    Invoice.countDocuments(q),
  ]);

  const mapped = items.map((inv) => {
    const product =
      inv.product ||
      (inv.type === "unlock_contacts"
        ? "contacts_access"
        : inv.type === "publish_profile"
        ? "player_listing"
        : undefined);

    const status = String(inv.status || "").toLowerCase();

    return {
      id: String(inv._id),
      createdAt: inv.createdAt,
      product,
      amount: inv.amount ?? inv.totalAmount ?? 0,
      currency: inv.currency || "SAR",
      status,
      paymentUrl: status === "pending" ? inv.paymentUrl || null : null,
      receiptUrl: inv.paymentReceiptUrl || null,
      orderNumber: inv.orderNumber || inv.invoiceNumber || String(inv._id),
      playerProfileId: inv.playerProfileId || inv.relatedPlayer || null,
      paidAt: inv.paidAt || null,
    };
  });

  return res.status(200).json({
    success: true,
    data: { total, page, pageSize, items: mapped },
  });
};

export const getInvoiceById = async (req, res) => {
  const userId = req.user?._id;
  if (!userId)
    return res.status(401).json({ success: false, message: "unauthorized" });

  const { id } = req.params;
  const inv = await Invoice.findOne({
    _id: id,
    $or: [{ userId }, { user: userId }],
  }).lean();
  if (!inv)
    return res
      .status(404)
      .json({ success: false, message: "invoice_not_found" });

  const product =
    inv.product ||
    (inv.type === "unlock_contacts"
      ? "contacts_access"
      : inv.type === "publish_profile"
      ? "player_listing"
      : undefined);

  const status = String(inv.status || "").toLowerCase();

  return res.status(200).json({
    success: true,
    data: {
      id: String(inv._id),
      createdAt: inv.createdAt,
      product,
      amount: inv.amount ?? inv.totalAmount ?? 0,
      currency: inv.currency || "SAR",
      status,
      paymentUrl: status === "pending" ? inv.paymentUrl || null : null,
      receiptUrl: inv.paymentReceiptUrl || null,
      orderNumber: inv.orderNumber || inv.invoiceNumber || String(inv._id),
      playerProfileId: inv.playerProfileId || inv.relatedPlayer || null,
      paidAt: inv.paidAt || null,
    },
  });
};

/* ---------------- Entitlements (UI) ---------------------- */
export const checkEntitlement = async (req, res) => {
  const userId = req.user?._id;
  if (!userId)
    return res.status(401).json({ success: false, message: "unauthorized" });

  const { type, playerProfileId } = req.query || {};
  if (!["contacts_access", "player_listed"].includes(type)) {
    return res.status(400).json({ success: false, message: "invalid_type" });
  }

  const q = { userId, type, active: true };
  if (type === "player_listed") {
    if (!playerProfileId)
      return res
        .status(400)
        .json({ success: false, message: "playerProfileId_required" });
    q.playerProfileId = playerProfileId;
  } else {
    q.playerProfileId = null;
  }

  const ent = await Entitlement.findOne(q).lean();
  return res.status(200).json({ success: true, data: { active: !!ent } });
};

export const listMyEntitlements = async (req, res) => {
  const userId = req.user?._id;
  if (!userId)
    return res.status(401).json({ success: false, message: "unauthorized" });

  const items = await Entitlement.find({ userId, active: true })
    .sort({ grantedAt: -1 })
    .lean();
  return res.status(200).json({
    success: true,
    data: items.map((e) => ({
      id: String(e._id),
      type: e.type,
      playerProfileId: e.playerProfileId,
      grantedAt: e.grantedAt,
      sourceInvoice: String(e.sourceInvoice),
    })),
  });
};

export const initiatePaymentByInvoiceId = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params; // Mongo _id of the invoice

    const invoice = await Invoice.findOne({
      _id: id,
      $or: [{ userId }, { user: userId }], // backward compat
      status: "pending",
    });
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "invoice_not_found_or_not_pending" });
    }

    // already has a paymentUrl? reuse it
    if (invoice.paymentUrl) {
      if (!invoice.invoiceNumber) {
        invoice.invoiceNumber = invoice.orderNumber;
        await invoice.save();
      }
      return res.status(200).json({
        success: true,
        data: {
          paymentUrl: invoice.paymentUrl,
          orderNumber: invoice.orderNumber,
          invoiceId: String(invoice._id),
        },
      });
    }

    // build Paylink payload from existing invoice data
    const payload = {
      orderNumber: invoice.orderNumber,
      amount: invoice.amount,
      currency: invoice.currency || "SAR",
      clientName: req.user?.name || req.user?.email,
      clientEmail: req.user?.email,
      clientMobile: req.user?.phone || "0500000000",
      products: [
        {
          title:
            invoice.product === "contacts_access"
              ? "Contacts access (lifetime)"
              : "Player listing",
          price: invoice.amount,
          qty: 1,
          isDigital: true,
        },
      ],
      supportedCardBrands: ["mada", "visaMastercard", "stcpay"],
      // Change these only if your paylink client expects different keys:
      callBackUrl: `${process.env.BACKEND_URL}/api/v1/payments/return`,
      cancelUrl: `${process.env.APP_URL}/profile?tab=payments`,
      note: `userId=${invoice.userId};product=${
        invoice.product
      };playerProfileId=${invoice.playerProfileId || ""}`,
    };

    const data = await paylinkCreateInvoice(payload);

    invoice.provider = "paylink";
    invoice.providerInvoiceId =
      data.transactionNo || data.invoiceId || undefined; // <- undefined, not null
    invoice.paymentUrl = data.url || null;
    if (!invoice.invoiceNumber) invoice.invoiceNumber = invoice.orderNumber;
    await invoice.save();

    return res.status(200).json({
      success: true,
      data: {
        paymentUrl: invoice.paymentUrl,
        orderNumber: invoice.orderNumber,
        invoiceId: String(invoice._id),
      },
    });
  } catch (err) {
    console.error("initiatePaymentByInvoiceId error", err);
    return res.status(500).json({ success: false, message: "initiate_failed" });
  }
};

/* -------------- DEV simulate (optional) ------------------ */
export const simulateSuccess = async (req, res) => {
  try {
    const { id } = req.params; // invoiceId
    const invoice = await Invoice.findById(id);
    if (!invoice)
      return res
        .status(404)
        .json({ success: false, message: "invoice_not_found" });

    if (invoice.status !== "paid") {
      invoice.status = "paid";
      invoice.paidAt = new Date();
      invoice.providerTransactionNo =
        invoice.providerTransactionNo || `SIM-${Date.now()}`;
      await invoice.save();

      if (invoice.product === "contacts_access") {
        await Entitlement.updateOne(
          {
            userId: invoice.userId,
            type: "contacts_access",
            playerProfileId: null,
          },
          {
            $setOnInsert: {
              active: true,
              grantedAt: new Date(),
              sourceInvoice: invoice._id,
            },
          },
          { upsert: true }
        );
      } else if (invoice.product === "player_listing") {
        await Entitlement.updateOne(
          {
            userId: invoice.userId,
            type: "player_listed",
            playerProfileId: invoice.playerProfileId,
          },
          {
            $setOnInsert: {
              active: true,
              grantedAt: new Date(),
              sourceInvoice: invoice._id,
            },
          },
          { upsert: true }
        );
        if (invoice.playerProfileId) {
          await PlayerProfile.updateOne(
            { _id: invoice.playerProfileId, userId: invoice.userId },
            { $set: { isListed: true } }
          );
        }
      }
    }
    return res.status(200).json({
      success: true,
      data: { id: String(invoice._id), status: invoice.status },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: "simulate_failed" });
  }
};

export const refundPayment = async (_req, res) =>
  res.status(403).json({ success: false, message: "not_implemented" });
export const simulateFail = async (_req, res) =>
  res.status(403).json({ success: false, message: "disabled_in_prod" });
