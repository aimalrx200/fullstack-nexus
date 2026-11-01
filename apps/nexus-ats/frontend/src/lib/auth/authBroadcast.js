// apps/nexus-ats/frontend/src/lib/auth/authBroadcast.js

const CHANNEL_NAME = "nexus_ats_auth_bus";

export const AUTH_EVENTS = {
  LOGIN: "AUTH_LOGIN",
  LOGOUT: "AUTH_LOGOUT",
  SESSION_EXPIRED: "AUTH_SESSION_EXPIRED",
};

let channel = null;

// Initialize channel safely (graceful fallback if BroadcastChannel is unsupported)
const getChannel = () => {
  if (typeof window === "undefined") return null;
  if (!channel && "BroadcastChannel" in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
};

/**
 * Broadcast an authentication event to all other open tabs
 * @param {string} type - Event type from AUTH_EVENTS
 * @param {object} payload - Optional payload (e.g. user profile or signout reason)
 */
export const broadcastAuthEvent = (type, payload = {}) => {
  try {
    const ch = getChannel();
    if (ch) {
      ch.postMessage({ type, payload, timestamp: Date.now() });
    }
  } catch (err) {
    console.warn("Auth broadcast failed:", err);
  }
};

/**
 * Subscribe to cross-tab authentication events
 * @param {function} onMessage - Callback receiving { type, payload, timestamp }
 * @returns {function} Unsubscribe cleanup function
 */
export const subscribeToAuthEvents = (onMessage) => {
  const ch = getChannel();
  if (!ch) return () => {};

  const handler = (event) => {
    if (event?.data && onMessage) {
      onMessage(event.data);
    }
  };

  ch.addEventListener("message", handler);

  return () => {
    ch.removeEventListener("message", handler);
  };
};
