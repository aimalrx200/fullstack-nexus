/**
 * Global Frontend Constants & LocalStorage Keys
 */

export const STORAGE_KEYS = {
  THEME: "nexus_theme",
  CURRENCY: "nexus_currency",
  GUEST_SESSION_ID: "nexus_guest_session_id",
  CLIENT_INSTANCE_ID: "nexus_client_instance_id",
};

export const THEMES = {
  DARK: "dark",
  LIGHT: "light",
  SYSTEM: "system",
};

export const CURRENCIES = {
  USD: "USD",
  PKR: "PKR",
};

export const DEFAULT_CURRENCY = CURRENCIES.USD;
export const DEFAULT_USD_TO_PKR_RATE = 280.0;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PRODUCTS_LIMIT: 12,
  DEFAULT_ORDERS_LIMIT: 10,
  DEFAULT_ADMIN_LIMIT: 15,
};

export const QUERY_STALE_TIMES = {
  STATIC_CATALOG: 5 * 60 * 1000, // 5 minutes
  DYNAMIC_CART: 0, // Real-time
  FX_RATES: 30 * 60 * 1000, // 30 minutes
  USER_PROFILE: 10 * 60 * 1000, // 10 minutes
  ADMIN_ANALYTICS: 60 * 1000, // 1 minute
};

export const AUTH_CHANNELS = {
  CROSS_TAB: "nexus_auth_channel",
};
