import apiClient from "./client";

export const supportApi = {
  getOrCreateConversation: async (payload = {}) => {
    const { data } = await apiClient.post("/support/conversation", payload);
    return data;
  },

  getConversationMessages: async (conversationId) => {
    const { data } = await apiClient.get(
      `/support/conversations/${conversationId}/messages`,
    );
    return data;
  },

  sendMessage: async ({ conversationId, text, attachments = [] }) => {
    const { data } = await apiClient.post("/support/message", {
      conversationId,
      text,
      attachments,
    });
    return data.message;
  },

  createTicket: async (ticketPayload) => {
    const { data } = await apiClient.post("/support/ticket", ticketPayload);
    return data;
  },

  // Merchant Admin Operations
  getAllConversations: async (params = {}) => {
    const { data } = await apiClient.get("/support/conversations", { params });
    return data;
  },

  getTickets: async (params = {}) => {
    const { data } = await apiClient.get("/support/tickets", { params });
    return data;
  },

  updateTicketStatus: async (ticketId, updatePayload) => {
    const { data } = await apiClient.patch(
      `/support/tickets/${ticketId}`,
      updatePayload,
    );
    return data.ticket;
  },
};
