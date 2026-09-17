import React from "react";
import { ChatMessageList } from "../../storefront/support/ChatMessageList";
import { ChatInputBox } from "../../storefront/support/ChatInputBox";
import { CannedResponsePicker } from "./CannedResponsePicker";
import { ShieldCheck } from "lucide-react";

export function ActiveChatWindow({ conversation, onSendMessage, isSending }) {
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-text-muted font-mono">
        Select a customer conversation to start responding.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-app">
      {/* Header */}
      <div className="px-5 py-3.5 bg-surface-card border-b border-border-main flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold font-mono">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text-main leading-tight">
              {conversation.customerName}
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">
              Active Support Channel
            </span>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <ChatMessageList messages={conversation.messages || []} />

      {/* Canned Responses */}
      <CannedResponsePicker onSelectResponse={(text) => onSendMessage(text)} />

      {/* Agent Input Tray */}
      <ChatInputBox onSendMessage={onSendMessage} isSending={isSending} />
    </div>
  );
}
