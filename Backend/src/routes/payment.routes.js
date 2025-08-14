// src/routes/payment.routes.js
import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  initiatePayment,
  paymentWebhook,
  getPaymentById,
  getPaymentStatus,
  getPaymentStatusByTransaction,
  confirmReturn,
  refundPayment,
  Getallorders,
} from "../controllers/payment.controller.js";
const r = Router();


r.post("/orders", Getallorders);
r.post("/initiate", authMiddleware, initiatePayment);

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


export default r;
