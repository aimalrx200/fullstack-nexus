import apiClient from "./client";

export const checkoutApi = {
  holdInventory: async ({ items, sessionId, cartId }) => {
    const { data } = await apiClient.post("/checkout/hold", {
      items,
      sessionId,
      cartId,
    });
    return data;
  },

  getShippingQuote: async ({
    destinationAddress,
    destinationCity,
    destinationCoordinates,
  }) => {
    const { data } = await apiClient.post("/checkout/shipping-quote", {
      destinationAddress,
      destinationCity,
      destinationCoordinates,
    });
    return data.quote;
  },
};
