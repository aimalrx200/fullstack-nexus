// apps/nexus-commerce/frontend/src/pages/admin/SupportDeskPage.jsx
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
  const [isMobileContextOpen, setIsMobileContextOpen] = useState(false);

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
    emitAgentTyping,
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
    <div className="space-y-3.5 animate-in fade-in w-full">
      {/* Page Header */}
      <div className="px-1 flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-text-main tracking-tight">
            Live Support Control Desk
          </h1>
          <p className="text-[11px] sm:text-xs text-text-muted">
            Real-time customer messaging, active bag inspection, and segmented
            guest/customer routing.
          </p>
        </div>
      </div>

      {/* Master Multi-Pane Shell */}
      <div className="h-[calc(100dvh-9.5rem)] sm:h-[calc(100dvh-8rem)] min-h-[540px] rounded-2xl sm:rounded-3xl bg-surface-card border border-border-main overflow-hidden flex shadow-2xl relative w-full">
        {/* Pane 1: Conversation List (Full width on mobile when no chat is open, 340px on desktop) */}
        <div
          className={`${
            selectedConversationId ? "hidden lg:flex" : "flex"
          } w-full lg:w-80 xl:w-92 shrink-0 h-full border-r border-border-main`}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={(id) => {
              setSelectedConversationId(id);
              setIsMobileContextOpen(false);
            }}
            statusFilter={conversationStatusFilter}
            onStatusFilterChange={setConversationStatusFilter}
            customerTypeFilter={customerTypeFilter}
            onCustomerTypeFilterChange={setCustomerTypeFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Pane 2: Active Chat Window (Full width on mobile when selected, flex-1 on desktop) */}
        <div
          className={`${
            selectedConversationId ? "flex" : "hidden lg:flex"
          } flex-1 min-w-0 h-full flex-col`}
        >
          <ActiveChatWindow
            conversation={activeConversation}
            onSendMessage={sendAgentMessage}
            onTyping={emitAgentTyping}
            onBack={() => setSelectedConversationId(null)}
            onToggleContext={() => setIsMobileContextOpen(!isMobileContextOpen)}
            isSending={isSending}
            isTyping={isTyping}
            typingUserName={typingUserName}
          />
        </div>

        {/* Pane 3: Shopper Context Sidebar (Always visible on xl screens, drawer modal on smaller screens) */}
        <CustomerContextSidebar
          conversation={activeConversation}
          isOpenMobile={isMobileContextOpen}
          onCloseMobile={() => setIsMobileContextOpen(false)}
        />
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
