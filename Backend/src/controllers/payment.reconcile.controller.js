import mongoose from "mongoose";
import Invoice from "../models/invoice.model.js";
import Entitlement from "../models/entitlement.model.js";
import PlayerProfile from "../models/player.model.js";
import User from "../models/user.model.js";
import {
  paylinkGetInvoice,
  paylinkGetOrderByNumber, 
  paylinkGetTransactionsOfOrder, 
} from "../services/paylink.client.js";
import { PRICING } from "../config/constants.js";
import { makeOrderNumber } from "../utils/orderNumber.js";


export const getPaymentStatusByOrderNumber = async (req, res) => {
  const userId = req.user?._id;
  if (!userId)
    return res.status(401).json({ success: false, message: "unauthorized" });

  const { orderNumber } = req.params;

  const inv = await Invoice.findOne({
    orderNumber,
    $or: [{ userId }, { user: userId }],
  });
  if (!inv) {
    return res
      .status(404)
      .json({ success: false, message: "invoice_not_found" });
  }

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

  if (paylinkStatus === "paid" && inv.status !== "paid") {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const doc = await Invoice.findById(inv._id).session(session);
        if (!doc) return;
        await applyInvoicePaid(doc, verify, session); 
      });
    } finally {
      session.endSession();
    }
  }

  const fresh = await Invoice.findById(inv._id).lean();
  return res.status(200).json({
    success: true,
    data: {
      id: String(fresh._id),
      status: String(fresh.status || "").toLowerCase(),
    },
  });
};

export const reconcileInvoices = async (req, res) => {
  const userId = req.user?._id;
  if (!userId)
    return res.status(401).json({ success: false, message: "unauthorized" });

  const ids = Array.isArray(req.body?.invoiceIds) ? req.body.invoiceIds : null;
  const orderNumbers = Array.isArray(req.body?.orderNumbers)
    ? req.body.orderNumbers
    : null;

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
