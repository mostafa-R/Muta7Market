// src/services/payment.service.js
import axios from "axios";
import Payment from "../models/payment.model.js"; // ⬅️ شِلّنا named import
import Player from "../models/player.model.js";
import Invoice from "../models/invoice.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

// ===== حالات الدفع (تلقائية من الموديل) =====
const PAYMENT_STATUS = (() => {
  try {
    const enumVals = Payment?.schema?.path("status")?.enumValues;
    if (Array.isArray(enumVals) && enumVals.length) {
      // بنبني خريطة UPPER -> actual value من الاسكيمة
      const map = {};
      for (const v of enumVals) map[v.toUpperCase()] = v;
      // fallback مع أسماء متوقعة لو ناقصة
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
  } catch (_) {
    // Ignore error
  }
  // Fallback لو مفيش enum متعرف
  return { PENDING: "PENDING", COMPLETED: "COMPLETED", FAILED: "FAILED" };
})();

// ========== Paylink Gateway ==========
class PaylinkGateway {
  constructor() {
    // Fallback to official Paylink REST API base if env not set
    this.base = process.env.PAYLINK_BASE_URL || "https://restapi.paylink.sa";
    this.apiId = process.env.PAYLINK_API_ID;
    this.secret = process.env.PAYLINK_SECRET;
    this.token = null;
    this.tokenExp = 0;
  }

  async _auth() {
    console.log("🔐 [PAYLINK AUTH] Starting authentication...");
    const now = Date.now();
    if (this.token && now < this.tokenExp) {
      console.log("✅ [PAYLINK AUTH] Using cached token");
      return this.token;
    }

    if (!this.apiId || !this.secret) {
      console.error("❌ [PAYLINK AUTH] Missing PAYLINK_API_ID or PAYLINK_SECRET env vars");
      throw new ApiError(500, "Paylink credentials are not configured");
    }

    console.log("🔄 [PAYLINK AUTH] Requesting new token from Paylink...");
    const { data } = await axios.post(`${this.base}/api/auth`, {
      apiId: this.apiId,
      secretKey: this.secret,
      persistToken: true,
    });
    console.log("📋 [PAYLINK AUTH] Auth response received:", {
      hasToken: !!data?.id_token,
      responseKeys: Object.keys(data || {})
    });
    
    this.token = data?.id_token;
    if (!this.token) {
      console.log("❌ [PAYLINK AUTH] No token received in response");
      throw new ApiError(500, "Paylink auth failed: missing token");
    }
    
    this.tokenExp = now + 29 * 60 * 60 * 1000; // 29h
    console.log("✅ [PAYLINK AUTH] Token obtained successfully");
    return this.token;
  }

  async createCheckout({
    amount,
    currency,
    orderId,
    description,
    customerEmail,
    returnUrl,
    cancelUrl,
  }) {
    console.log("🔄 [PAYLINK CHECKOUT] Creating checkout session...");
    console.log("📋 [PAYLINK CHECKOUT] Request parameters:", {
      amount,
      currency,
      orderId,
      description,
      customerEmail,
      returnUrl,
      cancelUrl
    });

    const token = await this._auth();

    const body = {
      orderNumber: String(orderId),
      amount,
      currency: currency || "SAR",
      callBackUrl: returnUrl,
      cancelUrl: cancelUrl || returnUrl,
      clientName: description?.slice(0, 50) || "Customer",
      clientEmail: customerEmail || "",
      clientMobile: "0500000000",
      products: [{ title: description || "Order", price: amount, qty: 1 }],
    };

    console.log("📋 [PAYLINK CHECKOUT] Request body to Paylink:", JSON.stringify(body, null, 2));

    console.log("🔄 [PAYLINK CHECKOUT] Sending request to Paylink...");
    const { data } = await axios.post(`${this.base}/api/addInvoice`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("📋 [PAYLINK CHECKOUT] Paylink response received:", JSON.stringify(data, null, 2));

    if (!data?.url || !data?.transactionNo) {
      console.log("❌ [PAYLINK CHECKOUT] Invalid response - missing URL or transaction number");
      throw new ApiError(500, "Invalid Paylink response");
    }

    const result = { checkoutId: data.transactionNo, checkoutUrl: data.url, raw: data };
    console.log("✅ [PAYLINK CHECKOUT] Checkout created successfully:", {
      checkoutId: result.checkoutId,
      checkoutUrl: result.checkoutUrl
    });

    return result;
  }

  async getInvoice(transactionNo) {
    console.log("🔄 [PAYLINK INVOICE] Fetching invoice from Paylink...");
    console.log("📋 [PAYLINK INVOICE] Transaction number:", transactionNo);

    const token = await this._auth();
    
    console.log("🔄 [PAYLINK INVOICE] Sending GET request to Paylink...");
    const { data } = await axios.get(
      `${this.base}/api/getInvoice/${transactionNo}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    console.log("📋 [PAYLINK INVOICE] Invoice response received:", JSON.stringify(data, null, 2));
    console.log("✅ [PAYLINK INVOICE] Invoice fetched successfully");
    
    return data;
  }

  async refundPayment(/* transactionId, amount */) {
    // Placeholder للرافند
    return { refundTransactionId: `paylink_ref_${Date.now()}` };
  }
}

// ========== Payment Service ==========
class PaymentService {
  constructor() {
    this.gateway = this.initializeGateway();
  }

  initializeGateway() {
    const gateway = process.env.PAYMENT_GATEWAY || "paylink";
    switch (gateway) {
      case "paylink":
      default:
        return new PaylinkGateway();
    }
  }

  // يبدأ جلسة دفع ويخزن الـ checkoutUrl/Id
  initiatePayment = async (
    paymentId,
    { amount, currency, description, customerEmail, returnUrl, cancelUrl }
  ) => {
    console.log("🔄 [PAYMENT INITIATE] Starting payment initiation...");
    console.log("📋 [PAYMENT INITIATE] Payment ID:", paymentId);
    console.log("📋 [PAYMENT INITIATE] Request data:", {
      amount,
      currency,
      description,
      customerEmail,
      returnUrl,
      cancelUrl
    });

    const payment = await Payment.findById(paymentId);
    if (!payment) throw new ApiError(404, "Payment not found");
    
    console.log("📋 [PAYMENT INITIATE] Found payment in DB:", {
      id: payment._id,
      user: payment.user,
      type: payment.type,
      amount: payment.amount,
      status: payment.status
    });

    console.log("🔄 [PAYMENT INITIATE] Creating checkout with gateway...");
    const init = await this.gateway.createCheckout({
      amount,
      currency,
      orderId: payment._id,
      description,
      customerEmail,
      returnUrl,
      cancelUrl,
    });

    console.log("✅ [PAYMENT INITIATE] Gateway response received:", {
      checkoutId: init.checkoutId,
      checkoutUrl: init.checkoutUrl,
      hasRawData: !!init.raw
    });

    payment.gateway = "paylink";
    payment.gatewayResponse = {
      checkoutId: init.checkoutId,
      checkoutUrl: init.checkoutUrl,
      raw: init.raw || {},
    };
    payment.status = PAYMENT_STATUS.PENDING; // ← هيتم تحويلها للصيغة اللي في الموديل تلقائيًا
    
    console.log("💾 [PAYMENT INITIATE] Saving payment to DB...");
    await payment.save();
    console.log("✅ [PAYMENT INITIATE] Payment saved successfully");

    return init;
  };

  // Webhook من Paylink
  handleWebhook = async (body) => {
    console.log("🔄 [WEBHOOK] Received webhook from Paylink");
    console.log("📋 [WEBHOOK] Raw webhook body:", JSON.stringify(body, null, 2));
    
    const transactionNo =
      body?.transactionNo || body?.TransactionNo || body?.transactionID;
    console.log("📋 [WEBHOOK] Extracted transaction number:", transactionNo);
    
    if (!transactionNo)
      throw new ApiError(400, "Missing transactionNo in webhook body");

    console.log("🔄 [WEBHOOK] Fetching invoice from Paylink...");
    const invoice = await this.gateway.getInvoice(transactionNo);
    console.log("📋 [WEBHOOK] Paylink invoice response:", JSON.stringify(invoice, null, 2));
    
    const statusStr = String(
      invoice?.orderStatus || invoice?.OrderStatus || ""
    ).toUpperCase();
    console.log("📋 [WEBHOOK] Payment status from Paylink:", statusStr);

    const isPaid = statusStr === "PAID" || statusStr === "PAID PARTIALLY";
    console.log("📋 [WEBHOOK] Is payment completed?", isPaid);

    console.log("🔄 [WEBHOOK] Finding payment in database...");
    const payment = await Payment.findOne({
      "gatewayResponse.checkoutId": transactionNo,
    });
    if (!payment) {
      console.log("❌ [WEBHOOK] Payment not found for transaction:", transactionNo);
      throw new ApiError(404, "Payment not found for this transaction");
    }
    
    console.log("📋 [WEBHOOK] Found payment in DB:", {
      id: payment._id,
      user: payment.user,
      type: payment.type,
      amount: payment.amount,
      currentStatus: payment.status
    });

    console.log("💾 [WEBHOOK] Updating payment with invoice data...");
    payment.gatewayResponse = {
      ...(payment.gatewayResponse || {}),
      raw: invoice,
    };

    if (isPaid) {
      console.log("✅ [WEBHOOK] Payment is completed - updating status to COMPLETED");
      payment.status = PAYMENT_STATUS.COMPLETED;

      // Post-payment actions based on type
      try {
        if (payment.type === "activate_user") {
          console.log("🔄 [WEBHOOK] Activating user account...");
          await User.findByIdAndUpdate(payment.user, { isActive: true });
          console.log("✅ [WEBHOOK] User account activated:", payment.user);
        }

        // For promote_player keep activating player profile (existing behavior)
        if (payment.type === "promote_player") {
          console.log("🔄 [WEBHOOK] Attempting to activate player profile...");
          const player = await Player.findOne({ user: payment.user });
          if (player) {
            player.isActive = true;
            await player.save();
            console.log("✅ [WEBHOOK] Player profile activated for user:", payment.user);
          }
        }

        // Create invoice for PAID payment (idempotent)
        const existingInvoice = await Invoice.findOne({ payment: payment._id });
        if (!existingInvoice) {
          console.log("🧾 [WEBHOOK] Creating invoice for paid payment...");
          const { subtotal, vatAmount, totalAmount } =
            typeof payment.calculateVAT === "function"
              ? payment.calculateVAT()
              : { subtotal: payment.amount, vatAmount: 0, totalAmount: payment.amount };

          const invoiceDoc = await Invoice.create({
            payment: payment._id,
            user: payment.user,
            invoiceNumber: typeof payment.generateInvoiceNumber === "function" ? payment.generateInvoiceNumber() : `INV-${Date.now()}`,
            billingInfo: {},
            items: [
              {
                description: {
                  en: payment.description || `Payment: ${payment.type}`,
                  ar: payment.description || `دفع: ${payment.type}`,
                },
                quantity: 1,
                unitPrice: payment.amount,
                total: payment.amount,
              },
            ],
            subtotal,
            taxAmount: vatAmount,
            totalAmount,
            currency: payment.currency || "SAR",
            status: "paid",
            paidAt: new Date(),
          });
          console.log("✅ [WEBHOOK] Invoice created:", invoiceDoc.invoiceNumber);
        }
      } catch (error) {
        console.error("❌ [WEBHOOK] Post-payment action error:", error.message);
      }
    } else if (statusStr === "CANCELLED" || statusStr === "FAILED") {
      console.log("❌ [WEBHOOK] Payment failed/cancelled - updating status to FAILED");
      payment.status = PAYMENT_STATUS.FAILED;
    } else {
      console.log("⚠️ [WEBHOOK] Payment status unknown:", statusStr);
    }

    console.log("💾 [WEBHOOK] Saving updated payment to DB...");
    await payment.save();
    console.log("✅ [WEBHOOK] Payment updated successfully");

    const result = { ok: true, paymentId: payment._id, status: payment.status };
    console.log("📋 [WEBHOOK] Returning result:", result);
    return result;
  };

  // تأكيد يدوي بعد العودة من Paylink
  confirmTransaction = async (transactionNo, pid) => {
    console.log("🔄 [CONFIRM] Manual transaction confirmation started");
    console.log("📋 [CONFIRM] Transaction number:", transactionNo);
    console.log("📋 [CONFIRM] Payment ID (optional):", pid);

    console.log("🔄 [CONFIRM] Fetching invoice from Paylink...");
    const invoice = await this.gateway.getInvoice(transactionNo);
    console.log("📋 [CONFIRM] Paylink invoice response:", JSON.stringify(invoice, null, 2));
    
    const statusStr = String(invoice?.orderStatus || "").toUpperCase();
    console.log("📋 [CONFIRM] Payment status from Paylink:", statusStr);
    
    const isPaid = statusStr === "PAID";
    console.log("📋 [CONFIRM] Is payment completed?", isPaid);

    console.log("🔄 [CONFIRM] Finding payment in database...");
    let payment = null;
    if (pid) {
      console.log("📋 [CONFIRM] Looking for payment by ID:", pid);
      payment = await Payment.findById(pid);
    }
    if (!payment) {
      console.log("📋 [CONFIRM] Looking for payment by checkout ID:", transactionNo);
      payment = await Payment.findOne({
        "gatewayResponse.checkoutId": transactionNo,
      });
    }
    if (!payment) {
      console.log("❌ [CONFIRM] Payment not found");
      throw new ApiError(404, "Payment not found");
    }
    
    console.log("📋 [CONFIRM] Found payment in DB:", {
      id: payment._id,
      user: payment.user,
      type: payment.type,
      amount: payment.amount,
      currentStatus: payment.status
    });

    console.log("💾 [CONFIRM] Updating payment with invoice data...");
    payment.gatewayResponse = {
      ...(payment.gatewayResponse || {}),
      raw: invoice,
    };

    if (isPaid) {
      console.log("✅ [CONFIRM] Payment is completed - updating status to COMPLETED");
      payment.status = PAYMENT_STATUS.COMPLETED;

      // Post-payment actions based on type
      try {
        if (payment.type === "activate_user") {
          console.log("🔄 [CONFIRM] Activating user account...");
          await User.findByIdAndUpdate(payment.user, { isActive: true });
          console.log("✅ [CONFIRM] User account activated:", payment.user);
        }

        if (payment.type === "promote_player") {
          console.log("🔄 [CONFIRM] Attempting to activate player profile...");
          const player = await Player.findOne({ user: payment.user });
          if (player) {
            player.isActive = true;
            await player.save();
            console.log("✅ [CONFIRM] Player profile activated for user:", payment.user);
          }
        }

        // Create invoice for PAID payment (idempotent)
        const existingInvoice = await Invoice.findOne({ payment: payment._id });
        if (!existingInvoice) {
          console.log("🧾 [CONFIRM] Creating invoice for paid payment...");
          const { subtotal, vatAmount, totalAmount } =
            typeof payment.calculateVAT === "function"
              ? payment.calculateVAT()
              : { subtotal: payment.amount, vatAmount: 0, totalAmount: payment.amount };

          const invoiceDoc = await Invoice.create({
            payment: payment._id,
            user: payment.user,
            invoiceNumber: typeof payment.generateInvoiceNumber === "function" ? payment.generateInvoiceNumber() : `INV-${Date.now()}`,
            billingInfo: {},
            items: [
              {
                description: {
                  en: payment.description || `Payment: ${payment.type}`,
                  ar: payment.description || `دفع: ${payment.type}`,
                },
                quantity: 1,
                unitPrice: payment.amount,
                total: payment.amount,
              },
            ],
            subtotal,
            taxAmount: vatAmount,
            totalAmount,
            currency: payment.currency || "SAR",
            status: "paid",
            paidAt: new Date(),
          });
          console.log("✅ [CONFIRM] Invoice created:", invoiceDoc.invoiceNumber);
        }
      } catch (error) {
        console.error("❌ [CONFIRM] Post-payment action error:", error.message);
      }
    } else {
      console.log("⚠️ [CONFIRM] Payment not completed, status:", statusStr);
    }

    console.log("💾 [CONFIRM] Saving updated payment to DB...");
    await payment.save();
    console.log("✅ [CONFIRM] Payment updated successfully");

    const result = { ok: true, paymentId: payment._id, status: payment.status };
    console.log("📋 [CONFIRM] Returning result:", result);
    return result;
  };

  refundPayment = async (payment, amount) => {
    const out = await this.gateway.refundPayment(
      payment?.gatewayResponse?.transactionId,
      amount
    );
    return out;
  };
}

const paymentService = new PaymentService();
export default paymentService;
