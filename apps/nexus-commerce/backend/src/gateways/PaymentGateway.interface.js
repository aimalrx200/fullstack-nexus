export class PaymentGatewayInterface {
  /**
   * Initiates payment with the upstream gateway.
   * @param {Object} params - { order, mobileNumber, idempotencyKey, callbackUrl }
   * @returns {Promise<{ success: boolean, gateway: string, transactionId: string, status: string, payload?: Object, checkoutUrl?: string, clientSecret?: string, message?: string }>}
   */
  async initiatePayment() {
    throw new Error(
      "Method 'initiatePayment()' must be implemented by gateway adapter.",
    );
  }

  /**
   * Cryptographically verifies inbound webhook/IPN callbacks.
   * @param {Object|Buffer} rawPayload - Raw request buffer or parsed parameters
   * @param {string} [signature] - Signature header (e.g. stripe-signature)
   * @returns {Promise<{ isAuthentic: boolean, isPaid: boolean, orderNumber?: string, transactionId?: string, rawResponse?: Object }>}
   */
  async verifyWebhook() {
    throw new Error(
      "Method 'verifyWebhook()' must be implemented by gateway adapter.",
    );
  }

  /**
   * Processes a refund back to customer.
   * @param {string} transactionId - Upstream gateway transaction ID
   * @param {number} amount - Amount to refund
   * @param {string} [reason] - Reason for refund
   * @returns {Promise<{ success: boolean, refundId: string, amountRefunded: number }>}
   */
  async processRefund() {
    throw new Error(
      "Method 'processRefund()' must be implemented by gateway adapter.",
    );
  }
}
