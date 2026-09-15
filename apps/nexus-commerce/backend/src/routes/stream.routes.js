import { Router } from "express";
import { authMiddleware } from "#middlewares/authMiddleware.js";
import { adminMiddleware } from "#middlewares/adminMiddleware.js";
import {
  streamAdminOrders,
  streamOrderTracking,
  streamProductStock,
  streamChat,
} from "#controllers/stream/stream.controller.js";

const router = Router();

// Helper for optional auth on public/guest tracking and chat
const optionalAuth = (req, res, next) => {
  if (req.signedCookies?.access_token || req.cookies?.access_token) {
    return authMiddleware(req, res, next);
  }
  next();
};

// 1. Merchant Admin Order Stream
router.get("/admin", authMiddleware, adminMiddleware, streamAdminOrders);

// 2. Live Order Courier GPS Tracking Stream
router.get("/orders/:orderId", optionalAuth, streamOrderTracking);

// 3. Public Flash-Sale Stock Stream
router.get("/products/:productId", streamProductStock);

// 4. Live Chat Message Stream
router.get("/chat/:conversationId", optionalAuth, streamChat);

export default router;
