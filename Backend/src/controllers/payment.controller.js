// src/controllers/payment.controller.js
// Controller جاهز لدمج Paylink مع الاعتماد على userId من التوكن فقط

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Payment from "../models/payment.model.js";
import paymentService from "../services/payment.service.js";
import { PRICING } from "../config/constants.js";
import Player from "../models/player.model.js";
import User from "../models/user.model.js";

// ===== حالات الدفع (تلقائية من الاسكيمة لتفادي اختلاف الـ casing) =====
const PAYMENT_STATUS = (() => {
  try {
    const enumVals = Payment?.schema?.path("status")?.enumValues;
    if (Array.isArray(enumVals) && enumVals.length) {
      const map = {};
      for (const v of enumVals) map[v.toUpperCase()] = v;
      if (!map.PENDING)
        map.PENDING =
          enumVals.find((x) => x.toUpperCase() === "PENDING") || enumVals[0];
      if (!map.COMPLETED)
        map.COMPLETED =
          enumVals.find((x) => x.toUpperCase() === "COMPLETED") || enumVals[0];
      if (!map.FAILED)
        map.FAILED =
          enumVals.find((x) => x.toUpperCase() === "FAILED") || enumVals[0];
      return map;
    }
  } catch {}
  return { PENDING: "PENDING", COMPLETED: "COMPLETED", FAILED: "FAILED" };
})();

// Helpers
// Defaults align with Backend default port 5000 and typical Next.js dev port 3000
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;

const buildReturnUrls = (paymentId) => ({
  returnUrl: `${FRONTEND_URL}/profile?pid=${paymentId}&paid=1`,
  cancelUrl: `${FRONTEND_URL}/profile?pid=${paymentId}&paid=0`,
  webhookUrl: `${API_URL}/api/v1/payments/webhook`,
});

export const Getallorders = asyncHandler(async (req, res) => {
  // ⛔️ لا نعتمد على req.user إطلاقاً — إحضار كل الطلبات
  const {
    status,                 // PENDING | COMPLETED | FAILED
    type,                   // add_offer | promote_offer | ...
    from,                   // ISO date
    to,                     // ISO date
    q,                      // بحث في الوصف أو رقم المعاملة
    sort = "-createdAt",    // مثال: -createdAt أو amount
    page = 1,
    limit = 10,
    includeUser = "0",      // "1" لعمل populate محدود لليوزر
    withStats = "1",        // "1" لإرجاع إحصائيات سريعة
    selectRaw = "0",        // "1" لو عايز ترجّع gatewayResponse.raw
  } = req.query || {};

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

  // 🧭 فلتر عام على مستوى المجموعة كلها
  const filter = {};

  if (status) {
    const up = String(status).toUpperCase();
    if (!PAYMENT_STATUS[up]) throw new ApiError(400, "Invalid status filter");
    filter.status = PAYMENT_STATUS[up];
  }

  if (type) filter.type = String(type);

  if (from || to) {
    filter.createdAt = {};
    if (from) {
      const d = new Date(from);
      if (isNaN(d)) throw new ApiError(400, "Invalid 'from' date");
      filter.createdAt.$gte = d;
    }
    if (to) {
      const d = new Date(to);
      if (isNaN(d)) throw new ApiError(400, "Invalid 'to' date");
      filter.createdAt.$lte = d;
    }
  }

  if (q && String(q).trim()) {
    const s = String(q).trim();
    filter.$or = [
      { description: { $regex: s, $options: "i" } },
      { "gatewayResponse.checkoutId": { $regex: s, $options: "i" } },
    ];
  }

  const total = await Payment.countDocuments(filter);

  const query = Payment.find(filter)
    .sort(sort)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  // افتراضياً نخفي raw لتقليل البيانات الحساسة
  if (selectRaw !== "1") query.select("-gatewayResponse.raw");

  if (includeUser === "1") {
    query.populate({ path: "user", select: "_id name email" });
  }

  const items = await query.lean();

  let stats;
  if (withStats === "1") {
    const pipeline = [
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          amountTotal: { $sum: "$amount" },
        },
      },
    ];
    const agg = await Payment.aggregate(pipeline);
    stats = {
      total,
      byStatus: agg.reduce((acc, cur) => {
        acc[cur._id] = { count: cur.count, amountTotal: cur.amountTotal };
        return acc;
      }, {}),
    };
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
        items,
        stats,
      },
      "OK"
    )
  );
});

/**
 * GET /api/v1/payments
 * Return all payments. Admin can filter; regular user sees only their payments.
 */
export const listPayments = asyncHandler(async (req, res) => {
  const {
    status,
    type,
    q,
    from,
    to,
    page = 1,
    limit = 20,
    sort = "-createdAt",
  } = req.query || {};

  const filter = {};

  // If not admin, restrict to current user
  if (!req.user || !["admin", "super_admin"].includes(String(req.user.role))) {
    filter.user = req.user?._id || req.user?.id;
  }

  if (status) filter.status = String(status).toLowerCase();
  if (type) filter.type = String(type);
  if (q && String(q).trim()) {
    const s = String(q).trim();
    filter.$or = [
      { description: { $regex: s, $options: "i" } },
      { "gatewayResponse.checkoutId": { $regex: s, $options: "i" } },
    ];
  }
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

  const total = await Payment.countDocuments(filter);
  const items = await Payment.find(filter)
    .sort(sort)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .select("-gatewayResponse.raw")
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      { total, page: pageNum, limit: limitNum, items },
      "OK"
    )
  );
});


/**
 * POST /api/v1/payments/initiate
 * body: { paymentId? , currency? , description? , metadata? , type }
 * - userId يُستمد من التوكن فقط (authMiddleware يملأ req.user)
 * - amount يتم تحديده تلقائياً حسب نوع الدفع
 */
export const initiatePayment = asyncHandler(async (req, res) => {
  

  const userId = req.user?._id || req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const {
    paymentId,
    currency = "USD",
    description = "Subscription",
    type = "add_offer", // Default payment type
    metadata = {}, // لا تبعث userId هنا – يتم تجاهله
  } = req.body || {};

  

  let paymentDoc;
  // console.log(req); // Removed debug console.log

  if (paymentId) {
    paymentDoc = await Payment.findById(paymentId);
    if (!paymentDoc) {
      throw new ApiError(404, "Payment not found");
    }

    

    if (String(paymentDoc.user) !== String(userId)) {
      throw new ApiError(403, "Not allowed to pay this invoice");
    }
    if (String(paymentDoc.status) === String(PAYMENT_STATUS.COMPLETED)) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            paymentId: paymentDoc._id,
            paymentUrl: paymentDoc?.gatewayResponse?.checkoutUrl,
          },
          "Already paid"
        )
      );
    }
  } else {
    

    // Validate payment type
    const validTypes = [
      "add_offer",
      "promote_offer",
      "activate_user",
      "unlock_contact",
      "promote_player",
      "promote_coach",
    ];
    if (!validTypes.includes(type)) {
      throw new ApiError(
        400,
        `Invalid payment type. Must be one of: ${validTypes.join(", ")}`
      );
    }

    // Get static amount based on payment type
    const amountMap = {
      add_offer: PRICING.ADD_OFFER,
      promote_offer: PRICING.PROMOTE_OFFER,
      activate_user: PRICING.ACTIVATE_USER,
      unlock_contact: PRICING.UNLOCK_CONTACT,
      promote_player: PRICING.PROMOTE_PLAYER,
      promote_coach: PRICING.PROMOTE_COACH,
    };

    const amount = amountMap[type];

    if (!amount || amount <= 0) {
      throw new ApiError(
        400,
        `Invalid payment type or amount not configured for type: ${type}`
      );
    }

    paymentDoc = await Payment.create({
      user: userId, // ← من التوكن فقط
      type, // ← إضافة نوع الدفع
      amount, // ← مبلغ ثابت حسب النوع
      currency,
      description,
      metadata: { ...metadata }, // بدون userId
      gateway: process.env.PAYMENT_GATEWAY || "paylink",
      status: PAYMENT_STATUS.PENDING,
    });

    
  }

  

  // إنشاء الفاتورة على Paylink
  const urls = buildReturnUrls(paymentDoc._id);

  const init = await paymentService.initiatePayment(paymentDoc._id, {
    amount: paymentDoc.amount,
    currency: paymentDoc.currency,
    description: paymentDoc.description,
    // معلومات اختيارية لواجهة الدفع
    customerEmail: req.user?.email || metadata?.email,
    clientName: req.user?.name || metadata?.name,
    clientMobile: metadata?.mobile || "",
    ...urls,
  });

  

  if (!init?.checkoutUrl) {
    throw new ApiError(500, "Failed to create checkout session");
  }

  paymentDoc.gateway = "paylink";
  paymentDoc.gatewayResponse = {
    checkoutId: init.checkoutId,
    checkoutUrl: init.checkoutUrl,
    raw: init.raw || {},
  };
  await paymentDoc.save();
  

  const response = new ApiResponse(
    200,
    { paymentId: paymentDoc._id, paymentUrl: init.checkoutUrl },
    "Payment initiated"
  );

  

  return res.status(200).json(response);
});

/**
 * POST /api/v1/payments/webhook
 * يستقبل إشعار Paylink ويُحدّث حالة الدفع
 * (تفعيل المستخدم يتم داخل payment.service في handleWebhook)
 */
export const paymentWebhook = asyncHandler(async (req, res) => {
  

  const result = await paymentService.handleWebhook(req.body);

  

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Webhook processed successfully"));
});

/**
 * GET /api/v1/payments/:id
 * استعلام عن تفاصيل الدفع
 */
export const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payment = await Payment.findById(id).populate("user");
  if (!payment) throw new ApiError(404, "Payment not found");
  return res.status(200).json(new ApiResponse(200, payment, "OK"));
});

/**
 * GET /api/v1/payments/:id/status
 * يُستخدم من الفرونت للـ polling
 */
export const getPaymentStatus = asyncHandler(async (req, res) => {
  

  const { id } = req.params;
  const payment = await Payment.findById(id);

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  

  const response = {
    status: payment.status,
    gateway: payment.gateway,
    amount: payment.amount,
    currency: payment.currency,
    type: payment.type,
    checkoutUrl: payment?.gatewayResponse?.checkoutUrl,
    transactionNo: payment?.gatewayResponse?.checkoutId,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };

  
  return res.status(200).json(new ApiResponse(200, response, "OK"));
});

/**
 * GET /api/v1/payments/status/transaction/:transactionNo
 * Check payment status by transaction number (useful when user returns from payment gateway)
 */
export const getPaymentStatusByTransaction = asyncHandler(async (req, res) => {
  

  const { transactionNo } = req.params;

  if (!transactionNo) {
    throw new ApiError(400, "Transaction number is required");
  }

  // Find payment by transaction number
  const payment = await Payment.findOne({
    "gatewayResponse.checkoutId": transactionNo,
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found for this transaction");
  }

  

  // If payment is still pending, try to confirm it with Paylink
  if (payment.status === PAYMENT_STATUS.PENDING) {
    try {
      const confirmation = await paymentService.confirmTransaction(
        transactionNo,
        payment._id
      );
      

      // Refresh payment data after confirmation
      await payment.refresh();
    } catch (error) {
      
      // Continue with current status even if confirmation fails
    }
  }

  const response = {
    paymentId: payment._id,
    status: payment.status,
    gateway: payment.gateway,
    amount: payment.amount,
    currency: payment.currency,
    type: payment.type,
    transactionNo: payment?.gatewayResponse?.checkoutId,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };

  
  return res.status(200).json(new ApiResponse(200, response, "OK"));
});

/**
 * GET /api/v1/payments/confirm?transactionNo=...&pid=...
 * (اختياري) تأكيد يدوي بعد الرجوع من Paylink
 */
export const confirmReturn = asyncHandler(async (req, res) => {
  

  const { transactionNo, pid } = req.query;
  if (!transactionNo) {
    throw new ApiError(400, "Missing transactionNo");
  }

  
  const out = await paymentService.confirmTransaction(transactionNo, pid);

  

  return res.status(200).json(new ApiResponse(200, out, "Return confirmed"));
});

/**
 * POST /api/v1/payments/:id/refund
 * (اختياري) استرجاع
 */
export const refundPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body || {};
  const payment = await Payment.findById(id);
  if (!payment) throw new ApiError(404, "Payment not found");
  if (String(payment.status) !== String(PAYMENT_STATUS.COMPLETED)) {
    throw new ApiError(400, "Only completed payments can be refunded");
  }
  const result = await paymentService.refundPayment(payment, amount);
  return res.status(200).json(new ApiResponse(200, result, "Refund requested"));
});

/**
 * POST /api/v1/payments/:id/simulate-success
 * Dev-only: mark a payment as COMPLETED without contacting Paylink
 */
export const simulateSuccess = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_TEST_PAYMENTS) {
    throw new ApiError(403, "Simulation is not allowed in production");
  }

  const { id } = req.params;
  const { transactionNo } = req.body || {};
  const payment = await Payment.findById(id);
  if (!payment) throw new ApiError(404, "Payment not found");

  payment.gateway = payment.gateway || "paylink";
  payment.gatewayResponse = {
    ...(payment.gatewayResponse || {}),
    checkoutId: payment.gatewayResponse?.checkoutId || transactionNo || `TEST_${Date.now()}`,
    raw: {
      orderStatus: "PAID",
      transactionNo: transactionNo || payment.gatewayResponse?.checkoutId,
      simulated: true,
      at: new Date().toISOString(),
    },
  };
  payment.status = PAYMENT_STATUS.COMPLETED;

  // Activate player profile if exists (mimic production behavior)
  try {
    const player = await Player.findOne({ user: payment.user });
    if (player) {
      player.isActive = true;
      await player.save();
    }
  } catch {}

  await payment.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { paymentId: payment._id, status: payment.status }, "Payment simulated as success"));
});

/**
 * POST /api/v1/payments/:id/simulate-fail
 * Dev-only: mark a payment as FAILED without contacting Paylink
 */
export const simulateFail = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_TEST_PAYMENTS) {
    throw new ApiError(403, "Simulation is not allowed in production");
  }

  const { id } = req.params;
  const { reason = "Simulated failure" } = req.body || {};
  const payment = await Payment.findById(id);
  if (!payment) throw new ApiError(404, "Payment not found");

  payment.status = PAYMENT_STATUS.FAILED;
  payment.failureReason = reason;
  payment.gatewayResponse = {
    ...(payment.gatewayResponse || {}),
    raw: {
      orderStatus: "FAILED",
      reason,
      simulated: true,
      at: new Date().toISOString(),
    },
  };

  await payment.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { paymentId: payment._id, status: payment.status }, "Payment simulated as failed"));
});

export default {
  initiatePayment,
  paymentWebhook,
  getPaymentById,
  getPaymentStatus,
  getPaymentStatusByTransaction,
  confirmReturn,
  refundPayment,
  simulateSuccess,
  simulateFail,
};
