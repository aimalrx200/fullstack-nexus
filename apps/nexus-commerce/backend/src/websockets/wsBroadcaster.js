import { WS_CHANNELS } from "./wsChannels.js";
import { publishEvent } from "#services/pubSubService.js";
import { logger } from "#config/logger.js";

let ioInstance = null;

export const setSocketIOInstance = (io) => {
  ioInstance = io;
};

export const getSocketIOInstance = () => ioInstance;

/**
 * Emits incoming orders to the merchant admin room and SSE subscribers.
 */
export const broadcastNewOrder = (order) => {
  const payload = {
    orderId: order._id,
    orderNumber: order.orderNumber,
    customerName: order.shippingAddress?.recipientName,
    total: order.pricing?.total,
    currency: order.pricing?.currency,
    paymentMethod: order.paymentMethod,
    city: order.shippingAddress?.city,
    createdAt: order.createdAt,
  };

  // 1. Socket.io broadcast (Localhost dev mode)
  if (ioInstance) {
    ioInstance
      .to(WS_CHANNELS.ADMIN_ORDERS_ROOM)
      .emit(WS_CHANNELS.EVENT_NEW_ORDER, payload);
  }

  // 2. Redis PubSub / SSE bridge (Serverless production)
  publishEvent(WS_CHANNELS.ADMIN_ORDERS_ROOM, {
    type: WS_CHANNELS.EVENT_NEW_ORDER,
    data: payload,
  });

  logger.info({
    msg: "Broadcast: New order dispatched to admin stream",
    orderNumber: order.orderNumber,
  });
};

/**
 * Broadcasts order status updates (e.g. confirmed -> dispatched -> delivered).
 */
export const broadcastOrderStatusUpdate = (orderId, status, timeline) => {
  const trackingRoom = `${WS_CHANNELS.TRACKING_ROOM_PREFIX}${orderId}`;
  const payload = { orderId, status, timeline };

  if (ioInstance) {
    ioInstance.to(trackingRoom).emit(WS_CHANNELS.EVENT_ORDER_STATUS, payload);
    ioInstance
      .to(WS_CHANNELS.ADMIN_ORDERS_ROOM)
      .emit(WS_CHANNELS.EVENT_ORDER_STATUS, { orderId, status });
  }

  publishEvent(trackingRoom, {
    type: WS_CHANNELS.EVENT_ORDER_STATUS,
    data: payload,
  });

  publishEvent(WS_CHANNELS.ADMIN_ORDERS_ROOM, {
    type: WS_CHANNELS.EVENT_ORDER_STATUS,
    data: { orderId, status },
  });
};

/**
 * Broadcasts flash-sale stock drops to product page viewers.
 */
export const broadcastStockDrop = (productId, variantId, newStock) => {
  const stockRoom = `${WS_CHANNELS.STOCK_ROOM_PREFIX}${productId}`;
  const payload = { productId, variantId, newStock };

  if (ioInstance) {
    ioInstance.to(stockRoom).emit(WS_CHANNELS.EVENT_STOCK_UPDATE, payload);
  }

  publishEvent(stockRoom, {
    type: WS_CHANNELS.EVENT_STOCK_UPDATE,
    data: payload,
  });
};

/**
 * Broadcasts live courier coordinates to the customer order tracking room.
 */
export const broadcastCourierLocation = (orderId, coordinates, statusLabel) => {
  const trackingRoom = `${WS_CHANNELS.TRACKING_ROOM_PREFIX}${orderId}`;
  const payload = {
    orderId,
    coordinates,
    statusLabel,
    timestamp: new Date().toISOString(),
  };

  if (ioInstance) {
    ioInstance
      .to(trackingRoom)
      .emit(WS_CHANNELS.EVENT_COURIER_LOCATION, payload);
  }

  publishEvent(trackingRoom, {
    type: WS_CHANNELS.EVENT_COURIER_LOCATION,
    data: payload,
  });
};

/**
 * Emits real-time customer support messages to a specific conversation room.
 */
export const broadcastChatMessage = (conversationId, message) => {
  const chatRoom = `${WS_CHANNELS.CHAT_ROOM_PREFIX}${conversationId}`;

  if (ioInstance) {
    ioInstance.to(chatRoom).emit(WS_CHANNELS.EVENT_CHAT_MESSAGE, message);
  }

  publishEvent(chatRoom, {
    type: WS_CHANNELS.EVENT_CHAT_MESSAGE,
    data: message,
  });
};
