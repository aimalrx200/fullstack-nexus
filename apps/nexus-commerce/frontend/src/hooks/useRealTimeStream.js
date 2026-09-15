import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "../services/socketClient";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
const IS_PROD =
  import.meta.env.PROD || import.meta.env.VITE_APP_ENV === "production";

/**
 * Adaptive Real-Time Hook:
 * - In Development: Uses Socket.io
 * - In Production: Uses Server-Sent Events (EventSource)
 *
 * @param {Object} config
 * @param {'admin' | 'order' | 'product' | 'chat'} config.channelType
 * @param {string} [config.id] - Order ID, Product ID, or Conversation ID
 * @param {Object.<string, Function>} config.events - Map of event names to handler functions
 * @param {boolean} [config.enabled=true]
 */
export function useRealTimeStream({
  channelType,
  id = "",
  events = {},
  enabled = true,
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  // 1. Synchronize events ref safely inside an effect (React 19 compliant)
  const eventsRef = useRef(events);
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // 2. Track connection state with a ref to avoid reconnect loops in visibilitychange
  const isConnectedRef = useRef(false);

  // Helper to set both state (for UI) and ref (for stable effect callbacks)
  const updateConnectionState = useCallback((status) => {
    isConnectedRef.current = status;
    setIsConnected(status);
  }, []);

  // Resolve SSE endpoint path
  const getStreamUrl = useCallback(() => {
    switch (channelType) {
      case "admin":
        return `${API_BASE_URL}/stream/admin`;
      case "order":
        return `${API_BASE_URL}/stream/orders/${id}`;
      case "product":
        return `${API_BASE_URL}/stream/products/${id}`;
      case "chat":
        return `${API_BASE_URL}/stream/chat/${id}`;
      default:
        return null;
    }
  }, [channelType, id]);

  useEffect(() => {
    if (!enabled) return;

    // =========================================================================
    // 1. PRODUCTION MODE: Server-Sent Events (SSE)
    // =========================================================================
    if (IS_PROD) {
      const streamUrl = getStreamUrl();
      if (!streamUrl) return;

      let eventSource = null;
      let reconnectTimer = null;

      const connectSSE = () => {
        try {
          if (eventSource) {
            eventSource.close();
          }

          eventSource = new EventSource(streamUrl, { withCredentials: true });

          eventSource.addEventListener("connected", () => {
            updateConnectionState(true);
          });

          // Bind registered event listeners dynamically from ref
          Object.keys(eventsRef.current).forEach((eventName) => {
            eventSource.addEventListener(eventName, (e) => {
              try {
                const parsed = JSON.parse(e.data);
                setLastEvent({
                  type: eventName,
                  data: parsed,
                  timestamp: Date.now(),
                });

                const handler = eventsRef.current[eventName];
                if (handler) handler(parsed);
              } catch (err) {
                console.error(
                  `Error processing SSE event "${eventName}":`,
                  err,
                );
              }
            });
          });

          eventSource.onerror = () => {
            updateConnectionState(false);
            if (eventSource) eventSource.close();

            // Exponential backoff reconnect
            reconnectTimer = setTimeout(() => {
              if (document.visibilityState === "visible") {
                connectSSE();
              }
            }, 3000);
          };
        } catch (err) {
          console.error("SSE connection creation failed:", err);
        }
      };

      connectSSE();

      // Catch-up sync when tab returns to foreground
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible" && !isConnectedRef.current) {
          connectSSE();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
        if (reconnectTimer) clearTimeout(reconnectTimer);
        if (eventSource) eventSource.close();
        updateConnectionState(false);
      };
    }

    // =========================================================================
    // 2. LOCALHOST DEV MODE: Socket.io
    // =========================================================================
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const onConnect = () => {
      updateConnectionState(true);

      // Join corresponding Socket.io room
      if (channelType === "admin") socket.emit("admin:join_order_stream");
      if (channelType === "order" && id)
        socket.emit("order:subscribe_tracking", { orderId: id });
      if (channelType === "product" && id)
        socket.emit("product:subscribe_stock", { productId: id });
      if (channelType === "chat" && id)
        socket.emit("chat:join", { conversationId: id });
    };

    const onDisconnect = () => updateConnectionState(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) onConnect();

    // Attach listeners
    Object.keys(eventsRef.current).forEach((eventName) => {
      socket.on(eventName, (data) => {
        setLastEvent({ type: eventName, data, timestamp: Date.now() });
        const handler = eventsRef.current[eventName];
        if (handler) handler(data);
      });
    });

    return () => {
      if (channelType === "admin") socket.emit("admin:leave_order_stream");
      if (channelType === "order" && id)
        socket.emit("order:unsubscribe_tracking", { orderId: id });
      if (channelType === "product" && id)
        socket.emit("product:unsubscribe_stock", { productId: id });

      Object.keys(eventsRef.current).forEach((eventName) => {
        socket.off(eventName);
      });

      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      updateConnectionState(false);
    };
  }, [channelType, id, enabled, getStreamUrl, updateConnectionState]);

  return { isConnected, lastEvent };
}
