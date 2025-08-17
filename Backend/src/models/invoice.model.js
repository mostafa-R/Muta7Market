import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    // Keep compatibility but new flow centers invoices; payment ref optional
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    invoiceNumber: { type: String, required: true, unique: true },
    orderNumber: { type: String, unique: true, index: true },
    issueDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000) // 7 days
    },
    billingInfo: {
      name: String,
      email: String,
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: { type: String, default: 'Saudi Arabia' }
      },
      vatNumber: String
    },
    items: [
      {
        description: {
          en: String,
          ar: String
        },
        quantity: { type: Number, default: 1 },
        unitPrice: Number,
        discount: { type: Number, default: 0 },
        taxRate: { type: Number, default: 15 },
        total: Number
      }
    ],
    subtotal: Number,
    discountAmount: { type: Number, default: 0 },
    taxAmount: Number,
    totalAmount: Number,
    currency: { type: String, default: 'SAR' },
    status: { type: String, enum: ['created','pending','paid','failed','canceled','expired','issued','overdue','cancelled'], default: 'created' },
    provider: { type: String, default: 'paylink' },
    providerInvoiceId: { type: String, index: true, unique: true, sparse: true },
    paymentUrl: { type: String },
    type: { type: String, enum: ['unlock_contacts','publish_profile'] },
    zatcaCompliance: {
      qrCode: String,
      uuid: String,
      hash: String,
      counter: Number,
      previousHash: String,
      csid: String
    },
    notes: String,
    termsAndConditions: String,
    sentAt: Date,
    reminders: [
      {
        sentAt: Date,
        method: { type: String, enum: ['email', 'sms'] }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes (avoid duplicate index on invoiceNumber since it's unique on the path)
invoiceSchema.index({ user: 1, status: 1 });
invoiceSchema.index({ issueDate: -1 });

// Generate ZATCA compliant invoice
invoiceSchema.methods.generateZATCACompliantData = async function () {
  // Implementation would follow ZATCA Phase 2 requirements
  // Including digital signatures, hash chains, etc.
  const crypto = require('crypto');

  // Generate UUID
  this.zatcaCompliance.uuid = crypto.randomUUID();

  // Generate hash (simplified - real implementation would be more complex)
  const invoiceData = {
    invoiceNumber: this.invoiceNumber,
    issueDate: this.issueDate,
    totalAmount: this.totalAmount,
    taxAmount: this.taxAmount
  };

  this.zatcaCompliance.hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(invoiceData))
    .digest('hex');

  // Generate QR code data
  const qrData = {
    sellerName: process.env.COMPANY_NAME,
    vatNumber: process.env.COMPANY_VAT_NUMBER,
    timestamp: this.issueDate.toISOString(),
    totalAmount: this.totalAmount,
    vatAmount: this.taxAmount
  };

  this.zatcaCompliance.qrCode = Buffer.from(JSON.stringify(qrData)).toString(
    'base64'
  );

  return this.save();
};

// Check if invoice is overdue
invoiceSchema.methods.checkOverdue = function () {
  if (this.status === 'paid' || this.status === 'cancelled') {
    return false;
  }

  if (new Date() > this.dueDate) {
    this.status = 'overdue';
    return true;
  }

  return false;
};

export default mongoose.model('Invoice', invoiceSchema);
