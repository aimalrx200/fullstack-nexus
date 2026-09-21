import { createListenerMiddleware } from "@reduxjs/toolkit";
import { setTheme, toggleTheme, applyThemeToDOM } from "../slices/themeSlice";
import { setCurrency, toggleCurrency } from "../slices/currencySlice";
import { pushLiveOrder } from "../slices/adminStreamSlice";
import { appendChatMessage } from "../slices/supportChatSlice";
import { clearCredentials, setCredentials } from "../slices/authSlice";
import { STORAGE_KEYS, THEMES } from "../../config/constants";
import { playOrderChime, playMessageAlert } from "../../services/soundEffects";
import { AuthManager } from "../../lib/auth/AuthManager";

export const listenerMiddleware = createListenerMiddleware();

// 1. Synchronize Theme to DOM & LocalStorage
listenerMiddleware.startListening({
  actionCreator: setTheme,
  effect: (action) => {
    const theme = action.payload;
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    applyThemeToDOM(theme);
  },
});

listenerMiddleware.startListening({
  actionCreator: toggleTheme,
  effect: (_action, listenerApi) => {
    const current = listenerApi.getState().theme.currentTheme;
    const next = current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    listenerApi.dispatch(setTheme(next));
  },
});

// 2. Synchronize Currency to LocalStorage
listenerMiddleware.startListening({
  actionCreator: setCurrency,
  effect: (action) => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, action.payload);
  },
});

listenerMiddleware.startListening({
  actionCreator: toggleCurrency,
  effect: (_action, listenerApi) => {
    const current = listenerApi.getState().currency.activeCurrency;
    localStorage.setItem(STORAGE_KEYS.CURRENCY, current);
  },
});

// 3. Audio Chimes & Sound Effects
listenerMiddleware.startListening({
  actionCreator: pushLiveOrder,
  effect: (_action, listenerApi) => {
    if (listenerApi.getState().adminStream.soundAlertsEnabled) {
      playOrderChime();
    }
  },
});

listenerMiddleware.startListening({
  actionCreator: appendChatMessage,
  effect: (action) => {
    if (action.payload?.senderType !== "customer") {
      playMessageAlert();
    }
  },
});

// 4. Multi-Tab Session Synchronization (Deduplicated to prevent infinite loop loops)
listenerMiddleware.startListening({
  actionCreator: setCredentials,
  effect: (action, listenerApi) => {
    const prevUser = listenerApi.getOriginalState().auth.user;
    const currentUser = action.payload;

    if (
      currentUser &&
      (!prevUser ||
        prevUser._id !== currentUser._id ||
        prevUser.isEmailVerified !== currentUser.isEmailVerified)
    ) {
      AuthManager.notifyLoginSuccess(currentUser);
    }
  },
});

listenerMiddleware.startListening({
  actionCreator: clearCredentials,
  effect: (_action, listenerApi) => {
    const prevAuth = listenerApi.getOriginalState().auth.isAuthenticated;
    if (prevAuth) {
      AuthManager.notifySessionTerminated();
    }
  },
});
