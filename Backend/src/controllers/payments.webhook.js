const mongoose = require("mongoose");
const { paylinkGetInvoice } = require("../services/paylink.client");
const PaymentEvent = require("../models/paymentEvent.model");
const Invoice = require("../models/invoice.model");
const Entitlement = require("../models/entitlement.model");
// const PlayerProfile = require("../models/playerProfile.model"); // if you maintain is_listed flag

async function paylinkWebhook(req, res) {
  console.log("[PaymentsWebhook(cjs)][webhook] received", {
    hasAuthHeader: Boolean(req.headers.authorization),
  });
  // Authenticate webhook with static header configured in Paylink
  if (req.headers.authorization !== process.env.PAYLINK_WEBHOOK_AUTH) {
    console.log("[PaymentsWebhook(cjs)][webhook] unauthorized header", req.headers.authorization ? req.headers.authorization.slice(0, 12) + "..." : null);
    return res.status(401).send("unauthorized");
  }

  const payload = req.body || {};
  const transactionNo = String(payload.transactionNo || "");
  const orderNumber = String(payload.merchantOrderNumber || payload.orderNumber || "");
  console.log("[PaymentsWebhook(cjs)][webhook] payload", { transactionNo, orderNumber, keys: Object.keys(payload || {}) });

  // Verify status with Paylink
  let verify;
  try {
    verify = await paylinkGetInvoice(transactionNo);
  } catch (err) {
    console.error("[PaymentsWebhook(cjs)][webhook] verify error", err);
    return res.status(200).json({ ok: false, verify: "failed" }); // let Paylink retry
  }
  const isPaid = String(verify.orderStatus || "").toLowerCase() === "paid";
  console.log("[PaymentsWebhook(cjs)][webhook] verification result", {
    isPaid,
    orderStatus: verify?.orderStatus || null,
    amount: verify?.amount || null,
    paymentErrorsCount: Array.isArray(verify?.paymentErrors) ? verify.paymentErrors.length : 0,
  });
  if (!isPaid) return res.status(200).json({ ok: true, verified: false });

  // Idempotency: store provider event (unique index)
  try {
    await PaymentEvent.create({
      provider: "paylink",
      providerEventId: transactionNo,
      orderNumber,
      type: "invoice.paid",
      raw: payload
    });
    console.log("[PaymentsWebhook(cjs)][webhook] event stored", { transactionNo });
  } catch (e) {
    console.log("[PaymentsWebhook(cjs)][webhook] duplicate event", { transactionNo });
    return res.status(200).json({ ok: true, duplicate: true }); // already processed
  }

  // Transition invoice & grant entitlement atomically
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const invoice = await Invoice.findOne({ orderNumber }).session(session);
      if (!invoice) {
        console.log("[PaymentsWebhook(cjs)][webhook] invoice not found for orderNumber", { orderNumber });
        return;
      }

      if (invoice.status !== "paid") {
        invoice.status = "paid";
        invoice.paidAt = new Date();
        invoice.providerTransactionNo = transactionNo;
        if (verify.paymentReceipt && verify.paymentReceipt.url) {
          invoice.paymentReceiptUrl = verify.paymentReceipt.url;
        }
        await invoice.save({ session });
        console.log("[PaymentsWebhook(cjs)][webhook] invoice marked paid", {
          invoiceId: String(invoice._id),
          paidAt: invoice.paidAt,
          receiptUrl: invoice.paymentReceiptUrl || null,
        });
      }

      if (invoice.product === "contacts_access") {
        await Entitlement.updateOne(
          { userId: invoice.userId, type: "contacts_access", playerProfileId: null },
          { $setOnInsert: { active: true, grantedAt: new Date(), sourceInvoice: invoice._id } },
          { upsert: true, session }
        );
        console.log("[PaymentsWebhook(cjs)][webhook] contacts_access entitlement ensured", { userId: String(invoice.userId) });
      } else if (invoice.product === "player_listing") {
        await Entitlement.updateOne(
          { userId: invoice.userId, type: "player_listed", playerProfileId: invoice.playerProfileId },
          { $setOnInsert: { active: true, grantedAt: new Date(), sourceInvoice: invoice._id } },
          { upsert: true, session }
        );
        console.log("[PaymentsWebhook(cjs)][webhook] player_listed entitlement ensured", { userId: String(invoice.userId), playerProfileId: invoice.playerProfileId ? String(invoice.playerProfileId) : null });
        // Optionally flip PlayerProfile visibility if you store it:
        // await PlayerProfile.updateOne({ _id: invoice.playerProfileId, userId: invoice.userId }, { $set: { is_listed: true } }, { session });
      }
    });
  } catch (err) {
    console.error("[PaymentsWebhook(cjs)][webhook] transaction error", err);
  } finally {
    session.endSession();
  }
  console.log("[PaymentsWebhook(cjs)][webhook] done", { verified: true });
  return res.status(200).json({ ok: true, verified: true });
}

module.exports = { paylinkWebhook };
