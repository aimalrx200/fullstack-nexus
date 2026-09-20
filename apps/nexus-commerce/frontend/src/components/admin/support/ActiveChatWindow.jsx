// apps/nexus-commerce/frontend/src/components/admin/support/ActiveChatWindow.jsx
import React, { useState } from "react";
import { ChatMessageList } from "../../storefront/support/ChatMessageList";
import { ChatInputBox } from "../../storefront/support/ChatInputBox";
import { CannedResponsePicker } from "./CannedResponsePicker";
import { ShieldCheck, Smartphone, User, ArrowLeft, Info } from "lucide-react";

export function ActiveChatWindow({
  conversation,
  onSendMessage,
  onTyping,
  onBack,
  onToggleContext,
  isSending,
  isTyping = false,
  typingUserName = "",
}) {
  const [draftText, setDraftText] = useState("");

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-text-muted font-mono space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-border-main flex items-center justify-center text-text-faint shadow-inner">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-sm">
          <p className="font-semibold text-text-main text-sm">
            No conversation selected
          </p>
          <p className="text-[11px] text-text-muted">
            Select an inquiry from the inbox on the left to start live
            messaging.
          </p>
        </div>
      </div>
    );
  }

  const isGuest = !conversation.customerId;

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-app min-w-0">
      {/* Header Bar */}
      <div className="px-3.5 sm:px-5 py-3 bg-surface-card border-b border-border-main flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Mobile Back Button (Visible on < 1024px) */}
          <button
            type="button"
            onClick={onBack}
            className="lg:hidden w-8 h-8 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-main shrink-0"
            aria-label="Back to Inbox"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center font-mono font-bold text-xs shadow-xs shrink-0 ${
              isGuest
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
            }`}
          >
            {isGuest ? (
              <Smartphone className="w-4 h-4" />
            ) : (
              conversation.customerName?.[0] || <User className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-xs font-bold text-text-main leading-tight truncate">
                {conversation.customerName ||
                  (isGuest ? "Guest Shopper" : "Customer")}
              </h3>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md font-bold shrink-0 ${
                  isGuest
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                    : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                }`}
              >
                {isGuest ? "GUEST" : "VIP"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-text-muted truncate block">
              {conversation.customerEmail}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Shopper Details Drawer Trigger (Visible on < 1280px) */}
          <button
            type="button"
            onClick={onToggleContext}
            className="xl:hidden px-2.5 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-hover text-text-muted hover:text-text-main border border-border-subtle text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Inspect Cart & Profile"
          >
            <Info className="w-3.5 h-3.5 text-brand-primary" />
            <span className="hidden sm:inline">Context</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Feed</span>
          </div>
        </div>
      </div>

      {/* Messenger Feed */}
      <ChatMessageList
        messages={conversation.messages || []}
        isAgentView={true}
        isTyping={isTyping}
        typingUserName={typingUserName}
      />

      {/* Canned Responses Quick Toolbar */}
      <CannedResponsePicker
        onSelectResponse={(templateText) => {
          setDraftText((prev) =>
            prev ? `${prev} ${templateText}` : templateText,
          );
        }}
      />

      {/* Chat Input Tray */}
      <ChatInputBox
        value={draftText}
        onValueChange={setDraftText}
        onSendMessage={(text, attachments) => {
          onSendMessage(text, attachments);
          setDraftText("");
        }}
        onTyping={onTyping}
        isSending={isSending}
      />
    </div>
  );
}
