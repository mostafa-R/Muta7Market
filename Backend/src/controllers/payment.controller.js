import coachService from '../services/coach.service.js';
import offerService from '../services/offer.service.js';
import paymentService from '../services/payment.service.js';
import playerService from '../services/player.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const initiatePayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.body;

  const paymentUrl = await paymentService.initiatePayment(paymentId);

  res
    .status(200)
    .json(
      new ApiResponse(200, { paymentUrl }, 'Payment initiated successfully')
    );
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await paymentService.verifyPayment(paymentId);

  if (payment.status === 'completed') {
    // Process post-payment actions based on payment type
    switch (payment.type) {
    case 'add_offer':
    case 'promote_offer':
    case 'unlock_contact':
      await offerService.handlePaymentSuccess(payment._id);
      break;
    case 'promote_player':
      await playerService.handlePromotionPayment(payment._id);
      break;
    case 'promote_coach':
      await coachService.handlePromotionPayment(payment._id);
      break;
    }
  }

  res
    .status(200)
    .json(new ApiResponse(200, { payment }, 'Payment verified successfully'));
});

export const handleWebhook = asyncHandler(async (req, res) => {
  const result = await paymentService.handleWebhook(req.body);

  res
    .status(200)
    .json(new ApiResponse(200, result, 'Webhook processed successfully'));
});

export const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await paymentService.getPaymentHistory(
    req.user.id,
    req.query
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { payments },
        'Payment history retrieved successfully'
      )
    );
});

export const requestRefund = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { reason } = req.body;

  const payment = await paymentService.refundPayment(paymentId, reason);

  res
    .status(200)
    .json(new ApiResponse(200, { payment }, 'Refund processed successfully'));
});

export const getInvoice = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;

  const invoice = await paymentService.getInvoice(invoiceId, req.user.id);

  res
    .status(200)
    .json(new ApiResponse(200, { invoice }, 'Invoice retrieved successfully'));
});

export const downloadInvoice = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;

  const pdfBuffer = await paymentService.generateInvoicePDF(
    invoiceId,
    req.user.id
  );

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="invoice-${invoiceId}.pdf"`
  });

  res.send(pdfBuffer);
});
