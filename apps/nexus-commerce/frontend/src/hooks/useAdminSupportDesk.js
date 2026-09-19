import { useState, useMemo, useCallback } from "react";
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

  // 1. Fetch conversations list
  const { data, isLoading: isListLoading } = useQuery({
    queryKey: queryKeys.support.adminConversations({
      status: conversationStatusFilter,
    }),
    queryFn: () =>
      supportApi.getAllConversations({ status: conversationStatusFilter }),
    staleTime: 10 * 1000,
  });

  // Stable reference to conversations array
  const conversations = useMemo(
    () => data?.conversations ?? [],
    [data?.conversations],
  );

  // Derived state: Use explicit user selection, or fallback to the first conversation
  const activeId = selectedConversationId ?? conversations[0]?._id ?? null;

  // 2. Fetch messages for the ACTIVE conversation
  const { data: activeThreadData, isLoading: isThreadLoading } = useQuery({
    queryKey: ["support", "conversation", activeId],
    queryFn: () => supportApi.getConversationMessages(activeId),
    enabled: Boolean(activeId),
    staleTime: 0,
  });

  const activeConversation = useMemo(() => {
    if (activeThreadData) {
      return {
        ...activeThreadData.conversation,
        messages: activeThreadData.messages ?? [],
      };
    }
    return conversations.find((c) => c._id === activeId) ?? null;
  }, [activeThreadData, conversations, activeId]);

  // 3. Bind real-time stream to the active conversation
  useChatStream(activeId, {
    onMessage: (newMsg) => {
      playMessageAlert();
      // Optimistically push message into the active thread query cache
      queryClient.setQueryData(["support", "conversation", activeId], (old) => {
        if (!old) return old;
        const exists = old.messages?.some((m) => m._id === newMsg._id);
        if (exists) return old;
        return {
          ...old,
          messages: [...(old.messages ?? []), newMsg],
        };
      });
      // Invalidate list to update lastMessageAt timestamp & unread counters
      queryClient.invalidateQueries({ queryKey: queryKeys.support.all });
    },
  });

  // 4. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: supportApi.sendMessage,
    onSuccess: (newMsg) => {
      queryClient.setQueryData(["support", "conversation", activeId], (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...(old.messages ?? []), newMsg],
        };
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.support.all });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to dispatch message");
    },
  });

  const sendAgentMessage = useCallback(
    (text, attachments = []) => {
      if (!activeId) return;
      sendMessageMutation.mutate({
        conversationId: activeId,
        text,
        attachments,
      });
    },
    [activeId, sendMessageMutation],
  );

  return {
    conversations,
    activeConversation,
    selectedConversationId: activeId,
    setSelectedConversationId,
    conversationStatusFilter,
    setConversationStatusFilter,
    isLoading: isListLoading || isThreadLoading,
    sendAgentMessage,
    isSending: sendMessageMutation.isPending,
  };
}
