// apps/nexus-commerce/backend/src/gateways/StripeAdapter.js

import Stripe from "stripe";
import { PaymentGatewayInterface } from "./PaymentGateway.interface.js";
import env from "#config/env.js";
import currency from "currency.js";
import { logger } from "#config/logger.js";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: false,
});

export class StripeAdapter extends PaymentGatewayInterface {
  /**
   * Initiates payment with Stripe by creating a PaymentIntent.
   */
  async initiatePayment({ order, idempotencyKey }) {
    if (
      !env.STRIPE_SECRET_KEY ||
      env.STRIPE_SECRET_KEY === "sk_test_placeholder_key"
    ) {
      logger.warn({
        msg: "Stripe running with test placeholder keys (Set STRIPE_SECRET_KEY in .env for live test API)",
      });
    }

    // Precise integer cents calculation (e.g. $14.99 -> 1499 cents)
    const amountInCents = currency(order.pricing.total).multiply(100).value;

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(amountInCents),
        currency: order.pricing.currency.toLowerCase(),
        description: `Nexus Commerce Order #${order.orderNumber}`,
        receipt_email: order.customerEmail,
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          customerPhone: order.customerPhone || "",
        },
        automatic_payment_methods: { enabled: true },
      },
      idempotencyKey
        ? { idempotencyKey: `stripe_${idempotencyKey}` }
        : undefined,
    );

    return {
      success: true,
      gateway: "stripe",
      clientSecret: paymentIntent.client_secret,
      transactionId: paymentIntent.id,
      status: paymentIntent.status === "succeeded" ? "paid" : "initiated",
      message:
        "Stripe PaymentIntent created. Complete 3D-Secure payment on client.",
    };
  }

  /**
   * Cryptographically verifies inbound Stripe webhook events.
   * Supports legitimate Stripe CLI signatures and dev mock fallbacks.
   */
  async verifyWebhook(rawBodyBuffer, signatureHeader) {
    const isDev = env.NODE_ENV !== "production";
    const isPlaceholderSecret =
      !env.STRIPE_WEBHOOK_SECRET ||
      env.STRIPE_WEBHOOK_SECRET === "whsec_placeholder_webhook_secret";

    // ⚡ Dev/Test Mock Support: If using mock signature or placeholder secret in development
    if (
      isDev &&
      (isPlaceholderSecret || signatureHeader?.includes("mock_signature"))
    ) {
      logger.warn({
        msg: "⚠️ Stripe webhook verified via development mock fallback (Placeholder or mock signature detected)",
      });

      if (Buffer.isBuffer(rawBodyBuffer)) {
        return JSON.parse(rawBodyBuffer.toString("utf8"));
      } else if (typeof rawBodyBuffer === "string") {
        return JSON.parse(rawBodyBuffer);
      }
      return rawBodyBuffer;
    }

    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new Error(
        "STRIPE_WEBHOOK_SECRET is not configured in server environment.",
      );
    }

    if (!signatureHeader) {
      throw new Error("Missing stripe-signature header.");
    }

    // Cryptographic validation using official Stripe SDK
    return stripe.webhooks.constructEvent(
      rawBodyBuffer,
      signatureHeader,
      env.STRIPE_WEBHOOK_SECRET,
    );
  }

  /**
   * Processes a refund back to the customer's card.
   */
  async processRefund(transactionId, amount, reason = "requested_by_customer") {
    const amountInCents = currency(amount).multiply(100).value;

    const refund = await stripe.refunds.create({
      payment_intent: transactionId,
      amount: Math.round(amountInCents),
      reason: reason === "fraudulent" ? "fraudulent" : "requested_by_customer",
    });

    return {
      success: true,
      refundId: refund.id,
      amountRefunded: currency(refund.amount).divide(100).value,
      status: refund.status,
    };
  }
}
