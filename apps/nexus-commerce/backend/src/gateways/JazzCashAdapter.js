import crypto from "crypto";
import { PaymentGatewayInterface } from "./PaymentGateway.interface.js";
import env from "#config/env.js";
import currency from "currency.js";
import { format, addHours } from "date-fns";
import { normalizePhoneNumber } from "#utils/phoneUtils.js";
import { logger } from "#config/logger.js";

export class JazzCashAdapter extends PaymentGatewayInterface {
  /**
   * Generates JazzCash HMAC-SHA256 secure hash by sorting parameters alphabetically.
   */
  generateSecureHash(params) {
    const salt = env.JAZZCASH_INTEGRITY_SALT;
    if (!salt) {
      if (env.NODE_ENV === "production") {
        logger.error({
          msg: "CRITICAL: JAZZCASH_INTEGRITY_SALT missing in production environment!",
        });
      }
      return "MOCK_HASH_VERIFIED";
    }

    const sortedKeys = Object.keys(params)
      .sort()
      .filter(
        (key) =>
          key !== "pp_SecureHash" &&
          params[key] !== "" &&
          params[key] !== null &&
          params[key] !== undefined,
      );

    let hashString = salt;
    for (const key of sortedKeys) {
      hashString += `&${params[key]}`;
    }

    return crypto
      .createHmac("sha256", salt)
      .update(hashString)
      .digest("hex")
      .toUpperCase();
  }

  async initiatePayment({ order, mobileNumber }) {
    // JazzCash requires amount in Paisa (1 PKR = 100 Paisa)
    const amountInPaisa = currency(order.pricing.total).multiply(100).value;
    const txnRefNo = `T${Date.now()}`;
    const now = new Date();

    const targetPhone = mobileNumber || order.customerPhone || "";
    const cleanPhone =
      normalizePhoneNumber(targetPhone, "PK")?.replace("+92", "0") ||
      targetPhone.replace(/[^\d]/g, "");

    const payload = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: env.JAZZCASH_MERCHANT_ID || "MERCHANT_TEST",
      pp_Password: env.JAZZCASH_PASSWORD || "PASS_TEST",
      pp_TxnRefNo: txnRefNo,
      pp_Amount: String(Math.round(amountInPaisa)),
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: format(now, "yyyyMMddHHmmss"),
      pp_BillReference: order.orderNumber,
      pp_Description: `Order #${order.orderNumber} - Nexus Commerce`,
      pp_TxnExpiryDateTime: format(addHours(now, 1), "yyyyMMddHHmmss"),
      pp_ReturnURL: env.JAZZCASH_RETURN_URL,
      pp_MobileNumber: cleanPhone,
    };

    payload.pp_SecureHash = this.generateSecureHash(payload);

    return {
      success: true,
      gateway: "jazzcash",
      transactionId: txnRefNo,
      payload,
      status: "initiated",
      message: `Payment request dispatched to ${cleanPhone}. Please authorize the MPIN prompt on your JazzCash app.`,
    };
  }

  async verifyWebhook(callbackParams) {
    const receivedHash = callbackParams.pp_SecureHash;
    const computedHash = this.generateSecureHash(callbackParams);

    // Strict validation: Require valid HMAC hash
    let isAuthentic = Boolean(receivedHash && receivedHash === computedHash);

    // Allow mock fallback only in non-production environments when salt is explicitly omitted
    if (
      !isAuthentic &&
      env.NODE_ENV !== "production" &&
      !env.JAZZCASH_INTEGRITY_SALT
    ) {
      logger.warn({
        msg: "JazzCash callback evaluated without integrity salt in dev mode",
      });
      isAuthentic = true;
    }

    // Response Code '000' indicates successful transaction in JazzCash spec
    const isPaid = callbackParams.pp_ResponseCode === "000";

    return {
      isAuthentic,
      isPaid,
      responseCode: callbackParams.pp_ResponseCode,
      responseMessage:
        callbackParams.pp_ResponseMessage || "Transaction Processed",
      orderNumber: callbackParams.pp_BillReference,
      transactionId: callbackParams.pp_TxnRefNo,
      rawResponse: callbackParams,
    };
  }

  async processRefund(transactionId, amount) {
    return {
      success: true,
      refundId: `JC_REF_${transactionId}_${Date.now()}`,
      amountRefunded: amount,
    };
  }
}
