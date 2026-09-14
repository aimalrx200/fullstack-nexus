import { WS_CHANNELS } from "./wsChannels.js";
import { logger } from "#config/logger.js";

let ioInstance = null;

export const setSocketIOInstance = (io) => {
  ioInstance = io;
};

export const getSocketIOInstance = () => ioInstance;

/**
 * Emits incoming orders to the merchant admin room.
 */
export const broadcastNewOrder = (order) => {
  if (!ioInstance) return;

  ioInstance
    .to(WS_CHANNELS.ADMIN_ORDERS_ROOM)
    .emit(WS_CHANNELS.EVENT_NEW_ORDER, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: order.shippingAddress?.recipientName,
      total: order.pricing?.total,
      currency: order.pricing?.currency,
      paymentMethod: order.paymentMethod,
      city: order.shippingAddress?.city,
      createdAt: order.createdAt,
    });

  logger.info({
    msg: "Socket.io: Emitted order:new event to merchant stream",
    orderNumber: order.orderNumber,
  });
};

/**
 * Broadcasts order status updates (e.g. confirmed -> dispatched -> delivered).
 */
export const broadcastOrderStatusUpdate = (orderId, status, timeline) => {
  if (!ioInstance) return;

  const room = `${WS_CHANNELS.TRACKING_ROOM_PREFIX}${orderId}`;
  ioInstance.to(room).emit(WS_CHANNELS.EVENT_ORDER_STATUS, {
    orderId,
    status,
    timeline,
  });

  // Also notify the merchant admin room
  ioInstance
    .to(WS_CHANNELS.ADMIN_ORDERS_ROOM)
    .emit(WS_CHANNELS.EVENT_ORDER_STATUS, {
      orderId,
      status,
    });
};

/**
 * Broadcasts flash-sale stock drops to product page viewers.
 */
export const broadcastStockDrop = (productId, variantId, newStock) => {
  if (!ioInstance) return;

  const room = `${WS_CHANNELS.STOCK_ROOM_PREFIX}${productId}`;
  ioInstance.to(room).emit(WS_CHANNELS.EVENT_STOCK_UPDATE, {
    productId,
    variantId,
    newStock,
  });
};

/**
 * Broadcasts live courier coordinates to the customer order tracking room.
 */
export const broadcastCourierLocation = (orderId, coordinates, statusLabel) => {
  if (!ioInstance) return;

  const room = `${WS_CHANNELS.TRACKING_ROOM_PREFIX}${orderId}`;
  ioInstance.to(room).emit(WS_CHANNELS.EVENT_COURIER_LOCATION, {
    orderId,
    coordinates,
    statusLabel,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emits real-time customer support messages to a specific conversation room.
 */
export const broadcastChatMessage = (conversationId, message) => {
  if (!ioInstance) return;

  const room = `${WS_CHANNELS.CHAT_ROOM_PREFIX}${conversationId}`;
  ioInstance.to(room).emit(WS_CHANNELS.EVENT_CHAT_MESSAGE, message);
};
