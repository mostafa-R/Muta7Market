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
import {
  authMiddleware,
  authorize,
} from "../middleware/auth.middleware.js";

const r = Router();

// إغلاق مسار محاكاة الدفع حصرياً لبيئة التطوير:
// يتطلب أن تكون NODE_ENV غير production و PAYMENT_SIMULATION_ENABLED=true صراحةً.
const simulationEnabled = () =>
  process.env.NODE_ENV !== "production" &&
  process.env.PAYMENT_SIMULATION_ENABLED === "true";

const devSimulationGuard = (req, res, next) => {
  if (!simulationEnabled()) {
    return res.status(404).json({ success: false, message: "not_found" });
  }
  return next();
};

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

r.get("/admin/invoices", authMiddleware, authorize("admin", "super_admin"), listAllInvoices);


r.post("/invoices/recheck/:orderNumber", authMiddleware, recheckByOrderNumber);

// DEV ONLY (يُرفض في الإنتاج ما لم يكن PAYMENT_SIMULATION_ENABLED=true)
r.post("/simulate/success/:id", devSimulationGuard, authMiddleware, simulateSuccess);

export default r;
