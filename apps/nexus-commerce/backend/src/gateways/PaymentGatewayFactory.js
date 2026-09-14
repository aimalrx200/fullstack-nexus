import { StripeAdapter } from "./StripeAdapter.js";
import { JazzCashAdapter } from "./JazzCashAdapter.js";
import { EasypaisaAdapter } from "./EasypaisaAdapter.js";
import { CODAdapter } from "./CODAdapter.js";

const adapters = {
  stripe: new StripeAdapter(),
  jazzcash: new JazzCashAdapter(),
  easypaisa: new EasypaisaAdapter(),
  cod: new CODAdapter(),
};

export class PaymentGatewayFactory {
  /**
   * Resolves and returns the target payment gateway adapter instance.
   * @param {string} gatewayName - 'stripe' | 'jazzcash' | 'easypaisa' | 'cod'
   * @returns {PaymentGatewayInterface}
   */
  static getAdapter(gatewayName) {
    const cleanKey = gatewayName?.trim().toLowerCase();
    const adapter = adapters[cleanKey];

    if (!adapter) {
      throw new Error(
        `Unsupported payment gateway: '${gatewayName}'. Expected one of: stripe, jazzcash, easypaisa, cod.`,
      );
    }

    return adapter;
  }
}
