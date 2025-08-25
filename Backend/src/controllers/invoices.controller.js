const Invoice = require("../models/invoice.model");

async function listMyInvoices(req, res) {
  const userId = req.user._id;
  console.log("[InvoicesController][listMyInvoices] start", {
    userId: String(userId),
    status: req.query.status || null,
    page: req.query.page || 1,
    pageSize: req.query.pageSize || 20,
  });
  const status = req.query.status; // optional: pending | paid | ...
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.max(1, Number(req.query.pageSize || 20));
  const skip = (page - 1) * pageSize;

  const q = { userId };
  if (status) q.status = status;

  const [items, total] = await Promise.all([
    Invoice.find(q).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    Invoice.countDocuments(q),
  ]);
  console.log("[InvoicesController][listMyInvoices] fetched", {
    total,
    itemsReturned: items.length,
  });
  res.json({
    total,
    page,
    pageSize,
    items: items.map((inv) => ({
      id: String(inv._id),
      createdAt: inv.createdAt,
      product: inv.product,
      amount: inv.amount,
      currency: inv.currency,
      status: inv.status,
      paymentUrl: inv.status === "pending" ? inv.paymentUrl : null,
      receiptUrl: inv.paymentReceiptUrl || null,
      orderNumber: inv.orderNumber,
      playerProfileId: inv.playerProfileId,
      paidAt: inv.paidAt,
    })),
  });
}

async function getInvoice(req, res) {
  const userId = req.user._id;
  const id = req.params.id;
  console.log("[InvoicesController][getInvoice] start", {
    userId: String(userId),
    id,
  });
  const inv = await Invoice.findOne({ _id: id, userId });
  if (!inv) return res.status(404).json({ error: "not_found" });
  console.log("[InvoicesController][getInvoice] found", {
    id: String(inv._id),
    status: inv.status,
  });
  res.json({
    id: String(inv._id),
    createdAt: inv.createdAt,
    product: inv.product,
    amount: inv.amount,
    currency: inv.currency,
    status: inv.status,
    paymentUrl: inv.status === "pending" ? inv.paymentUrl : null,
    receiptUrl: inv.paymentReceiptUrl || null,
    orderNumber: inv.orderNumber,
    playerProfileId: inv.playerProfileId,
    paidAt: inv.paidAt,
  });
}

module.exports = { listMyInvoices, getInvoice };
