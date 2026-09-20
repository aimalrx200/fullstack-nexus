// apps/nexus-commerce/frontend/src/components/storefront/support/SupportChatWidget.jsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  ShieldCheck,
  FileQuestion,
  ChevronDown,
} from "lucide-react";
import { useSupportChat } from "../../../hooks/useSupportChat";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInputBox } from "./ChatInputBox";
import { OfflineTicketForm } from "./OfflineTicketForm";

export function SupportChatWidget() {
  const {
    activeConversationId,
    messages,
    isTyping,
    typingUserName,
    unreadCount,
    isWidgetOpen,
    isConnected,
    toggleWidget,
    closeWidget,
    sendMessage,
    isSendingMessage,
    emitTyping,
  } = useSupportChat();

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const isOnline = isConnected || !activeConversationId;

  // Header subtitle switches to "Aimal is typing..." if admin is typing
  const statusLabel = isTyping
    ? `${typingUserName || "Agent"} is typing...`
    : isConnected
      ? "Live Stream Connected"
      : !activeConversationId
        ? "Live Support Online"
        : "Reconnecting to live channel...";

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* 1. Floating Launcher Bubble */}
      <AnimatePresence>
        {!isWidgetOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleWidget}
            className="relative min-h-14 min-w-14 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/30 flex items-center justify-center cursor-pointer border border-white/20"
            aria-label="Open customer support chat"
          >
            <MessageSquare className="w-6 h-6" />

            {/* Unread Counter Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-md animate-bounce">
                {unreadCount}
              </span>
            )}

            {/* Pulsing Live Beacon */}
            <span className="absolute bottom-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 2. Floating Chat Window Frame */}
      <AnimatePresence>
        {isWidgetOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-96 h-[85vh] sm:h-135 max-h-150 bg-surface-card border border-border-main sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-50"
          >
            {/* Window Header */}
            <div className="px-4 py-3.5 bg-surface-card border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-main leading-tight flex items-center gap-1.5">
                    <span>Live Customer Desk</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isTyping
                          ? "bg-brand-primary animate-ping"
                          : isOnline
                            ? "bg-emerald-400 animate-pulse"
                            : "bg-amber-400"
                      }`}
                    />
                  </h3>
                  <span
                    className={`text-[10px] font-mono transition-colors ${
                      isTyping
                        ? "text-brand-primary font-bold animate-pulse"
                        : "text-text-muted"
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(true)}
                  className="min-h-9 px-2 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-elevated text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Create Offline Support Ticket"
                >
                  <FileQuestion className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ticket</span>
                </button>

                <button
                  type="button"
                  onClick={closeWidget}
                  className="min-h-9 min-w-9 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-elevated flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Minimize support window"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Message Feed */}
            <ChatMessageList
              messages={messages}
              isTyping={isTyping}
              typingUserName={typingUserName}
            />

            {/* Input Tray */}
            <ChatInputBox
              onSendMessage={sendMessage}
              onTyping={emitTyping}
              isSending={isSendingMessage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Ticket Creation Modal */}
      <OfflineTicketForm
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
    </div>,
    document.body,
  );
}
