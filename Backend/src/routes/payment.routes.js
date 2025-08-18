// src/routes/payment.routes.js
import { Router } from "express";
import {
  initiatePayment,
  initiatePaymentByInvoiceId,
  paymentWebhook,
  confirmReturn,
  getPaymentStatus,
  listMyInvoices,
  simulateSuccess,
  recheckByOrderNumber,
} from "../controllers/payments.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const r = Router();

r.post("/initiate", authMiddleware, initiatePayment);
r.post("/invoices/:id/initiate", authMiddleware, initiatePaymentByInvoiceId);

r.post("/webhook", paymentWebhook); // Paylink server-to-server POST
r.get("/return", confirmReturn); // (not used now—return to frontend instead)

r.get("/status/:id", authMiddleware, getPaymentStatus);
r.get("/invoices", authMiddleware, listMyInvoices);
// Manual recheck by orderNumber (merchant order number)
r.post("/invoices/recheck/:orderNumber", authMiddleware, recheckByOrderNumber);

// DEV simulate
r.post("/simulate/success/:id", authMiddleware, simulateSuccess);

export default r;
