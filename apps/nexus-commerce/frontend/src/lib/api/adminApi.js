import apiClient from "./client";

export const adminApi = {
  // 1. Analytics & Metrics
  getDashboardAnalytics: async () => {
    const { data } = await apiClient.get("/admin/analytics");
    return data;
  },

  // 2. Customer Directory with DB-Computed Lifetime Value
  getCustomers: async (params = {}) => {
    const { data } = await apiClient.get("/admin/customers", { params });
    return data;
  },

  // 3. Inventory Matrix & Stock Overrides
  getInventory: async (params = {}) => {
    const { data } = await apiClient.get("/admin/inventory", { params });
    return data;
  },

  getLowStockAlerts: async () => {
    const { data } = await apiClient.get("/admin/inventory/low-stock");
    return data;
  },

  updateStockOverride: async (variantId, payload) => {
    const { data } = await apiClient.patch(
      `/admin/inventory/${variantId}/stock`,
      payload,
    );
    return data;
  },

  // 4. Order Fulfillment FSM & Couriers
  getAllOrders: async (params = {}) => {
    const { data } = await apiClient.get("/admin/orders", { params });
    return data;
  },

  updateFulfillmentStatus: async (orderId, { status, note }) => {
    const { data } = await apiClient.patch(`/admin/orders/${orderId}/status`, {
      status,
      note,
    });
    return data.order;
  },

  assignCourierTracking: async (orderId, courierPayload) => {
    const { data } = await apiClient.patch(
      `/admin/orders/${orderId}/courier`,
      courierPayload,
    );
    return data.order;
  },

  simulateCourierDelivery: async (orderId) => {
    const { data } = await apiClient.post(
      `/admin/orders/${orderId}/simulate-delivery`,
    );
    return data;
  },

  // 5. Promotional Coupons CRUD
  getCoupons: async (params = {}) => {
    const { data } = await apiClient.get("/admin/coupons", { params });
    return data;
  },

  createCoupon: async (couponPayload) => {
    const { data } = await apiClient.post("/admin/coupons", couponPayload);
    return data.coupon;
  },

  updateCoupon: async (couponId, couponPayload) => {
    const { data } = await apiClient.patch(
      `/admin/coupons/${couponId}`,
      couponPayload,
    );
    return data.coupon;
  },

  deleteCoupon: async (couponId) => {
    const { data } = await apiClient.delete(`/admin/coupons/${couponId}`);
    return data;
  },

  // 6. Payment Transaction Ledger & Refunds
  getTransactions: async (params = {}) => {
    const { data } = await apiClient.get("/payments/transactions", { params });
    return data;
  },

  processRefund: async (refundPayload) => {
    const { data } = await apiClient.post("/payments/refund", refundPayload);
    return data;
  },
};
