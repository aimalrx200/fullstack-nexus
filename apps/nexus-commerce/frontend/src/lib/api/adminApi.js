// apps/nexus-commerce/frontend/src/lib/api/adminApi.js

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

  // 4. Product & SKU Variant Creation (NEW)
  createProduct: async (formData) => {
    const { data } = await apiClient.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data.product;
  },

  createVariant: async (variantPayload) => {
    const { data } = await apiClient.post("/products/variants", variantPayload);
    return data.variant;
  },

  updateProduct: async (productId, payload) => {
    const { data } = await apiClient.patch(`/products/${productId}`, payload);
    return data.product;
  },

  archiveProduct: async (productId) => {
    const { data } = await apiClient.delete(`/products/${productId}`);
    return data;
  },

  // 5. Order Fulfillment FSM & Couriers
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

  // 6. Promotional Coupons CRUD
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

  // 7. Payment Transaction Ledger & Refunds
  getTransactions: async (params = {}) => {
    const { data } = await apiClient.get("/payments/transactions", { params });
    return data;
  },

  processRefund: async (refundPayload) => {
    const { data } = await apiClient.post("/payments/refund", refundPayload);
    return data;
  },

  // Media & Video Management
  getMediaUploadSignature: async (
    folder = "nexus-commerce/products/videos",
  ) => {
    const { data } = await apiClient.get("/media/upload-signature", {
      params: { folder },
    });
    return data;
  },

  uploadVideo: async (file, onProgress) => {
    // 1. Fetch upload signature from backend
    const { data: sigData } = await apiClient.get("/media/upload-signature");

    // 2. Production: Direct Cloudinary Upload (Bypasses Vercel 4.5MB limit)
    if (sigData.provider === "cloudinary") {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", sigData.timestamp);
      formData.append("signature", sigData.signature);
      formData.append("folder", sigData.folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/video/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Failed to upload video to media CDN.");
      }

      const result = await response.json();

      // Auto-generate thumbnail poster URL from second 1 of video
      const thumbnailUrl = result.secure_url.replace(/\.[^.]+$/, ".jpg?so_1.0");

      return {
        url: result.secure_url,
        publicId: result.public_id,
        thumbnailUrl,
      };
    }

    // 3. Local Development: Stream to Backend /uploads/products/videos
    const formData = new FormData();
    formData.append("video", file);

    const { data } = await apiClient.post("/media/upload-video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          onProgress(
            Math.round((progressEvent.loaded * 100) / progressEvent.total),
          );
        }
      },
    });

    return data.video;
  },
};
