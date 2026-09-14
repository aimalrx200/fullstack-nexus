import Stripe from "stripe";
import { PaymentGatewayInterface } from "./PaymentGateway.interface.js";
import env from "#config/env.js";
import currency from "currency.js";
import { logger } from "#config/logger.js";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-08-26.dahlia",
  typescript: false,
});

export class StripeAdapter extends PaymentGatewayInterface {
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
          customerPhone: order.customerPhone,
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

  async verifyWebhook(rawBodyBuffer, signatureHeader) {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new Error(
        "STRIPE_WEBHOOK_SECRET is not configured in server environment.",
      );
    }

    return stripe.webhooks.constructEvent(
      rawBodyBuffer,
      signatureHeader,
      env.STRIPE_WEBHOOK_SECRET,
    );
  }

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
