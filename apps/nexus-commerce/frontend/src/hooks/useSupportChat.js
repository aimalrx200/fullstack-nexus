// apps/nexus-commerce/frontend/src/hooks/useSupportChat.js
import { useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  setActiveConversation,
  setChatMessages,
  setUnreadCount,
  appendChatMessage,
  markAllOwnMessagesRead,
  setTypingIndicator,
  setWidgetOpen,
  resetUnreadCount,
} from "../redux/slices/supportChatSlice";
import { supportApi } from "../lib/api/supportApi";
import { queryKeys } from "../lib/api/queryKeys";
import { useChatStream } from "./useRealTimeSubsystems";
import { useAuth } from "./useAuth";
import { getSocket } from "../services/socketClient";
import { toast } from "sonner";

export function useSupportChat() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user, isStaff } = useAuth();

  const {
    activeConversationId,
    messages,
    isTyping,
    typingUserName,
    unreadCount,
    isWidgetOpen,
  } = useSelector((state) => state.supportChat);

  const typingTimeoutRef = useRef(null);
  const receiveTypingTimerRef = useRef(null);

  // 1. Check on mount if an existing conversation has unread messages
  const { isLoading: isConversationLoading, refetch: refetchConversation } =
    useQuery({
      queryKey: queryKeys.support.conversation(user?.id || "guest"),
      queryFn: async () => {
        const data = await supportApi.getOrCreateConversation({
          customerName: user?.name || "Shopper",
          customerEmail: user?.email || "guest@nexus.io",
        });

        if (data?.conversation?._id) {
          dispatch(setActiveConversation(data.conversation._id));
          dispatch(setChatMessages(data.messages || []));

          // Set unread count badge on mount if the chat widget is currently closed
          if (
            !isWidgetOpen &&
            typeof data.conversation.unreadCountCustomer === "number"
          ) {
            dispatch(setUnreadCount(data.conversation.unreadCountCustomer));
          }
        }
        return data;
      },
      enabled: !isStaff, // Queries on mount for shoppers without writing empty records to DB
      staleTime: 30000,
    });

  // 2. Real-Time Chat Stream
  const { isConnected } = useChatStream(activeConversationId, {
    onMessage: (msg) => {
      dispatch(appendChatMessage(msg));

      if (isWidgetOpen && msg.senderType === "admin") {
        supportApi.markConversationAsRead(activeConversationId);
      }
    },
    onTyping: (typingData) => {
      if (typingData.senderType === "admin") {
        dispatch(setTypingIndicator(typingData));

        if (receiveTypingTimerRef.current)
          clearTimeout(receiveTypingTimerRef.current);
        if (typingData.isTyping) {
          receiveTypingTimerRef.current = setTimeout(() => {
            dispatch(setTypingIndicator({ isTyping: false, senderName: "" }));
          }, 3500);
        }
      }
    },
    onRead: () => {
      dispatch(markAllOwnMessagesRead({ senderType: "customer" }));
    },
  });

  // 3. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: (payload) =>
      supportApi.sendMessage({
        ...payload,
        customerName: user?.name || "Shopper",
        customerEmail: user?.email || undefined,
      }),
    onSuccess: (data) => {
      const msg = data.message || data;
      const conv = data.conversation;

      if (conv?._id && !activeConversationId) {
        dispatch(setActiveConversation(conv._id));
      }

      dispatch(appendChatMessage(msg));
      queryClient.invalidateQueries({ queryKey: queryKeys.support.all });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to send message");
    },
  });

  // 4. Typing Indicator
  const emitTyping = useCallback(
    (typingState) => {
      if (!activeConversationId) return;

      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit("chat:typing", {
          conversationId: activeConversationId,
          isTyping: typingState,
        });
      }

      supportApi.emitTyping({
        conversationId: activeConversationId,
        isTyping: typingState,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (typingState) {
        typingTimeoutRef.current = setTimeout(() => {
          if (socket && socket.connected) {
            socket.emit("chat:typing", {
              conversationId: activeConversationId,
              isTyping: false,
            });
          }
          supportApi.emitTyping({
            conversationId: activeConversationId,
            isTyping: false,
          });
        }, 2500);
      }
    },
    [activeConversationId],
  );

  const openWidget = useCallback(() => {
    dispatch(setWidgetOpen(true));
    dispatch(resetUnreadCount());
    if (activeConversationId) {
      supportApi.markConversationAsRead(activeConversationId);
    }
  }, [dispatch, activeConversationId]);

  const closeWidget = useCallback(() => {
    dispatch(setWidgetOpen(false));
  }, [dispatch]);

  const toggleWidget = useCallback(() => {
    if (isWidgetOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  }, [isWidgetOpen, openWidget, closeWidget]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (receiveTypingTimerRef.current)
        clearTimeout(receiveTypingTimerRef.current);
    };
  }, []);

  return {
    activeConversationId,
    messages,
    isTyping,
    typingUserName,
    unreadCount,
    isWidgetOpen,
    isConnected,
    isConversationLoading,
    openWidget,
    closeWidget,
    toggleWidget,
    sendMessage: (text, attachments) =>
      sendMessageMutation.mutate({
        conversationId: activeConversationId,
        text,
        attachments,
      }),
    isSendingMessage: sendMessageMutation.isPending,
    emitTyping,
    refetchConversation,
  };
}
