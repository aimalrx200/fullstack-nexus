import apiClient from "./client";

const GUEST_STORAGE_KEY = "nexus_guest_session_id";

export const getGuestSessionId = () => {
  if (typeof window === "undefined") return null;
  let sessionId = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(GUEST_STORAGE_KEY, sessionId);
  }
  return sessionId;
};

const getGuestHeaders = () => {
  const sessionId = getGuestSessionId();
  return sessionId ? { "x-guest-session-id": sessionId } : {};
};

const handleSessionResponse = (data) => {
  if (data?.guestSessionId && typeof window !== "undefined") {
    localStorage.setItem(GUEST_STORAGE_KEY, data.guestSessionId);
  }
  return data;
};

export const cartApi = {
  getCart: async () => {
    const { data } = await apiClient.get("/cart", {
      headers: getGuestHeaders(),
    });
    return handleSessionResponse(data);
  },

  addToCart: async ({ variantId, quantity = 1 }) => {
    const { data } = await apiClient.post(
      "/cart/add",
      { variantId, quantity, guestSessionId: getGuestSessionId() },
      { headers: getGuestHeaders() },
    );
    return handleSessionResponse(data);
  },

  updateQuantity: async ({ variantId, quantity }) => {
    const { data } = await apiClient.patch(
      `/cart/items/${variantId}`,
      { quantity },
      { headers: getGuestHeaders() },
    );
    return handleSessionResponse(data);
  },

  removeFromCart: async (variantId) => {
    const { data } = await apiClient.delete(`/cart/items/${variantId}`, {
      headers: getGuestHeaders(),
    });
    return handleSessionResponse(data);
  },

  applyCoupon: async (code) => {
    const { data } = await apiClient.post(
      "/cart/coupon",
      { code },
      { headers: getGuestHeaders() },
    );
    return handleSessionResponse(data);
  },

  mergeGuestCart: async (guestSessionId) => {
    const targetSessionId = guestSessionId || getGuestSessionId();
    const { data } = await apiClient.post("/cart/merge", {
      guestSessionId: targetSessionId,
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    }
    return data;
  },
};
