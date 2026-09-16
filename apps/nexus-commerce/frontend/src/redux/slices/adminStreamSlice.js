import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  liveOrders: [],
  soundAlertsEnabled: true,
  lastReceivedOrder: null,
};

export const adminStreamSlice = createSlice({
  name: "adminStream",
  initialState,
  reducers: {
    pushLiveOrder: (state, action) => {
      const newOrder = action.payload;
      // Prepend to feed and retain the last 50 entries
      state.liveOrders = [newOrder, ...state.liveOrders.slice(0, 49)];
      state.lastReceivedOrder = newOrder;
    },
    updateLiveOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.liveOrders.find((o) => o.orderId === orderId);
      if (order) {
        order.fulfillmentStatus = status;
      }
    },
    toggleSoundAlerts: (state) => {
      state.soundAlertsEnabled = !state.soundAlertsEnabled;
    },
    clearLiveStream: (state) => {
      state.liveOrders = [];
      state.lastReceivedOrder = null;
    },
  },
});

export const {
  pushLiveOrder,
  updateLiveOrderStatus,
  toggleSoundAlerts,
  clearLiveStream,
} = adminStreamSlice.actions;
export default adminStreamSlice.reducer;
