// apps/nexus-ats/frontend/src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import themeReducer from "./slices/themeSlice";
import jobReducer from "./slices/jobSlice";
import candidateReducer from "./slices/candidateSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    theme: themeReducer,
    jobs: jobReducer,
    candidates: candidateReducer,
  },
});
