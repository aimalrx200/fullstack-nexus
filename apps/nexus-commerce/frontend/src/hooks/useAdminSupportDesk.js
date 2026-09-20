// apps/nexus-commerce/frontend/src/hooks/useAdminSupportDesk.js
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
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  const conversations = useMemo(
    () => data?.conversations ?? [],
    [data?.conversations],
  );
  const activeId = selectedConversationId;

  // 2. Fetch messages for ACTIVE conversation
  const { data: activeThreadData, isLoading: isThreadLoading } = useQuery({
    queryKey: ["support", "conversation", activeId],
    queryFn: () => supportApi.getConversationMessages(activeId),
    enabled: Boolean(activeId),
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const activeConversation = useMemo(() => {
    if (!activeId) return null;
    if (activeThreadData?.conversation) {
      return {
        ...activeThreadData.conversation,
        messages: activeThreadData.messages ?? [],
      };
    }
    return conversations.find((c) => c._id === activeId) ?? null;
  }, [activeThreadData, conversations, activeId]);

  // SELECT CONVERSATION
  const handleSelectConversation = useCallback(
    (convId) => {
      setSelectedConversationId(convId);
      setIsTyping(false);

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

      queryClient.invalidateQueries({
        queryKey: ["support", "conversation", convId],
      });
    },
    [queryClient],
  );

  // 3. Push Listener: Active Conversation Room
  useChatStream(activeId, {
    onMessage: (newMsg) => {
      queryClient.setQueryData(["support", "conversation", activeId], (old) => {
        if (!old) return old;
        const exists = old.messages?.some((m) => m._id === newMsg._id);
        if (exists) return old;
        return {
          ...old,
          messages: [...(old.messages ?? []), newMsg],
        };
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
    onRead: () => {
      // Mark all admin messages as read in active thread
      queryClient.setQueryData(["support", "conversation", activeId], (old) => {
        if (!old?.messages) return old;
        return {
          ...old,
          messages: old.messages.map((m) =>
            m.senderType === "admin" ? { ...m, isRead: true } : m,
          ),
        };
      });
    },
  });

  // 4. Push Listener: Global Merchant Stream
  useRealTimeStream({
    channelType: "admin",
    events: {
      "chat:conversation_updated": (payload) => {
        const convId = payload?.conversation?._id;
        const lastMsg = payload?.lastMessage;

        if (convId && convId === activeId && lastMsg) {
          queryClient.setQueryData(
            ["support", "conversation", activeId],
            (old) => {
              if (!old) return old;
              const exists = old.messages?.some((m) => m._id === lastMsg._id);
              if (exists) return old;
              return {
                ...old,
                messages: [...(old.messages ?? []), lastMsg],
              };
            },
          );
        }

        if (
          convId &&
          convId !== activeId &&
          lastMsg?.senderType === "customer"
        ) {
          playMessageAlert();
        }

        queryClient.setQueriesData(
          { queryKey: queryKeys.support.all },
          (oldData) => {
            if (!oldData?.conversations) return oldData;
            return {
              ...oldData,
              conversations: oldData.conversations.map((c) => {
                if (c._id === convId) {
                  return {
                    ...c,
                    lastMessageAt:
                      payload.conversation?.lastMessageAt ||
                      new Date().toISOString(),
                    unreadCountAdmin:
                      convId === activeId
                        ? 0
                        : (c.unreadCountAdmin || 0) +
                          (lastMsg?.senderType === "customer" ? 1 : 0),
                  };
                }
                return c;
              }),
            };
          },
        );
      },
      "chat:new_conversation": (newConv) => {
        playMessageAlert();
        toast.info(
          `💬 New inquiry from ${newConv?.customerName || "a customer"}`,
        );

        queryClient.setQueriesData(
          { queryKey: queryKeys.support.all },
          (oldData) => {
            if (!oldData?.conversations) return oldData;
            const exists = oldData.conversations.some(
              (c) => c._id === newConv?._id,
            );
            if (exists) return oldData;
            return {
              ...oldData,
              conversations: [
                {
                  ...newConv,
                  unreadCountAdmin: newConv._id === activeId ? 0 : 1,
                },
                ...oldData.conversations,
              ],
              total: (oldData.total || 0) + 1,
            };
          },
        );
      },
    },
  });

  // 5. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: supportApi.sendMessage,
    onSuccess: (data) => {
      const newMsg = data.message || data;

      queryClient.setQueryData(["support", "conversation", activeId], (old) => {
        if (!old) return old;
        const exists = old.messages?.some((m) => m._id === newMsg._id);
        if (exists) return old;
        return {
          ...old,
          messages: [...(old.messages ?? []), newMsg],
        };
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

  const emitAgentTyping = useCallback(
    (typingState) => {
      if (!activeId) return;
      supportApi.emitTyping({
        conversationId: activeId,
        isTyping: typingState,
      });
    },
    [activeId],
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
    emitAgentTyping,
    isSending: sendMessageMutation.isPending,
    isTyping,
    typingUserName,
  };
}
