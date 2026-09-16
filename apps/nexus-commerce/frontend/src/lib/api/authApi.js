import { apiClient } from "./client";

export const authApi = {
  // 1. Password & Standard Authentication
  register: async ({ name, email, password }) => {
    const { data } = await apiClient.post("/auth/register", {
      name,
      email,
      password,
    });
    return data;
  },

  login: async ({ email, password }) => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data;
  },

  logout: async () => {
    const { data } = await apiClient.post("/auth/logout");
    return data;
  },

  getMe: async () => {
    const { data } = await apiClient.get("/auth/me");
    return data.user;
  },

  // 2. 1-Click Demo Evaluator Access
  demoLogin: async (role = "customer") => {
    const { data } = await apiClient.post("/auth/demo", { role });
    return data;
  },

  // 3. Google Workspace OAuth
  googleLogin: async (code) => {
    const { data } = await apiClient.post("/auth/google", { code });
    return data;
  },

  // 4. WebAuthn / Passkey Biometrics
  getPasskeyRegisterOptions: async ({ email, name } = {}) => {
    const { data } = await apiClient.post("/auth/passkey/register-options", {
      email,
      name,
    });
    return data.options;
  },

  verifyPasskeyRegistration: async ({ email, name, response }) => {
    const { data } = await apiClient.post("/auth/passkey/verify-registration", {
      email,
      name,
      response,
    });
    return data;
  },

  getPasskeyAuthOptions: async (email) => {
    const { data } = await apiClient.post("/auth/passkey/auth-options", {
      email,
    });
    return data.options;
  },

  verifyPasskeyAuth: async ({ email, response }) => {
    const { data } = await apiClient.post("/auth/passkey/verify-auth", {
      email,
      response,
    });
    return data;
  },

  // 5. Email Verification
  verifyEmail: async (token) => {
    const { data } = await apiClient.post("/auth/verify-email", { token });
    return data;
  },

  resendVerification: async (email) => {
    const { data } = await apiClient.post("/auth/resend-verification", {
      email,
    });
    return data;
  },

  // 6. Cryptographic Password Reset
  forgotPassword: async (email) => {
    const { data } = await apiClient.post("/auth/forgot-password", { email });
    return data;
  },

  resetPassword: async ({ token, password }) => {
    const { data } = await apiClient.post("/auth/reset-password", {
      token,
      password,
    });
    return data;
  },

  // 7. Customer Address Book Management
  getAddresses: async () => {
    const { data } = await apiClient.get("/auth/address");
    return data.addresses;
  },

  addAddress: async (addressData) => {
    const { data } = await apiClient.post("/auth/address", addressData);
    return data.addresses;
  },

  updateAddress: async (addressId, addressData) => {
    const { data } = await apiClient.patch(
      `/auth/address/${addressId}`,
      addressData,
    );
    return data.addresses;
  },

  deleteAddress: async (addressId) => {
    const { data } = await apiClient.delete(`/auth/address/${addressId}`);
    return data.addresses;
  },
};
