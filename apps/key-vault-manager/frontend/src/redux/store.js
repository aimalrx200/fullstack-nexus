// /src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";

import notificationReducer from "./slices/notificationSlice";
import { toastMiddleware } from "./middlewares/toastMiddleware"; // 🟢 Kept our clean toast middleware
import themeReducer from "./slices/themeSlice";

export default configureStore({
  reducer: {
    notification: notificationReducer,
    theme: themeReducer,
  },
  // 🟢 Optimized middleware pipeline focused purely on core tools and global toasts
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(toastMiddleware),
});
