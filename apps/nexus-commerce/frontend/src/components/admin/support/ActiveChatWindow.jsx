import React, { useState } from "react";
import { ChatMessageList } from "../../storefront/support/ChatMessageList";
import { ChatInputBox } from "../../storefront/support/ChatInputBox";
import { CannedResponsePicker } from "./CannedResponsePicker";
import { ShieldCheck, Smartphone, User } from "lucide-react";

export function ActiveChatWindow({
  conversation,
  onSendMessage,
  isSending,
  isTyping = false,
  typingUserName = "",
}) {
  const [draftText, setDraftText] = useState("");

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-text-muted font-mono space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border-main flex items-center justify-center text-text-faint">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <p className="font-semibold text-text-main">No conversation selected</p>
        <p className="text-[11px] text-text-faint">
          Select an inquiry from the inbox on the left to start live messaging.
        </p>
      </div>
    );
  }

  const isGuest = !conversation.customerId;

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-app min-w-0">
      {/* Header */}
      <div className="px-5 py-3.5 bg-surface-card border-b border-border-main flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center font-mono font-bold text-xs shadow-xs ${
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
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-text-main leading-tight">
                {conversation.customerName ||
                  (isGuest ? "Guest Shopper" : "Customer")}
              </h3>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                  isGuest
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                    : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                }`}
              >
                {isGuest ? "GUEST" : "VIP"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-text-muted">
              {conversation.customerEmail}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Support Active</span>
        </div>
      </div>

      {/* Messenger Feed: Agent messages aligned Right, Customer messages aligned Left */}
      <ChatMessageList
        messages={conversation.messages || []}
        isAgentView={true}
        isTyping={isTyping}
        typingUserName={typingUserName}
      />

      {/* Canned Responses Toolbar */}
      <CannedResponsePicker
        onSelectResponse={(templateText) => {
          setDraftText((prev) =>
            prev ? `${prev} ${templateText}` : templateText,
          );
        }}
      />

      {/* Input Tray */}
      <ChatInputBox
        value={draftText}
        onValueChange={setDraftText}
        onSendMessage={(text, attachments) => {
          onSendMessage(text, attachments);
          setDraftText("");
        }}
        isSending={isSending}
      />
    </div>
  );
}
