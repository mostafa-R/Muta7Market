// src/services/payment.service.js
import axios from "axios";
import Payment from "../models/payment.model.js"; // legacy (still used by other flows)
import Player from "../models/player.model.js";
import Invoice from "../models/invoice.model.js";
import User from "../models/user.model.js";
import Entitlement from "../models/entitlement.model.js";
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
    
    const now = Date.now();
    if (this.token && now < this.tokenExp) {
      
      return this.token;
    }

    if (!this.apiId || !this.secret) {
      console.error("❌ [PAYLINK AUTH] Missing PAYLINK_API_ID or PAYLINK_SECRET env vars");
      throw new ApiError(500, "Paylink credentials are not configured");
    }

    
    const { data } = await axios.post(`${this.base}/api/auth`, {
      apiId: this.apiId,
      secretKey: this.secret,
      persistToken: true,
    });
    
    
    this.token = data?.id_token;
    if (!this.token) {
      throw new ApiError(500, "Paylink auth failed: missing token");
    }
    
    this.tokenExp = now + 29 * 60 * 60 * 1000; // 29h
    
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

    

    
    const { data } = await axios.post(`${this.base}/api/addInvoice`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    

    if (!data?.url || !data?.transactionNo) {
      throw new ApiError(500, "Invalid Paylink response");
    }

    const result = { checkoutId: data.transactionNo, checkoutUrl: data.url, raw: data };
    

    return result;
  }

  async getInvoice(transactionNo) {
    

    const token = await this._auth();
    
    
    const { data } = await axios.get(
      `${this.base}/api/getInvoice/${transactionNo}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    
    
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

  // Create checkout using Invoice centric flow
  initiatePayment = async (
    invoiceId,
    { amount, currency, description, customerEmail, returnUrl, cancelUrl }
  ) => {
    const inv = await Invoice.findById(invoiceId);
    if (!inv) throw new ApiError(404, 'Invoice not found');
    const init = await this.gateway.createCheckout({
      amount,
      currency,
      orderId: inv._id,
      description,
      customerEmail,
      returnUrl,
      cancelUrl,
    });
    return init;
  };

  // Webhook من Paylink (Invoice-centric)
  handleWebhook = async (body) => {
    const transactionNo = body?.transactionNo || body?.TransactionNo || body?.transactionID;
    if (!transactionNo) throw new ApiError(400, 'Missing transactionNo in webhook body');

    const paylinkInvoice = await this.gateway.getInvoice(transactionNo);
    const statusStr = String(paylinkInvoice?.orderStatus || paylinkInvoice?.OrderStatus || '').toUpperCase();
    const isPaid = statusStr === 'PAID' || statusStr === 'PAID PARTIALLY';

    const inv = await Invoice.findOne({ providerInvoiceId: transactionNo });
    if (!inv) throw new ApiError(404, 'Invoice not found for this transaction');

    if (isPaid) {
      if (inv.status !== 'paid') {
        await Invoice.updateOne({ _id: inv._id }, { status: 'paid', paidAt: new Date() });
        const exist = await Entitlement.findOne({ sourceInvoice: inv._id });
        if (!exist) {
          await Entitlement.create({ user: inv.user, type: inv.type, sourceInvoice: inv._id, active: true });
          if (inv.type === 'unlock_contacts') {
            await User.findByIdAndUpdate(inv.user, { isActive: true });
          }
          if (inv.type === 'publish_profile') {
            const player = await Player.findOne({ user: inv.user });
            if (player) { player.isActive = true; await player.save(); }
          }
        }
      }
    } else if (statusStr === 'CANCELLED' || statusStr === 'FAILED') {
      await Invoice.updateOne({ _id: inv._id }, { status: statusStr.toLowerCase() === 'CANCELLED'.toLowerCase() ? 'canceled' : 'failed' });
    }

    return { ok: true, invoiceId: inv._id, status: isPaid ? 'paid' : inv.status };
  };

  // تأكيد يدوي بعد العودة من Paylink
  confirmTransaction = async (transactionNo, pid) => {
    

    
    const invoice = await this.gateway.getInvoice(transactionNo);
    
    
    const statusStr = String(invoice?.orderStatus || "").toUpperCase();
    
    
    const isPaid = statusStr === "PAID";
    

    
    let payment = null;
    if (pid) {
      payment = await Payment.findById(pid);
    }
    if (!payment) {
      payment = await Payment.findOne({
        "gatewayResponse.checkoutId": transactionNo,
      });
    }
    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }
    
    

    payment.gatewayResponse = {
      ...(payment.gatewayResponse || {}),
      raw: invoice,
    };

    if (isPaid) {
      payment.status = PAYMENT_STATUS.COMPLETED;

      // Post-payment actions based on type
      try {
        if (payment.type === "activate_user") {
          await User.findByIdAndUpdate(payment.user, { isActive: true });
          
        }

        if (payment.type === "promote_player") {
          const player = await Player.findOne({ user: payment.user });
          if (player) {
            player.isActive = true;
            await player.save();
            
          }
        }

        // Create invoice for PAID payment (idempotent)
        const existingInvoice = await Invoice.findOne({ payment: payment._id });
        if (!existingInvoice) {
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
          
        }
      } catch (error) {
        console.error("❌ [CONFIRM] Post-payment action error:", error.message);
      }
    } else {
      
    }

    await payment.save();
    

    const result = { ok: true, paymentId: payment._id, status: payment.status };
    
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
