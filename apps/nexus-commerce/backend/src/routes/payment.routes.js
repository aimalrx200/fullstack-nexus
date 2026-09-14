import { Router } from "express";
import express from "express";
import {
  retryPayment,
  processRefund,
  getTransactionHistory,
} from "#controllers/payments/payment.controller.js";
import {
  handleStripeWebhook,
  handleJazzCashCallback,
  handleEasypaisaCallback,
} from "#controllers/payments/webhook.controller.js";
import { authMiddleware } from "#middlewares/authMiddleware.js";
import { adminMiddleware } from "#middlewares/adminMiddleware.js";
import { enforceIdempotency } from "#middlewares/idempotency.js";
import { validate } from "#middlewares/validate.js";
import {
  RetryPaymentSchema,
  RefundPaymentSchema,
} from "#validations/payment.validation.js";

const router = Router();

// Multi-Gateway Payment Retry
router.post(
  "/retry",
  enforceIdempotency,
  validate(RetryPaymentSchema),
  retryPayment,
);

// Merchant Refund & Transaction Ledger
router.post(
  "/refund",
  authMiddleware,
  adminMiddleware,
  validate(RefundPaymentSchema),
  processRefund,
);
router.get(
  "/transactions",
  authMiddleware,
  adminMiddleware,
  getTransactionHistory,
);

// Inbound Gateway Webhooks & IPN Listeners
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);
router.post(
  "/jazzcash/callback",
  express.urlencoded({ extended: true }),
  handleJazzCashCallback,
);
router.post(
  "/easypaisa/callback",
  express.urlencoded({ extended: true }),
  handleEasypaisaCallback,
);

export default router;
