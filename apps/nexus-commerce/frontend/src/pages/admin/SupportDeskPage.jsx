import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminSupportDesk } from "../../hooks/useAdminSupportDesk";
import { ConversationList } from "../../components/admin/support/ConversationList";
import { ActiveChatWindow } from "../../components/admin/support/ActiveChatWindow";
import { CustomerContextSidebar } from "../../components/admin/support/CustomerContextSidebar";
import { TicketResolutionModal } from "../../components/admin/support/TicketResolutionModal";
import { supportApi } from "../../lib/api/supportApi";
import { queryKeys } from "../../lib/api/queryKeys";
import { toast } from "sonner";

export function SupportDeskPage() {
  const queryClient = useQueryClient();
  const [resolvingTicket, setResolvingTicket] = useState(null);

  const {
    conversations,
    activeConversation,
    selectedConversationId,
    setSelectedConversationId,
    conversationStatusFilter,
    setConversationStatusFilter,
    customerTypeFilter,
    setCustomerTypeFilter,
    searchQuery,
    setSearchQuery,
    sendAgentMessage,
    isSending,
    isTyping,
    typingUserName,
  } = useAdminSupportDesk();

  const resolveMutation = useMutation({
    mutationFn: (payload) =>
      supportApi.updateTicketStatus(payload.ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.support.all });
      setResolvingTicket(null);
      toast.success("Support ticket resolved successfully!");
    },
  });

  return (
    <div className="space-y-4 animate-in fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
          3-Pane Live Support Control Desk
        </h1>
        <p className="text-xs text-text-muted">
          Real-time customer messaging, active bag inspection, and segmented
          guest/customer routing.
        </p>
      </div>

      <div className="h-[78vh] rounded-3xl bg-surface-card border border-border-main overflow-hidden flex shadow-2xl">
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
          statusFilter={conversationStatusFilter}
          onStatusFilterChange={setConversationStatusFilter}
          customerTypeFilter={customerTypeFilter}
          onCustomerTypeFilterChange={setCustomerTypeFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <ActiveChatWindow
          conversation={activeConversation}
          onSendMessage={sendAgentMessage}
          isSending={isSending}
          isTyping={isTyping}
          typingUserName={typingUserName}
        />

        <CustomerContextSidebar conversation={activeConversation} />
      </div>

      {resolvingTicket && (
        <TicketResolutionModal
          isOpen={Boolean(resolvingTicket)}
          onClose={() => setResolvingTicket(null)}
          ticket={resolvingTicket}
          onResolve={resolveMutation.mutate}
          isLoading={resolveMutation.isPending}
        />
      )}
    </div>
  );
}
