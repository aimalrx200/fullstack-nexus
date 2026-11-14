// apps/nexus-ats/frontend/src/lib/auth/sessionManager.js

import { toast } from "sonner";
import {
  setAuthenticatedUser,
  setUnauthenticated,
  checkAuthSession,
} from "@/redux/slices/authSlice";
import {
  broadcastAuthEvent,
  subscribeToAuthEvents,
  AUTH_EVENTS,
} from "./authBroadcast";

const SESSION_KEY = "nexus_ats_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days (matches JWT cookie)

export const getStoredSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);
    if (!session || !session.expiresAt) return null;

    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session.user;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const saveSession = (user) => {
  try {
    const sessionData = {
      user,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    broadcastAuthEvent(AUTH_EVENTS.LOGIN, user);
  } catch {
    // Fail silently
  }
};

export const removeSession = (reason = "manual") => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    broadcastAuthEvent(AUTH_EVENTS.LOGOUT, { reason });
  } catch {
    // Fail silently
  }
};

/**
 * Hydrates Redux auth state by verifying session cookie with the live backend
 */
export const hydrateAuthSession = (dispatch) => {
  const cachedUser = getStoredSession();
  if (cachedUser) {
    // Optimistically set cached user to eliminate layout jump
    dispatch(setAuthenticatedUser(cachedUser));
  }
  // Validate real session cookie against live API
  dispatch(checkAuthSession());
};

export const initializeCrossTabSync = (dispatch) => {
  return subscribeToAuthEvents(({ type, payload }) => {
    switch (type) {
      case AUTH_EVENTS.LOGIN: {
        const sessionData = {
          user: payload,
          createdAt: Date.now(),
          expiresAt: Date.now() + SESSION_DURATION_MS,
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        dispatch(setAuthenticatedUser(payload));
        toast.info("Signed in in another tab");
        break;
      }

      case AUTH_EVENTS.LOGOUT: {
        sessionStorage.removeItem(SESSION_KEY);
        dispatch(setUnauthenticated());
        toast.info("Signed out in another tab");
        break;
      }

      case AUTH_EVENTS.SESSION_EXPIRED: {
        sessionStorage.removeItem(SESSION_KEY);
        dispatch(setUnauthenticated());
        toast.warning("Session expired. Please sign in again.");
        break;
      }

      default:
        break;
    }
  });
};
