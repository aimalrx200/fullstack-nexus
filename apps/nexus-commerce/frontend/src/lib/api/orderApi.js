import apiClient from "./client";

export const orderApi = {
  createOrder: async (orderPayload, idempotencyKey) => {
    const headers = idempotencyKey
      ? { "x-idempotency-key": idempotencyKey }
      : {};
    const { data } = await apiClient.post("/orders", orderPayload, { headers });
    return data;
  },

  getOrderById: async (orderId, email = "") => {
    const headers = email ? { "x-customer-email": email } : {};
    const params = email ? { email } : {};
    const { data } = await apiClient.get(`/orders/${orderId}`, {
      headers,
      params,
    });
    return data.order;
  },

  getCustomerOrders: async (params = {}) => {
    const { data } = await apiClient.get("/orders/my-orders", { params });
    return data;
  },

  retryPayment: async (retryPayload) => {
    const { data } = await apiClient.post("/payments/retry", retryPayload);
    return data;
  },

  simulateDelivery: async (orderId) => {
    const { data } = await apiClient.post(
      `/admin/orders/${orderId}/simulate-delivery`,
    );
    return data;
  },
};
