import { SupportTicket } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { sanitizeInput } from "#utils/sanitize.js";
import { enqueueJob, JOB_TYPES } from "#services/jobQueue.js";

export const createSupportTicket = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, category, priority, message } = req.body;
  const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

  const ticket = await SupportTicket.create({
    ticketNumber,
    customerId: req.user?.id,
    name: sanitizeInput(name),
    email: email.toLowerCase().trim(),
    phone: sanitizeInput(phone),
    subject: sanitizeInput(subject),
    category,
    priority,
    message: sanitizeInput(message),
  });

  // Non-blocking async queue dispatch
  await enqueueJob(JOB_TYPES.SEND_TICKET_EMAIL, ticket);

  return res.status(201).json({
    success: true,
    message:
      "Support ticket registered. An agent will follow up shortly via email.",
    ticket,
  });
});

export const getTickets = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15));
  const skip = (page - 1) * limit;

  const { status, priority, category } = req.query;
  const query = {};

  if (status && status !== "ALL") query.status = status;
  if (priority && priority !== "ALL") query.priority = priority;
  if (category && category !== "ALL") query.category = category;

  const [tickets, totalCount] = await Promise.all([
    SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SupportTicket.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    tickets,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
    },
  });
});

export const updateTicketStatus = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { status, adminNotes } = req.body;

  const ticket = await SupportTicket.findByIdAndUpdate(
    ticketId,
    {
      $set: {
        status,
        ...(adminNotes && { adminNotes: sanitizeInput(adminNotes) }),
      },
    },
    { new: true },
  );

  return res.status(200).json({ success: true, ticket });
});
