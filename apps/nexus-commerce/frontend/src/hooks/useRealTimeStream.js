// apps/nexus-commerce/frontend/src/hooks/useRealTimeStream.js
import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "../services/socketClient";
import { env } from "../config/env";

const API_BASE_URL = env.VITE_API_URL || "/api/v1";
const IS_PROD = import.meta.env.PROD || env.VITE_APP_ENV === "production";

/**
 * Adaptive Real-Time Hook:
 * - Development: Socket.io
 * - Production: Server-Sent Events (EventSource)
 */
export function useRealTimeStream({
  channelType,
  id = "",
  events = {},
  enabled = true,
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  const eventsRef = useRef(events);
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  const isConnectedRef = useRef(false);

  const updateConnectionState = useCallback((status) => {
    isConnectedRef.current = status;
    setIsConnected(status);
  }, []);

  const getStreamUrl = useCallback(() => {
    let guestSessionId = "";
    if (typeof window !== "undefined") {
      guestSessionId =
        localStorage.getItem("nexus_guest_session_id") ||
        sessionStorage.getItem("nexus_client_instance_id") ||
        "";
    }

    const queryParams = new URLSearchParams();
    if (guestSessionId) {
      queryParams.set("guestSessionId", guestSessionId);
    }
    const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";

    switch (channelType) {
      case "admin":
        return `${API_BASE_URL}/stream/admin`;
      case "order":
        return `${API_BASE_URL}/stream/orders/${id}${queryStr}`;
      case "product":
        return `${API_BASE_URL}/stream/products/${id}`;
      case "chat":
        return `${API_BASE_URL}/stream/chat/${id}${queryStr}`;
      default:
        return null;
    }
  }, [channelType, id]);

  useEffect(() => {
    if (!enabled) return;

    // 1. PRODUCTION MODE: Server-Sent Events (SSE)
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

          // Mark online immediately on connection open
          eventSource.onopen = () => {
            updateConnectionState(true);
          };

          eventSource.addEventListener("connected", () => {
            updateConnectionState(true);
          });

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

    // 2. LOCALHOST DEV MODE: Socket.io
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const onConnect = () => {
      updateConnectionState(true);

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
