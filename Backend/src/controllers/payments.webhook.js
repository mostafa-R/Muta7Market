const mongoose = require("mongoose");
const { paylinkGetInvoice } = require("../services/paylink.client");
const PaymentEvent = require("../models/paymentEvent.model");
const Invoice = require("../models/invoice.model");
const Entitlement = require("../models/entitlement.model");
// const PlayerProfile = require("../models/playerProfile.model"); // if you maintain is_listed flag

async function paylinkWebhook(req, res) {
  // Authenticate webhook with static header configured in Paylink
  if (req.headers.authorization !== process.env.PAYLINK_WEBHOOK_AUTH) {
    return res.status(401).send("unauthorized");
  }

  const payload = req.body || {};
  const transactionNo = String(payload.transactionNo || "");
  const orderNumber = String(payload.merchantOrderNumber || payload.orderNumber || "");

  // Verify status with Paylink
  let verify;
  try {
    verify = await paylinkGetInvoice(transactionNo);
  } catch (err) {
    console.error("verify error", err);
    return res.status(200).json({ ok: false, verify: "failed" }); // let Paylink retry
  }
  const isPaid = String(verify.orderStatus || "").toLowerCase() === "paid";
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
  } catch (e) {
    return res.status(200).json({ ok: true, duplicate: true }); // already processed
  }

  // Transition invoice & grant entitlement atomically
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
          { userId: invoice.userId, type: "contacts_access", playerProfileId: null },
          { $setOnInsert: { active: true, grantedAt: new Date(), sourceInvoice: invoice._id } },
          { upsert: true, session }
        );
      } else if (invoice.product === "player_listing") {
        await Entitlement.updateOne(
          { userId: invoice.userId, type: "player_listed", playerProfileId: invoice.playerProfileId },
          { $setOnInsert: { active: true, grantedAt: new Date(), sourceInvoice: invoice._id } },
          { upsert: true, session }
        );
        // Optionally flip PlayerProfile visibility if you store it:
        // await PlayerProfile.updateOne({ _id: invoice.playerProfileId, userId: invoice.userId }, { $set: { is_listed: true } }, { session });
      }
    });
  } catch (err) {
    console.error("webhook txn error", err);
  } finally {
    session.endSession();
  }

  return res.status(200).json({ ok: true, verified: true });
}

module.exports = { paylinkWebhook };
