// apps/nexus-commerce/frontend/src/hooks/useSupportChat.js
import { useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  setActiveConversation,
  setChatMessages,
  appendChatMessage,
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

  // 1. Fetch active conversation ONLY if already open (DO NOT auto-create empty DB records)
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
        }
        return data;
      },
      enabled: isWidgetOpen && !isStaff, // Only query when chat widget is actually opened by a shopper
      staleTime: 5000,
    });

  // 2. Bind Real-Time Stream
  const { isConnected } = useChatStream(activeConversationId, {
    onMessage: (msg) => {
      dispatch(appendChatMessage(msg));
    },
    onTyping: (typingData) => {
      dispatch(setTypingIndicator(typingData));
    },
  });

  // 3. Send Message Mutation (Creates thread on first message)
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

  // 4. Typing indicator with auto-timeout
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
        }, 3000);
      }
    },
    [activeConversationId],
  );

  const openWidget = useCallback(() => {
    dispatch(setWidgetOpen(true));
    dispatch(resetUnreadCount());
  }, [dispatch]);

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
