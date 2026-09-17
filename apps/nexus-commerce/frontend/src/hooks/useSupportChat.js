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
  const { user } = useAuth();

  const {
    activeConversationId,
    messages,
    isTyping,
    typingUserName,
    unreadCount,
    isWidgetOpen,
  } = useSelector((state) => state.supportChat);

  const typingTimeoutRef = useRef(null);

  // 1. Query or Create Active Conversation
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
      staleTime: 5 * 60 * 1000,
    });

  // 2. Bind Real-Time Stream (SSE in Prod / Socket.io in Dev)
  const { isConnected } = useChatStream(activeConversationId, {
    onMessage: (msg) => {
      dispatch(appendChatMessage(msg));
    },
    onTyping: (typingData) => {
      dispatch(setTypingIndicator(typingData));
    },
    onRead: () => {
      // Handled automatically
    },
  });

  // 3. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: supportApi.sendMessage,
    onSuccess: (newMsg) => {
      dispatch(appendChatMessage(newMsg));
      queryClient.invalidateQueries({ queryKey: queryKeys.support.all });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to send message");
    },
  });

  // 4. Emit Typing Indicator (with auto-reset)
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

  // 5. Open/Close Widget Handlers
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

  // Cleanup timers on unmount
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
