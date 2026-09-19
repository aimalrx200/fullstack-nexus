import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportApi } from "../lib/api/supportApi";
import { queryKeys } from "../lib/api/queryKeys";
import { useChatStream } from "./useRealTimeSubsystems";
import { useRealTimeStream } from "./useRealTimeStream";
import { playMessageAlert } from "../services/soundEffects";
import { toast } from "sonner";

export function useAdminSupportDesk() {
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [conversationStatusFilter, setConversationStatusFilter] =
    useState("ALL");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all"); // 'all' | 'customers' | 'guests'
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Query conversations list with filters
  const { data: conversationsData, isLoading: isListLoading } = useQuery({
    queryKey: queryKeys.support.adminConversations({
      status: conversationStatusFilter,
      type: customerTypeFilter,
      search: searchQuery,
    }),
    queryFn: () =>
      supportApi.getAllConversations({
        status: conversationStatusFilter,
        type: customerTypeFilter,
        search: searchQuery,
      }),
    staleTime: 5000,
  });

  const conversations = conversationsData?.conversations || [];

  // If no conversation selected, default to the first one available
  const activeConversationId =
    selectedConversationId || conversations[0]?._id || null;

  // 2. Fetch full message thread whenever an admin clicks/switches a conversation
  const { data: threadData, isLoading: isThreadLoading } = useQuery({
    queryKey: ["support", "thread", activeConversationId],
    queryFn: () => supportApi.getConversationMessages(activeConversationId),
    enabled: Boolean(activeConversationId),
    staleTime: 0,
  });

  const activeConversation = threadData
    ? {
        ...threadData.conversation,
        messages: threadData.messages || [],
      }
    : conversations.find((c) => c._id === activeConversationId) || null;

  // 3. Listen to the active conversation's specific room
  useChatStream(activeConversationId, {
    onMessage: (newMsg) => {
      playMessageAlert();
      // Optimistically update thread cache
      queryClient.setQueryData(
        ["support", "thread", activeConversationId],
        (old) => {
          if (!old) return old;
          const exists = old.messages?.some((m) => m._id === newMsg._id);
          if (exists) return old;
          return {
            ...old,
            messages: [...(old.messages || []), newMsg],
          };
        },
      );
      // Invalidate conversation list to update lastMessageAt & unread counts
      queryClient.invalidateQueries({ queryKey: queryKeys.support.all });
    },
  });

  // 4. Global Admin Support Radar: Invalidate list when ANY conversation gets a new message
  useRealTimeStream({
    channelType: "admin",
    events: {
      "chat:conversation_updated": () => {
        playMessageAlert();
        queryClient.invalidateQueries({ queryKey: queryKeys.support.all });
      },
      "chat:new_conversation": () => {
        playMessageAlert();
        toast.info("💬 New customer support inquiry received!");
        queryClient.invalidateQueries({ queryKey: queryKeys.support.all });
      },
    },
  });

  // 5. Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: supportApi.sendMessage,
    onSuccess: (newMsg) => {
      queryClient.setQueryData(
        ["support", "thread", activeConversationId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [...(old.messages || []), newMsg],
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.support.all });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to dispatch message");
    },
  });

  const sendAgentMessage = useCallback(
    (text, attachments = []) => {
      if (!activeConversationId) return;
      sendMessageMutation.mutate({
        conversationId: activeConversationId,
        text,
        attachments,
      });
    },
    [activeConversationId, sendMessageMutation],
  );

  return {
    conversations,
    activeConversation,
    selectedConversationId: activeConversationId,
    setSelectedConversationId,
    conversationStatusFilter,
    setConversationStatusFilter,
    customerTypeFilter,
    setCustomerTypeFilter,
    searchQuery,
    setSearchQuery,
    isLoading: isListLoading || isThreadLoading,
    sendAgentMessage,
    isSending: sendMessageMutation.isPending,
  };
}
