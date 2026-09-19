import { useState, useMemo, useCallback } from "react";
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
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch conversations list with 3-second adaptive background polling
  const { data, isLoading: isListLoading } = useQuery({
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
    staleTime: 2000,
    refetchInterval: 3000, // 👈 Auto-polls in background every 3s as failover
    refetchIntervalInBackground: false,
  });

  const conversations = useMemo(
    () => data?.conversations ?? [],
    [data?.conversations],
  );
  const activeId = selectedConversationId ?? conversations[0]?._id ?? null;

  // 2. Fetch messages for the ACTIVE conversation with 2.5s polling
  const { data: activeThreadData, isLoading: isThreadLoading } = useQuery({
    queryKey: ["support", "conversation", activeId],
    queryFn: () => supportApi.getConversationMessages(activeId),
    enabled: Boolean(activeId),
    staleTime: 1000,
    refetchInterval: 2500, // 👈 Auto-polls active chat every 2.5s
    refetchIntervalInBackground: false,
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

  // Click handler that switches conversation AND immediately clears the red unread badge
  const handleSelectConversation = useCallback(
    (convId) => {
      setSelectedConversationId(convId);

      // Instantly clear the red unread badge in the conversation list cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.support.all },
        (oldData) => {
          if (!oldData?.conversations) return oldData;
          return {
            ...oldData,
            conversations: oldData.conversations.map((c) =>
              c._id === convId ? { ...c, unreadCountAdmin: 0 } : c,
            ),
          };
        },
      );
    },
    [queryClient],
  );

  // 3. Instant Push Listener: Active Conversation Room
  useChatStream(activeId, {
    onMessage: (newMsg) => {
      playMessageAlert();
      // Optimistically push to active chat window
      queryClient.setQueryData(["support", "conversation", activeId], (old) => {
        if (!old) return old;
        const exists = old.messages?.some((m) => m._id === newMsg._id);
        if (exists) return old;
        return {
          ...old,
          messages: [...(old.messages ?? []), newMsg],
        };
      });
      // Invalidate list to refresh last message timestamps
      queryClient.invalidateQueries({ queryKey: queryKeys.support.all });
    },
  });

  // 4. Instant Push Listener: Global Merchant Support Stream
  useRealTimeStream({
    channelType: "admin",
    events: {
      "chat:conversation_updated": (payload) => {
        playMessageAlert();
        queryClient.invalidateQueries({ queryKey: queryKeys.support.all });
        if (payload?.conversation?._id === activeId && payload?.lastMessage) {
          queryClient.setQueryData(
            ["support", "conversation", activeId],
            (old) => {
              if (!old) return old;
              const exists = old.messages?.some(
                (m) => m._id === payload.lastMessage._id,
              );
              if (exists) return old;
              return {
                ...old,
                messages: [...(old.messages ?? []), payload.lastMessage],
              };
            },
          );
        }
      },
      "chat:new_conversation": () => {
        playMessageAlert();
        toast.info("💬 New customer support inquiry received!");
        queryClient.invalidateQueries({ queryKey: queryKeys.support.all });
      },
    },
  });

  // 5. Send Message Mutation
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
    setSelectedConversationId: handleSelectConversation,
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
