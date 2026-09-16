import { createSelector } from "@reduxjs/toolkit";

const selectAdminStream = (state) => state.adminStream;

export const selectLiveOrders = createSelector(
  [selectAdminStream],
  (stream) => stream.liveOrders,
);

export const selectLiveOrderCount = createSelector(
  [selectLiveOrders],
  (orders) => orders.length,
);

export const selectSoundAlertsEnabled = createSelector(
  [selectAdminStream],
  (stream) => stream.soundAlertsEnabled,
);
