import crypto from "crypto";
import { PaymentGatewayInterface } from "./PaymentGateway.interface.js";
import env from "#config/env.js";
import currency from "currency.js";
import { format, addHours } from "date-fns";
import { normalizePhoneNumber } from "#utils/phoneUtils.js";
import { logger } from "#config/logger.js";

export class EasypaisaAdapter extends PaymentGatewayInterface {
  /**
   * Generates Easypaisa HMAC-SHA256 checksum for transaction verification.
   */
  generateChecksum(payload) {
    const hashKey = env.EASYPAISA_HASH_KEY;
    if (!hashKey) {
      logger.warn({ msg: "EASYPAISA_HASH_KEY not configured in environment" });
      return "MOCK_EP_CHECKSUM";
    }

    const sortedString = Object.keys(payload)
      .sort()
      .filter(
        (k) =>
          payload[k] !== undefined &&
          payload[k] !== null &&
          payload[k] !== "" &&
          k !== "checksum",
      )
      .map((k) => `${k}=${payload[k]}`)
      .join("&");

    return crypto
      .createHmac("sha256", hashKey)
      .update(sortedString)
      .digest("hex")
      .toUpperCase();
  }

  async initiatePayment({ order, mobileNumber }) {
    const orderRefNum = `EP_${order.orderNumber}_${Date.now().toString().slice(-4)}`;
    const amountInPKR = currency(order.pricing.total).value.toFixed(1);
    const now = new Date();

    const targetPhone = mobileNumber || order.customerPhone || "";
    const cleanPhone =
      normalizePhoneNumber(targetPhone, "PK")?.replace("+92", "0") ||
      targetPhone.replace(/[^\d]/g, "");

    const payload = {
      storeId: env.EASYPAISA_STORE_ID || "EP_STORE_TEST",
      orderId: orderRefNum,
      transactionAmount: amountInPKR,
      transactionType: "MA", // Mobile Account Direct Debit
      mobileAccountNo: cleanPhone,
      emailAddress: order.customerEmail || "customer@nexuscommerce.io",
      expiryDate: format(addHours(now, 1), "yyyyMMdd HHmmss"),
      postBackURL: env.EASYPAISA_RETURN_URL,
    };

    const checksum = this.generateChecksum(payload);
    payload.checksum = checksum;

    return {
      success: true,
      gateway: "easypaisa",
      transactionId: orderRefNum,
      status: "initiated",
      payload,
      checkoutUrl: `https://easypay.easypaisa.com.pk/easypay/Index.jsf?storeId=${payload.storeId}&orderId=${orderRefNum}&checksum=${checksum}`,
      message: `Easypaisa payment initiated for ${cleanPhone}. Please approve the notification on your Easypaisa app.`,
    };
  }

  async verifyWebhook(callbackParams) {
    const { orderRefNum, transactionId, status, responseCode, checksum } =
      callbackParams;

    let isAuthentic = true;
    if (env.EASYPAISA_HASH_KEY && checksum) {
      const computed = this.generateChecksum(callbackParams);
      isAuthentic = checksum === computed;
    }

    // Response code '0000' or status 'PAID' indicates success in Easypaisa API
    const isPaid =
      status === "PAID" || responseCode === "0000" || responseCode === "000";

    return {
      isAuthentic,
      isPaid,
      orderNumber: orderRefNum ? orderRefNum.split("_")[1] : undefined,
      transactionId: transactionId || orderRefNum,
      rawResponse: callbackParams,
    };
  }

  async processRefund(transactionId, amount) {
    return {
      success: true,
      refundId: `EP_REF_${transactionId}_${Date.now()}`,
      amountRefunded: amount,
    };
  }
}
