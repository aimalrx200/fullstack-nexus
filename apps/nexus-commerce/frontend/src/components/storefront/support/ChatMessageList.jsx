import React, { useEffect, useRef, useMemo } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { ShieldCheck, User, Paperclip, Check, CheckCheck } from "lucide-react";

/**
 * Formats date section dividers (e.g. "Today", "Yesterday", "Oct 14, 2026")
 */
function formatDateDivider(dateString) {
  if (!dateString) return "Recent";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recent";
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

export function ChatMessageList({
  messages = [],
  isTyping,
  typingUserName,
  isAgentView = false,
}) {
  const scrollBottomRef = useRef(null);

  // Group messages chronologically with date section headers
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentGroup = null;

    messages.forEach((msg) => {
      const divider = formatDateDivider(msg.createdAt);
      if (!currentGroup || currentGroup.date !== divider) {
        currentGroup = { date: divider, items: [] };
        groups.push(currentGroup);
      }
      currentGroup.items.push(msg);
    });

    return groups;
  }, [messages]);

  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar bg-surface-app/40">
      {/* Intro Header */}
      {messages.length === 0 && (
        <div className="text-center py-10 space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="text-xs font-bold text-text-main">
            {isAgentView
              ? "Customer Conversation Thread"
              : "Nexus Concierge Live Help"}
          </h4>
          <p className="text-[11px] text-text-muted max-w-xs mx-auto leading-relaxed">
            {isAgentView
              ? "This customer is connected. Reply directly using the input tray below."
              : "Ask us about order fulfillment, sizing, dynamic FX rates, or payments."}
          </p>
        </div>
      )}

      {/* Date Sections */}
      {groupedMessages.map((group, groupIdx) => (
        <div key={groupIdx} className="space-y-3">
          {/* Section Date Pill Divider */}
          <div className="flex items-center justify-center my-3">
            <span className="px-3 py-1 rounded-full bg-surface-elevated/90 border border-border-subtle text-[10px] font-mono text-text-muted shadow-xs">
              {group.date}
            </span>
          </div>

          {/* Messages in this section */}
          <div className="space-y-2">
            {group.items.map((msg, idx) => {
              // In Agent View: Admin is "Me" (Right), Customer is "Other" (Left)
              // In Customer View: Customer is "Me" (Right), Admin is "Other" (Left)
              const isMe = isAgentView
                ? msg.senderType === "admin"
                : msg.senderType === "customer";
              const isSystem = msg.senderType === "system";

              if (isSystem) {
                return (
                  <div key={msg._id || idx} className="text-center my-2">
                    <span className="px-2.5 py-1 rounded-full bg-surface-elevated text-[10px] font-mono text-text-muted border border-border-subtle">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const nextMsg = group.items[idx + 1];
              const isLastInSequence =
                !nextMsg || nextMsg.senderType !== msg.senderType;

              return (
                <div
                  key={msg._id || idx}
                  className={`flex items-end gap-2 ${
                    isMe ? "justify-end" : "justify-start"
                  } animate-in fade-in duration-150`}
                >
                  {/* Left Avatar for Other Person (shown on last message of sequence) */}
                  {!isMe && (
                    <div className="w-7 h-7 rounded-xl bg-surface-elevated border border-border-main flex items-center justify-center text-text-muted shrink-0 text-xs font-mono font-bold shadow-xs">
                      {isLastInSequence ? (
                        msg.senderType === "admin" ? (
                          <ShieldCheck className="w-4 h-4 text-brand-primary" />
                        ) : (
                          <User className="w-3.5 h-3.5" />
                        )
                      ) : (
                        <div className="w-7" />
                      )}
                    </div>
                  )}

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[75%] sm:max-w-[65%] space-y-1 ${isMe ? "items-end" : "items-start"}`}
                  >
                    {/* Sender Name label for first message in sequence */}
                    {!isMe &&
                      (idx === 0 ||
                        group.items[idx - 1]?.senderType !==
                          msg.senderType) && (
                        <span className="text-[10px] font-mono font-semibold text-text-faint px-1">
                          {msg.senderName ||
                            (msg.senderType === "admin"
                              ? "Support Agent"
                              : "Customer")}
                        </span>
                      )}

                    <div
                      className={`p-3 rounded-2xl text-xs shadow-xs space-y-1.5 ${
                        isMe
                          ? "bg-brand-primary text-white rounded-br-xs"
                          : "bg-surface-elevated text-text-main border border-border-main rounded-bl-xs"
                      }`}
                    >
                      {/* Message Content */}
                      <p className="leading-relaxed whitespace-pre-wrap wrap-break-word text-xs">
                        {msg.text}
                      </p>

                      {/* File Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="space-y-1 pt-1">
                          {msg.attachments.map((att, i) => (
                            <a
                              key={i}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-1.5 p-1.5 rounded-lg text-[11px] font-mono transition-opacity hover:opacity-80 ${
                                isMe
                                  ? "bg-white/15 text-white"
                                  : "bg-surface-card text-text-main border border-border-subtle"
                              }`}
                            >
                              <Paperclip className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-40">
                                {att.fileName || "Attachment"}
                              </span>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Timestamp & Read Receipt Tick */}
                      <div
                        className={`flex items-center justify-end gap-1 text-[9px] font-mono pt-0.5 ${
                          isMe ? "text-white/70" : "text-text-faint"
                        }`}
                      >
                        <span>
                          {msg.createdAt
                            ? format(new Date(msg.createdAt), "HH:mm")
                            : ""}
                        </span>
                        {isMe &&
                          (msg.isRead ? (
                            <CheckCheck className="w-3 h-3 text-emerald-300" />
                          ) : (
                            <Check className="w-3 h-3" />
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-center gap-2 text-left animate-in fade-in">
          <div className="w-7 h-7 rounded-xl bg-surface-elevated border border-border-main flex items-center justify-center text-text-muted shrink-0 text-xs">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="px-3 py-2 rounded-2xl bg-surface-elevated border border-border-main text-text-muted text-xs flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-text-muted">
              {typingUserName || "User"} is typing
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
