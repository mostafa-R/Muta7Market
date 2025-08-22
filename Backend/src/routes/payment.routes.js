import { Router } from "express";
import {
  createDraftInvoice,
  initiatePaymentByInvoiceId,
  paymentWebhook,
  getPaymentStatus,
  listMyInvoices,
  simulateSuccess,
  recheckByOrderNumber,
  reconcileMyInvoices,
  listAllInvoices,
} from "../controllers/payments.controller.js";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";

const r = Router();
r.post("/reconcile", authMiddleware, reconcileMyInvoices);  // <-- NEW

// Draft داخلي (لا يتصل بـ Paylink)
r.post("/drafts", authMiddleware, createDraftInvoice);

// بدء دفع لفاتورة داخلية (هنا فقط نتصل بـ Paylink)
r.post("/invoices/:id/initiate", authMiddleware, initiatePaymentByInvoiceId);

// Webhook من Paylink
r.post("/webhook", paymentWebhook);

// Helpers للـ UI
r.get("/status/:id", authMiddleware, getPaymentStatus);
r.get("/invoices", authMiddleware, listMyInvoices);
r.post("/invoices/recheck/:orderNumber", authMiddleware, recheckByOrderNumber);

// Admin: fetch all invoices (with optional filters)
r.get("/admin/invoices", authMiddleware, listAllInvoices);

// DEV
r.post("/simulate/success/:id", authMiddleware, simulateSuccess);

export default r;
