import { AUTH_CHANNELS } from "../../config/constants";

/**
 * Cross-Tab Session Synchronizer using BroadcastChannel API
 * Ensures logging in or out in one tab instantly updates all other open tabs.
 */
class AuthManagerSingleton {
  constructor() {
    this.channel =
      typeof window !== "undefined" && "BroadcastChannel" in window
        ? new BroadcastChannel(AUTH_CHANNELS.CROSS_TAB)
        : null;

    this.listeners = new Set();

    if (this.channel) {
      this.channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        this.listeners.forEach((callback) => {
          try {
            callback(type, payload);
          } catch (err) {
            console.error("AuthManager listener callback error:", err);
          }
        });
      };
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyLoginSuccess(user) {
    if (this.channel) {
      this.channel.postMessage({ type: "AUTH_LOGIN", payload: user });
    }
  }

  notifyRefreshSuccess() {
    if (this.channel) {
      this.channel.postMessage({ type: "AUTH_REFRESHED", payload: null });
    }
  }

  notifySessionTerminated() {
    if (this.channel) {
      this.channel.postMessage({ type: "AUTH_LOGOUT", payload: null });
    }
  }
}

export const AuthManager = new AuthManagerSingleton();
