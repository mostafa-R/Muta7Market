import mongoose from "mongoose";
import Invoice from "../models/invoice.model.js";
import {
  paylinkGetInvoice,
  paylinkGetOrderByNumber,
} from "../services/paylink.client.js";

// ... existing helpers (SAR, resolvePrice, toDto, applyInvoicePaid, etc.)

/** ---------- NEW: get status by orderNumber (checks Paylink & applies effects) ---------- */
export const getPaymentStatusByOrderNumber = async (req, res) => {
  const userId = req.user?._id;
  if (!userId)
    return res.status(401).json({ success: false, message: "unauthorized" });

  const { orderNumber } = req.params;

  // find the local invoice that matches this orderNumber & belongs to the caller
  const inv = await Invoice.findOne({
    orderNumber,
    $or: [{ userId }, { user: userId }],
  });
  if (!inv) {
    return res
      .status(404)
      .json({ success: false, message: "invoice_not_found" });
  }

  // query Paylink by orderNumber
  let verify;
  try {
    verify = await paylinkGetOrderByNumber(orderNumber);
  } catch (e) {
    return res.status(200).json({
      success: true,
      data: {
        id: String(inv._id),
        status: String(inv.status || "").toLowerCase(),
      },
      note: "paylink_getOrder_failed",
    });
  }

  const paylinkStatus = String(
    verify?.orderStatus || verify?.status || ""
  ).toLowerCase();

  // if Paylink says paid but our DB isn't updated yet → apply it now (idempotent)
  if (paylinkStatus === "paid" && inv.status !== "paid") {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const doc = await Invoice.findById(inv._id).session(session);
        if (!doc) return;
        await applyInvoicePaid(doc, verify, session); // same function used by webhook/simulate
      });
    } finally {
      session.endSession();
    }
  }

  // respond with the (possibly-updated) local status
  const fresh = await Invoice.findById(inv._id).lean();
  return res.status(200).json({
    success: true,
    data: {
      id: String(fresh._id),
      status: String(fresh.status || "").toLowerCase(),
    },
  });
};

/** ---------- UPDATED: reconcile accepts invoiceIds OR orderNumbers ---------- */
export const reconcileInvoices = async (req, res) => {
  const userId = req.user?._id;
  if (!userId)
    return res.status(401).json({ success: false, message: "unauthorized" });

  const ids = Array.isArray(req.body?.invoiceIds) ? req.body.invoiceIds : null;
  const orderNumbers = Array.isArray(req.body?.orderNumbers)
    ? req.body.orderNumbers
    : null;

  // base filter: my pending Paylink invoices
  const base = {
    status: "pending",
    provider: "paylink",
    $or: [{ userId }, { user: userId }],
  };

  let list = [];
  if (ids?.length) {
    list = await Invoice.find({ ...base, _id: { $in: ids } });
  } else if (orderNumbers?.length) {
    list = await Invoice.find({ ...base, orderNumber: { $in: orderNumbers } });
  } else {
    // fallback to all my pending Paylink invoices that have a provider ref
    list = await Invoice.find({ ...base, providerInvoiceId: { $ne: null } });
  }

  if (!list.length) {
    return res
      .status(200)
      .json({ success: true, data: { checked: 0, updated: 0 } });
  }

  let updated = 0;

  for (const inv of list) {
    try {
      // Prefer reconcile by orderNumber if present; otherwise by transactionNo
      let verify = null;
      if (inv.orderNumber) {
        verify = await paylinkGetOrderByNumber(inv.orderNumber);
      } else if (inv.providerInvoiceId) {
        verify = await paylinkGetInvoice(String(inv.providerInvoiceId));
      }

      const isPaid =
        String(verify?.orderStatus || verify?.status || "").toLowerCase() ===
        "paid";
      if (!isPaid) continue;

      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          const doc = await Invoice.findById(inv._id).session(session);
          if (!doc) return;
          await applyInvoicePaid(doc, verify, session);
        });
        updated++;
      } finally {
        session.endSession();
      }
    } catch (e) {
      console.warn("reconcile failed for", inv._id, e?.message);
    }
  }

  return res.status(200).json({
    success: true,
    data: { checked: list.length, updated },
  });
};
