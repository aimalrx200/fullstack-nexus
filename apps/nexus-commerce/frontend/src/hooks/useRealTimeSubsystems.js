import { useRealTimeStream } from "./useRealTimeStream";
import { playOrderChime, playMessageAlert } from "../services/soundEffects";

/**
 * 1. Merchant Admin Live Order Stream
 */
export function useAdminOrderStream({ onNewOrder, onStatusUpdate } = {}) {
  return useRealTimeStream({
    channelType: "admin",
    events: {
      "order:new": (order) => {
        playOrderChime();
        if (onNewOrder) onNewOrder(order);
      },
      "order:status_updated": (data) => {
        if (onStatusUpdate) onStatusUpdate(data);
      },
    },
  });
}

/**
 * 2. Customer Order Tracking & Courier GPS Stream
 */
export function useOrderTrackingStream(
  orderId,
  { onLocationUpdate, onStatusUpdate } = {},
) {
  return useRealTimeStream({
    channelType: "order",
    id: orderId,
    enabled: Boolean(orderId),
    events: {
      "courier:location_update": (location) => {
        if (onLocationUpdate) onLocationUpdate(location);
      },
      "order:status_updated": (status) => {
        if (onStatusUpdate) onStatusUpdate(status);
      },
    },
  });
}

/**
 * 3. Flash-Sale Stock Drop Ticker
 */
export function useProductStockStream(productId, { onStockUpdate } = {}) {
  return useRealTimeStream({
    channelType: "product",
    id: productId,
    enabled: Boolean(productId),
    events: {
      "inventory:stock_updated": (stockData) => {
        if (onStockUpdate) onStockUpdate(stockData);
      },
    },
  });
}

/**
 * 4. Live Customer Support Chat Stream
 */
export function useChatStream(
  conversationId,
  { onMessage, onTyping, onRead } = {},
) {
  return useRealTimeStream({
    channelType: "chat",
    id: conversationId,
    enabled: Boolean(conversationId),
    events: {
      "chat:message": (msg) => {
        playMessageAlert();
        if (onMessage) onMessage(msg);
      },
      "chat:typing": (typingData) => {
        if (onTyping) onTyping(typingData);
      },
      "chat:read_receipt": (readData) => {
        if (onRead) onRead(readData);
      },
    },
  });
}
