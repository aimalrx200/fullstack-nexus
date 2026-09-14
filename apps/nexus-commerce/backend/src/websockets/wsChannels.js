export const WS_CHANNELS = {
  // Merchant Admin Order Stream
  ADMIN_ORDERS_ROOM: "admin:orders",
  EVENT_NEW_ORDER: "order:new",
  EVENT_ORDER_STATUS: "order:status_updated",

  // Flash-Sale Inventory Ticker
  STOCK_ROOM_PREFIX: "product:inventory_",
  EVENT_STOCK_UPDATE: "inventory:stock_updated",

  // Live Courier Delivery Tracking
  TRACKING_ROOM_PREFIX: "order:tracking_",
  EVENT_COURIER_LOCATION: "courier:location_update",

  // Live Customer Support Chat
  CHAT_ROOM_PREFIX: "chat:conversation_",
  EVENT_CHAT_MESSAGE: "chat:message",
  EVENT_CHAT_TYPING: "chat:typing",
  EVENT_CHAT_READ: "chat:read_receipt",
  EVENT_ERROR: "ws:error",
};
