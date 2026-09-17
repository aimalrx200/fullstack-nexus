import apiClient from "./client";

export const productApi = {
  getProducts: async (params = {}) => {
    const { data } = await apiClient.get("/products", { params });
    return data;
  },

  getProductBySlug: async (slug) => {
    const { data } = await apiClient.get(`/products/${slug}`);
    return data;
  },

  getProductById: async (productId) => {
    const { data } = await apiClient.get(`/products/id/${productId}`);
    return data;
  },

  getExchangeRates: async () => {
    const { data } = await apiClient.get("/products/rates");
    return data;
  },
};
