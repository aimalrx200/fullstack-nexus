export const ROUTES = {
  HOME: "/",
  CATALOG: "/catalog",
  PRODUCT_DETAIL: "/product/:slugOrId",
  CHECKOUT: "/checkout",
  ORDER_TRACKING: "/orders/track/:orderId",
  ACCOUNT: "/account",

  // Auth Routes
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",

  // Admin Operations Routes
  ADMIN_DASHBOARD: "/admin",
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_INVENTORY: "/admin/inventory",
  ADMIN_COUPONS: "/admin/coupons",
  ADMIN_CUSTOMERS: "/admin/customers",
  ADMIN_SUPPORT: "/admin/support",
};
