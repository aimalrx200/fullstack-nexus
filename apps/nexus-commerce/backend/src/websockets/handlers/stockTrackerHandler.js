import { WS_CHANNELS } from "../wsChannels.js";
import mongoose from "mongoose";

export const registerStockTrackerHandlers = (_io, socket) => {
  socket.on("product:subscribe_stock", ({ productId }) => {
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) return;
    socket.join(`${WS_CHANNELS.STOCK_ROOM_PREFIX}${productId}`);
  });

  socket.on("product:unsubscribe_stock", ({ productId }) => {
    if (!productId) return;
    socket.leave(`${WS_CHANNELS.STOCK_ROOM_PREFIX}${productId}`);
  });
};
