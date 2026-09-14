import { Router } from "express";
import {
  getOrCreateConversation,
  sendMessage,
  getAllConversations,
} from "#controllers/support/chat.controller.js";
import {
  createSupportTicket,
  getTickets,
  updateTicketStatus,
} from "#controllers/support/ticket.controller.js";
import { authMiddleware } from "#middlewares/authMiddleware.js";
import { adminMiddleware } from "#middlewares/adminMiddleware.js";
import { validate } from "#middlewares/validate.js";
import {
  SendMessageSchema,
  CreateTicketSchema,
  UpdateTicketStatusSchema,
} from "#validations/support.validation.js";

const router = Router();

// Customer Support Chat & Offline Ticket Submissions
router.post("/conversation", getOrCreateConversation);
router.post("/message", validate(SendMessageSchema), sendMessage);
router.post("/ticket", validate(CreateTicketSchema), createSupportTicket);

// Merchant Helpdesk Administration
router.get(
  "/conversations",
  authMiddleware,
  adminMiddleware,
  getAllConversations,
);
router.get("/tickets", authMiddleware, adminMiddleware, getTickets);
router.patch(
  "/tickets/:ticketId",
  authMiddleware,
  adminMiddleware,
  validate(UpdateTicketStatusSchema),
  updateTicketStatus,
);

export default router;
