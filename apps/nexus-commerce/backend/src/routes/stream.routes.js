// apps/nexus-commerce/backend/src/routes/stream.routes.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import env from "#config/env.js";
import { authMiddleware } from "#middlewares/authMiddleware.js";
import { requireRoles } from "#middlewares/rbacMiddleware.js";
import {
  streamAdminOrders,
  streamOrderTracking,
  streamProductStock,
  streamChat,
} from "#controllers/stream/stream.controller.js";

const router = Router();

const optionalAuth = (req, res, next) => {
  const token = req.signedCookies?.access_token || req.cookies?.access_token;
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch {
    req.user = null;
  }
  next();
};

// 1. Merchant & Support Live Stream (Support Agent, Merchant Admin, Super Admin)
router.get(
  "/admin",
  authMiddleware,
  requireRoles("support_agent", "merchant_admin", "super_admin"),
  streamAdminOrders,
);

// 2. Live Order Courier GPS Tracking Stream (Supports Guest + Auth)
router.get("/orders/:orderId", optionalAuth, streamOrderTracking);

// 3. Public Flash-Sale Stock Stream (Open to all shoppers)
router.get("/products/:productId", streamProductStock);

// 4. Live Chat Message Stream (Supports Guest + Auth)
router.get("/chat/:conversationId", optionalAuth, streamChat);

export default router;
