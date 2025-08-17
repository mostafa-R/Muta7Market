import mongoose from "mongoose";
import Invoice from "../models/invoice.model.js";
import PaymentEvent from "../models/paymentEvent.model.js";
import Entitlement from "../models/entitlement.model.js";
import User from "../models/user.model.js";
import PlayerProfile from "../models/player.model.js";
import {
  paylinkCreateInvoice,
  paylinkGetInvoice,
} from "../services/paylink.client.js";
import { makeOrderNumber } from "../utils/orderNumber.js";

const PRICE_CONTACTS = Number(process.env.PRICE_CONTACTS_ACCESS || 55);
const PRICE_LISTING = Number(process.env.PRICE_PLAYER_LISTING || 55);

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
    ].slice(0, 10); // keep last 10
  }
}

// Create/reuse invoice by product (when you don't have an id yet)
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

    // reuse pending
    let invoice = await Invoice.findOne({
      userId: user._id,
      product,
      playerProfileId: playerProfileId || null,
      status: "pending",
    });

    if (!invoice) {
      const orderNo = makeOrderNumber(product, String(user._id));
      invoice = await Invoice.create({
        orderNumber: orderNo,
        invoiceNumber: orderNo,
        userId: user._id,
        product,
        amount,
        currency: "SAR",
        status: "pending",
        playerProfileId: playerProfileId || null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    // Frontend return: go back to profile payments tab with invoiceId
    const callBackUrl = `${
      process.env.APP_URL
    }/profile?tab=payments&invoiceId=${String(invoice._id)}`;
    const cancelUrl = `${process.env.APP_URL}/profile?tab=payments`;

    const payload = {
      orderNumber: invoice.orderNumber,
      amount,
      currency: "SAR",
      clientName: user.name || user.email,
      clientEmail: user.email,
      clientMobile: user.phone || "0500000000",
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
      callBackUrl,
      cancelUrl,
      note: `userId=${user._id};product=${product};playerProfileId=${
        playerProfileId || ""
      }`,
    };

    const data = await paylinkCreateInvoice(payload);
    invoice.provider = "paylink";
    invoice.providerInvoiceId =
      data.transactionNo || data.invoiceId || undefined; // do not store null
    invoice.paymentUrl = data.url || null;
    if (!invoice.invoiceNumber) invoice.invoiceNumber = invoice.orderNumber;
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
    return res.status(500).json({ success: false, message: "initiate_failed" });
  }
};

// Start checkout for an existing invoice id (used by “Pay” button)
export const initiatePaymentByInvoiceId = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const invoice = await Invoice.findOne({
      _id: id,
      $or: [{ userId }, { user: userId }],
      status: "pending",
    });
    if (!invoice)
      return res
        .status(404)
        .json({ success: false, message: "invoice_not_found_or_not_pending" });

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
        },
      });
    }

    const callBackUrl = `${
      process.env.APP_URL
    }/profile?tab=payments&invoiceId=${String(invoice._id)}`;
    const cancelUrl = `${process.env.APP_URL}/profile?tab=payments`;

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
      callBackUrl,
      cancelUrl,
      note: `userId=${invoice.userId};product=${
        invoice.product
      };playerProfileId=${invoice.playerProfileId || ""}`,
    };

    const data = await paylinkCreateInvoice(payload);
    invoice.provider = "paylink";
    invoice.providerInvoiceId =
      data.transactionNo || data.invoiceId || undefined;
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

// Webhook (server-to-server)
export const paymentWebhook = async (req, res) => {
  if (req.headers.authorization !== process.env.PAYLINK_WEBHOOK_AUTH) {
    return res.status(401).send("unauthorized");
  }
  const payload = req.body || {};
  const transactionNo = String(payload.transactionNo || "");
  const orderNumber = String(
    payload.merchantOrderNumber || payload.orderNumber || ""
  );

  // verify with paylink
  let verify;
  try {
    verify = await paylinkGetInvoice(transactionNo);
  } catch (err) {
    console.error("verify error", err);
    return res.status(200).json({ ok: false, verify: "failed" });
  }

  const isPaid = String(verify.orderStatus || "").toLowerCase() === "paid";
  // idempotency
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

      if (inv.product === "contacts_access") {
        await Entitlement.updateOne(
          {
            userId: inv.userId,
            type: "contacts_access",
            playerProfileId: null,
          },
          {
            $setOnInsert: {
              active: true,
              grantedAt: new Date(),
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
      } else if (inv.product === "player_listing") {
        await Entitlement.updateOne(
          {
            userId: inv.userId,
            type: "player_listed",
            playerProfileId: inv.playerProfileId,
          },
          {
            $setOnInsert: {
              active: true,
              grantedAt: new Date(),
              sourceInvoice: inv._id,
            },
          },
          { upsert: true, session }
        );
        if (inv.playerProfileId) {
          await PlayerProfile.updateOne(
            { _id: inv.playerProfileId, user: inv.userId }, // NOTE: field is "user"
            { $set: { isListed: true, isActive: true } },
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
  return res.status(200).json({ ok: true, verified: isPaid });
};

// Optional: return endpoint (not used now because we send users back to frontend)
export const confirmReturn = async (_req, res) => {
  return res.status(200).json({ success: true, message: "Return OK" });
};

// Quick status (used by frontend polling)
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

// List my invoices (UI)
export const listMyInvoices = async (req, res) => {
  const userId = req.user?._id;
  if (!userId)
    return res.status(401).json({ success: false, message: "unauthorized" });

  const statusQ = req.query.status
    ? String(req.query.status).toLowerCase()
    : null;
  const ownerFilter = { $or: [{ userId }, { user: userId }] }; // b/c of older data

  const q = { ...ownerFilter };
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
    amount: inv.amount,
    currency: inv.currency || "SAR",
    status: String(inv.status || "").toLowerCase(),
    orderNumber: inv.orderNumber || inv.invoiceNumber || String(inv._id),
    paymentUrl: inv.status === "pending" ? inv.paymentUrl || null : null,
    receiptUrl: inv.paymentReceiptUrl || null,
    playerProfileId: inv.playerProfileId || null,
    paidAt: inv.paidAt || null,
  }));

  return res
    .status(200)
    .json({ success: true, data: { total, page, pageSize, items: mapped } });
};

// (dev) simulate: also flips user/profile flags like real webhook
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

      if (inv.product === "contacts_access") {
        await Entitlement.updateOne(
          {
            userId: inv.userId,
            type: "contacts_access",
            playerProfileId: null,
          },
          {
            $setOnInsert: {
              active: true,
              grantedAt: new Date(),
              sourceInvoice: inv._id,
            },
          },
          { upsert: true }
        );
        await User.updateOne({ _id: inv.userId }, { $set: { isActive: true } });
      } else if (inv.product === "player_listing") {
        await Entitlement.updateOne(
          {
            userId: inv.userId,
            type: "player_listed",
            playerProfileId: inv.playerProfileId,
          },
          {
            $setOnInsert: {
              active: true,
              grantedAt: new Date(),
              sourceInvoice: inv._id,
            },
          },
          { upsert: true }
        );
        if (inv.playerProfileId) {
          await PlayerProfile.updateOne(
            { _id: inv.playerProfileId, user: inv.userId },
            { $set: { isListed: true, isActive: true } }
          );
        }
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
