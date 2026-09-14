import { PaymentGatewayInterface } from "./PaymentGateway.interface.js";
import { isPhoneValid, normalizePhoneNumber } from "#utils/phoneUtils.js";

export class CODAdapter extends PaymentGatewayInterface {
  async initiatePayment({ order }) {
    const rawPhone = order.customerPhone || "";
    const countryCode = order.shippingAddress?.countryCode || "PK";

    // 1. Strict International Phone Validation via libphonenumber-js
    const isValidPhone = isPhoneValid(rawPhone, countryCode);
    const normalizedPhone = normalizePhoneNumber(rawPhone, countryCode);

    // 2. Anti-Fraud Risk Scoring Matrix
    const isAddressComplete = Boolean(
      order.shippingAddress?.street?.length >= 5 &&
      order.shippingAddress?.city &&
      order.shippingAddress?.recipientName,
    );

    const riskScore = !isValidPhone
      ? "HIGH"
      : !isAddressComplete
        ? "MEDIUM"
        : "LOW";

    return {
      success: true,
      gateway: "cod",
      transactionId: `COD_${order.orderNumber}_${Date.now().toString().slice(-4)}`,
      status: "initiated",
      riskAssessment: {
        riskScore,
        phoneVerified: isValidPhone,
        normalizedPhone,
        addressVerified: isAddressComplete,
        collectableAmount: order.pricing.total,
        currency: order.pricing.currency,
      },
      message:
        "Cash on Delivery booking confirmed. Full payment will be collected by the courier upon physical delivery.",
    };
  }

  async verifyWebhook() {
    return { isAuthentic: true, isPaid: false };
  }

  async processRefund(transactionId, amount) {
    return {
      success: true,
      refundId: `COD_CANC_${transactionId}`,
      amountRefunded: amount,
    };
  }
}
