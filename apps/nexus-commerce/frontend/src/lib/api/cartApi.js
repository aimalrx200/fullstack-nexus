import apiClient from "./client";

export const cartApi = {
  getCart: async () => {
    const { data } = await apiClient.get("/cart");
    return data;
  },

  addToCart: async ({ variantId, quantity = 1 }) => {
    const { data } = await apiClient.post("/cart/add", {
      variantId,
      quantity,
    });
    return data;
  },

  updateQuantity: async ({ variantId, quantity }) => {
    const { data } = await apiClient.patch(`/cart/items/${variantId}`, {
      quantity,
    });
    return data;
  },

  removeFromCart: async (variantId) => {
    const { data } = await apiClient.delete(`/cart/items/${variantId}`);
    return data;
  },

  applyCoupon: async (code) => {
    const { data } = await apiClient.post("/cart/coupon", { code });
    return data;
  },

  mergeGuestCart: async (guestSessionId) => {
    const { data } = await apiClient.post("/cart/merge", { guestSessionId });
    return data;
  },
};
