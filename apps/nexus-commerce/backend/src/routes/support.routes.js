// apps/nexus-commerce/backend/src/routes/support.routes.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import env from "#config/env.js";
import {
  getOrCreateConversation,
  getConversationMessages,
  sendMessage,
  broadcastTypingStatus,
  getAllConversations,
} from "#controllers/support/chat.controller.js";
import {
  createSupportTicket,
  getTickets,
  updateTicketStatus,
} from "#controllers/support/ticket.controller.js";
import { authMiddleware } from "#middlewares/authMiddleware.js";
import { requireRoles } from "#middlewares/rbacMiddleware.js";
import { validate } from "#middlewares/validate.js";
import {
  SendMessageSchema,
  CreateTicketSchema,
  UpdateTicketStatusSchema,
} from "#validations/support.validation.js";

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

// Storefront live chat, typing & ticket generation
router.post("/conversation", optionalAuth, getOrCreateConversation);
router.post("/message", optionalAuth, validate(SendMessageSchema), sendMessage);
router.post("/typing", optionalAuth, broadcastTypingStatus);
router.post("/ticket", validate(CreateTicketSchema), createSupportTicket);

// Staff Helpdesk Administration
const staffRoles = requireRoles(
  "support_agent",
  "merchant_admin",
  "super_admin",
);

router.get("/conversations", authMiddleware, staffRoles, getAllConversations);
router.get(
  "/conversations/:conversationId/messages",
  authMiddleware,
  staffRoles,
  getConversationMessages,
);
router.get("/tickets", authMiddleware, staffRoles, getTickets);
router.patch(
  "/tickets/:ticketId",
  authMiddleware,
  staffRoles,
  validate(UpdateTicketStatusSchema),
  updateTicketStatus,
);

export default router;
