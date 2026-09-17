import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportApi } from "../lib/api/supportApi";
import { queryKeys } from "../lib/api/queryKeys";
import { useChatStream } from "./useRealTimeSubsystems";
import { playMessageAlert } from "../services/soundEffects";
import { toast } from "sonner";

export function useAdminSupportDesk() {
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [conversationStatusFilter, setConversationStatusFilter] =
    useState("ALL");

  // Query all active and open conversations
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.support.adminConversations({
      status: conversationStatusFilter,
    }),
    queryFn: () =>
      supportApi.getAllConversations({ status: conversationStatusFilter }),
    staleTime: 10 * 1000,
  });

  const conversations = data?.conversations || [];

  // Selected conversation object
  const activeConversation =
    conversations.find((c) => c._id === selectedConversationId) ||
    conversations[0] ||
    null;

  // Real-time stream for active conversation
  useChatStream(activeConversation?._id, {
    onMessage: () => {
      playMessageAlert();
      queryClient.invalidateQueries({ queryKey: queryKeys.support.all });
    },
  });

  // Agent Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: supportApi.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.support.all });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to dispatch message");
    },
  });

  const sendAgentMessage = useCallback(
    (text, attachments = []) => {
      if (!activeConversation?._id) return;
      sendMessageMutation.mutate({
        conversationId: activeConversation._id,
        text,
        attachments,
      });
    },
    [activeConversation, sendMessageMutation],
  );

  return {
    conversations,
    activeConversation,
    selectedConversationId: activeConversation?._id || null,
    setSelectedConversationId,
    conversationStatusFilter,
    setConversationStatusFilter,
    isLoading,
    sendAgentMessage,
    isSending: sendMessageMutation.isPending,
  };
}
