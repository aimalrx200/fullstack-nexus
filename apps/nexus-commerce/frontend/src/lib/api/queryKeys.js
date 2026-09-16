/**
 * Centralized TanStack Query Key Factory
 * Eliminates magic strings and provides type-safe query cache invalidation.
 */

export const queryKeys = {
  // 1. Authentication & Profile
  auth: {
    all: ["auth"],
    me: () => [...queryKeys.auth.all, "me"],
    addresses: () => [...queryKeys.auth.all, "addresses"],
  },

  // 2. Product Catalog & Variants
  products: {
    all: ["products"],
    list: (filters = {}) => [...queryKeys.products.all, "list", filters],
    detail: (slugOrId) => [...queryKeys.products.all, "detail", slugOrId],
    rates: () => [...queryKeys.products.all, "rates"],
  },

  // 3. Shopping Cart
  cart: {
    all: ["cart"],
    current: () => [...queryKeys.cart.all, "current"],
  },

  // 4. Customer Orders
  orders: {
    all: ["orders"],
    customerList: (params = {}) => [
      ...queryKeys.orders.all,
      "customer",
      params,
    ],
    detail: (orderId, email = "") => [
      ...queryKeys.orders.all,
      "detail",
      orderId,
      { email },
    ],
  },

  // 5. Merchant Admin Control Center
  admin: {
    all: ["admin"],
    analytics: () => [...queryKeys.admin.all, "analytics"],
    orders: (params = {}) => [...queryKeys.admin.all, "orders", params],
    inventory: (params = {}) => [...queryKeys.admin.all, "inventory", params],
    lowStock: () => [...queryKeys.admin.all, "inventory", "lowStock"],
    customers: (params = {}) => [...queryKeys.admin.all, "customers", params],
    coupons: (params = {}) => [...queryKeys.admin.all, "coupons", params],
    transactions: (params = {}) => [
      ...queryKeys.admin.all,
      "transactions",
      params,
    ],
  },

  // 6. Customer Support & Tickets
  support: {
    all: ["support"],
    conversation: (guestSessionId = "") => [
      ...queryKeys.support.all,
      "conversation",
      guestSessionId,
    ],
    adminConversations: (params = {}) => [
      ...queryKeys.support.all,
      "admin",
      "conversations",
      params,
    ],
    tickets: (params = {}) => [
      ...queryKeys.support.all,
      "admin",
      "tickets",
      params,
    ],
  },
};
