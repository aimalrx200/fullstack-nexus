import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import currencyReducer from "./slices/currencySlice";
import adminStreamReducer from "./slices/adminStreamSlice";
import supportChatReducer from "./slices/supportChatSlice";
import uiReducer from "./slices/uiSlice";
import { listenerMiddleware } from "./middleware/listenerMiddleware";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    cart: cartReducer,
    currency: currencyReducer,
    adminStream: adminStreamReducer,
    supportChat: supportChatReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Date / non-serializable objects in listener payloads if any
        ignoredActionPaths: ["payload.timestamp", "payload.createdAt"],
      },
    }).prepend(listenerMiddleware.middleware),
  devTools: import.meta.env.DEV,
});

export default store;
