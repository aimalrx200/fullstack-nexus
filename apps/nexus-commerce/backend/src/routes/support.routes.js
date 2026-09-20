// apps/nexus-commerce/backend/src/routes/support.routes.js
import { Router } from "express";
import {
  getOrCreateConversation,
  getConversationMessages,
  sendMessage,
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

// Storefront live chat & ticket generation
router.post("/conversation", getOrCreateConversation);
router.post("/message", validate(SendMessageSchema), sendMessage);
router.post("/ticket", validate(CreateTicketSchema), createSupportTicket);

// Staff Desk: Accessible to support agents, merchant admins & super admins
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
