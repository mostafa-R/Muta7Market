import express, { Router } from "express";
import {
  initiatePayment,
  paymentWebhook,
  confirmReturn,
  getPaymentStatus,
  getPaymentStatusByTransaction,
  refundPayment,
  simulateSuccess,
  simulateFail,
  listMyInvoices,
  getInvoiceById,
  checkEntitlement,
  listMyEntitlements,
  initiatePaymentByInvoiceId,
} from "../controllers/payments.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

// Replace with your real auth middleware that sets req.user
function ensureAuth(req, res, next) {
  if (!req.user?._id)
    return res.status(401).json({ success: false, message: "unauthorized" });
  next();
}

const r = Router();

// creation
r.post("/initiate", authMiddleware, initiatePayment);
r.post("/invoices/:id/initiate", authMiddleware, initiatePaymentByInvoiceId); // <-- click Pay on an existing invoice

// webhook (public, protected by header secret)
r.post("/webhook", express.json({ type: "application/json" }), paymentWebhook);

// optional browser return
r.get("/return", confirmReturn);

// status helpers
r.get("/status/:id", authMiddleware, getPaymentStatus);
r.get(
  "/status/transaction/:transactionNo",
  authMiddleware,
  getPaymentStatusByTransaction
);
r.get(
  "/status/by-tx/:transactionNo",
  authMiddleware,
  getPaymentStatusByTransaction
);

// invoices (user-visible)
r.get("/invoices", authMiddleware, listMyInvoices);
r.get("/invoices/:id", authMiddleware, getInvoiceById);

// entitlements (user-visible)
r.get("/entitlements/check", authMiddleware, checkEntitlement);
r.get("/entitlements/me", authMiddleware, listMyEntitlements);

// dev-only simulate
r.post("/simulate/success/:id", authMiddleware, simulateSuccess);
r.post("/simulate/fail", authMiddleware, simulateFail);
r.post("/refund", authMiddleware, refundPayment);

export default r;
