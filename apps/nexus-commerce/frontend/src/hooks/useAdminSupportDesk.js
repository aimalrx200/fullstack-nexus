import { useState, useMemo, useCallback, useRef } from "react";
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

  const [isTyping, setIsTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState("");
  const typingTimerRef = useRef(null);

  // 1. Fetch conversations list
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
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const conversations = useMemo(
    () => data?.conversations ?? [],
    [data?.conversations],
  );

  // STABLE SELECTION: Default to first item ONLY ONCE on mount without hijacking when new messages arrive
  const activeId = useMemo(() => {
    if (selectedConversationId) return selectedConversationId;
    return conversations[0]?._id ?? null;
  }, [selectedConversationId, conversations]);

  // 2. Fetch messages for the ACTIVE conversation
  const { data: activeThreadData, isLoading: isThreadLoading } = useQuery({
    queryKey: ["support", "conversation", activeId],
    queryFn: () => supportApi.getConversationMessages(activeId),
    enabled: Boolean(activeId),
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const activeConversation = useMemo(() => {
    if (activeThreadData?.conversation) {
      return {
        ...activeThreadData.conversation,
        messages: activeThreadData.messages ?? [],
      };
    }
    return conversations.find((c) => c._id === activeId) ?? null;
  }, [activeThreadData, conversations, activeId]);

  // SELECT CONVERSATION: Instantly clears unread badge in cache and sets selection
  const handleSelectConversation = useCallback(
    (convId) => {
      setSelectedConversationId(convId);
      setIsTyping(false);

      // Optimistically clear the unread badge in memory
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

      // Fetch fresh messages
      queryClient.invalidateQueries({
        queryKey: ["support", "conversation", convId],
      });
    },
    [queryClient],
  );

  // 3. Push Listener: Active Conversation Room
  useChatStream(activeId, {
    onMessage: (newMsg) => {
      // Deduplicated message append
      queryClient.setQueryData(["support", "conversation", activeId], (old) => {
        if (!old) return old;
        const exists = old.messages?.some((m) => m._id === newMsg._id);
        if (exists) return old;
        return {
          ...old,
          messages: [...(old.messages ?? []), newMsg],
        };
      });

      // Update sidebar timestamps without changing active conversation
      queryClient.invalidateQueries({
        queryKey: queryKeys.support.adminConversations({
          status: conversationStatusFilter,
          type: customerTypeFilter,
          search: searchQuery,
        }),
      });
    },
    onTyping: (typingData) => {
      setIsTyping(Boolean(typingData.isTyping));
      setTypingUserName(typingData.senderName || "Customer");

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (typingData.isTyping) {
        typingTimerRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3500);
      }
    },
  });

  // 4. Push Listener: Global Merchant Stream (New threads and background conversation updates)
  useRealTimeStream({
    channelType: "admin",
    events: {
      "chat:conversation_updated": (payload) => {
        const convId = payload?.conversation?._id;

        // If message belongs to active conversation, append it
        if (convId === activeId && payload?.lastMessage) {
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

        // If message is for a background conversation, play sound & update sidebar badge
        if (
          convId !== activeId &&
          payload?.lastMessage?.senderType === "customer"
        ) {
          playMessageAlert();
        }

        queryClient.invalidateQueries({
          queryKey: queryKeys.support.adminConversations({
            status: conversationStatusFilter,
            type: customerTypeFilter,
            search: searchQuery,
          }),
        });
      },
      "chat:new_conversation": () => {
        playMessageAlert();
        toast.info("💬 New customer inquiry received!");
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
        const exists = old.messages?.some((m) => m._id === newMsg._id);
        if (exists) return old;
        return {
          ...old,
          messages: [...(old.messages ?? []), newMsg],
        };
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.support.adminConversations({
          status: conversationStatusFilter,
          type: customerTypeFilter,
          search: searchQuery,
        }),
      });
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
    isTyping,
    typingUserName,
  };
}
