// src/redux/slices/notificationSlice.js

import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {},
  reducers: {
    // eslint-disable-next-line no-unused-vars
    triggerToast: (state, action) => {},
  },
});

export const { triggerToast } = notificationSlice.actions;
export default notificationSlice.reducer;
