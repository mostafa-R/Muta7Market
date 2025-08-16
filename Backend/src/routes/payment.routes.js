// src/routes/payment.routes.js
import { Router } from "express";

import {
  confirmReturn,
  Getallorders,
  getPaymentById,
  getPaymentStatus,
  getPaymentStatusByTransaction,
  initiatePayment,
  paymentWebhook,
  refundPayment,
  simulateSuccess,
  simulateFail,
} from "../controllers/payment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { paymentLimiter } from "../middleware/rateLimiter.middleware.js";
const r = Router();

r.post("/orders", Getallorders);
r.post("/initiate", paymentLimiter, authMiddleware, initiatePayment);

// Webhook من Paylink (بدون Auth)
r.post("/webhook", paymentWebhook);

// تأكيد يدوي بعد الرجوع من Paylink (اختياري؛ بدون Auth)
r.get("/confirm", confirmReturn);

// حالة دفع محددة (لـ polling في الفرونت)
r.get("/:id/status", authMiddleware, getPaymentStatus);

// حالة دفع بواسطة رقم المعاملة (بدون Auth - مفيد عند العودة من بوابة الدفع)
r.get("/status/transaction/:transactionNo", getPaymentStatusByTransaction);

// تفاصيل دفع كاملة (اختياري)
r.get("/:id", authMiddleware, getPaymentById);

// طلب استرجاع (اختياري؛ يتطلب Auth)
r.post("/:id/refund", authMiddleware, refundPayment);

// Development-only simulation endpoints (guarded in controller)
r.post("/:id/simulate-success", authMiddleware, simulateSuccess);
r.post("/:id/simulate-fail", authMiddleware, simulateFail);

export default r;
