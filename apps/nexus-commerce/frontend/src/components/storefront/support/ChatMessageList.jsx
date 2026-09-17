import React, { useEffect, useRef } from "react";
import { format } from "date-fns";
import { ShieldCheck, User, Paperclip, Check } from "lucide-react";

export function ChatMessageList({ messages = [], isTyping, typingUserName }) {
  const scrollBottomRef = useRef(null);

  // Auto-scroll on new incoming message or typing status change
  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
      {/* Welcome Intro Header */}
      <div className="text-center py-3 space-y-1">
        <div className="w-10 h-10 mx-auto rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-bold text-text-main">
          Nexus Commerce Concierge
        </h4>
        <p className="text-[11px] text-text-muted max-w-60 mx-auto leading-relaxed">
          Ask us about order fulfillment, sizing, dynamic FX rates, or payment
          questions.
        </p>
      </div>

      {/* Message Bubbles */}
      {messages.map((msg) => {
        const isAdmin = msg.senderType === "admin";
        const isCustomer = msg.senderType === "customer";
        const isSystem = msg.senderType === "system";

        if (isSystem) {
          return (
            <div key={msg._id} className="text-center my-2">
              <span className="px-2.5 py-1 rounded-full bg-surface-elevated text-[10px] font-mono text-text-muted border border-border-subtle">
                {msg.text}
              </span>
            </div>
          );
        }

        return (
          <div
            key={msg._id}
            className={`flex items-end gap-2 ${
              isCustomer ? "justify-end" : "justify-start"
            } animate-in fade-in slide-in-from-bottom-1`}
          >
            {/* Admin Avatar */}
            {isAdmin && (
              <div className="w-7 h-7 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}

            {/* Bubble Container */}
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs space-y-1.5 ${
                isCustomer
                  ? "bg-brand-primary text-white rounded-br-xs"
                  : "bg-surface-elevated text-text-main border border-border-main rounded-bl-xs"
              }`}
            >
              {/* Sender Name for Admin */}
              {isAdmin && (
                <span className="text-[10px] font-bold text-brand-primary block font-mono">
                  {msg.senderName || "Support Specialist"}
                </span>
              )}

              {/* Message Body */}
              <p className="leading-relaxed whitespace-pre-wrap wrap-break-word text-xs">
                {msg.text}
              </p>

              {/* Attachments (if any) */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="space-y-1 pt-1">
                  {msg.attachments.map((att, i) => (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 p-1.5 rounded-lg text-[11px] font-mono transition-opacity hover:opacity-80 ${
                        isCustomer
                          ? "bg-white/15 text-white"
                          : "bg-surface-card text-text-main border border-border-subtle"
                      }`}
                    >
                      <Paperclip className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-35">
                        {att.fileName || "Attachment"}
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {/* Timestamp & Read Status */}
              <div
                className={`flex items-center justify-end gap-1 text-[9px] font-mono ${
                  isCustomer ? "text-white/70" : "text-text-faint"
                }`}
              >
                <span>
                  {msg.createdAt
                    ? format(new Date(msg.createdAt), "HH:mm")
                    : ""}
                </span>
                {isCustomer && <Check className="w-2.5 h-2.5" />}
              </div>
            </div>

            {/* Customer Avatar */}
            {isCustomer && (
              <div className="w-7 h-7 rounded-xl bg-surface-elevated border border-border-main flex items-center justify-center text-text-muted shrink-0 text-[11px] font-mono">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        );
      })}

      {/* Live Typing Indicator */}
      {isTyping && (
        <div className="flex items-center gap-2 text-left animate-in fade-in">
          <div className="w-7 h-7 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="px-3 py-2 rounded-2xl bg-surface-elevated border border-border-main text-text-muted text-xs flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-text-muted">
              {typingUserName || "Agent"} is typing
            </span>
            <span className="flex gap-0.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce" />
            </span>
          </div>
        </div>
      )}

      <div ref={scrollBottomRef} />
    </div>
  );
}
