// apps/nexus-commerce/frontend/src/components/storefront/support/ChatMessageList.jsx
import React, { useEffect, useRef, useMemo, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import {
  ShieldCheck,
  User,
  Paperclip,
  Check,
  CheckCheck,
  Eye,
  Download,
  X,
} from "lucide-react";

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
  isTyping = false,
  typingUserName = "",
  isAgentView = false,
}) {
  const scrollBottomRef = useRef(null);
  const [previewAttachment, setPreviewAttachment] = useState(null);

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
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar bg-surface-app/40 relative">
      {/* Intro Empty State */}
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
              ? "Customer is connected. Type below to respond in real time."
              : "Ask about product specs, sizing, orders, or payment assistance."}
          </p>
        </div>
      )}

      {/* Date Sections */}
      {groupedMessages.map((group, groupIdx) => (
        <div key={groupIdx} className="space-y-4">
          <div className="flex items-center justify-center my-2">
            <span className="px-3 py-1 rounded-full bg-surface-elevated/90 border border-border-subtle text-[10px] font-mono text-text-muted shadow-xs">
              {group.date}
            </span>
          </div>

          <div className="space-y-3">
            {group.items.map((msg, idx) => {
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

              const hasText = Boolean(msg.text && msg.text.trim().length > 0);

              return (
                <div
                  key={msg._id || idx}
                  className={`flex items-end gap-2.5 ${
                    isMe ? "justify-end" : "justify-start"
                  } animate-in fade-in duration-150`}
                >
                  {/* Avatar for Other party */}
                  {!isMe && (
                    <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-border-main flex items-center justify-center text-text-muted shrink-0 shadow-xs mb-1">
                      {msg.senderType === "admin" ? (
                        <ShieldCheck className="w-4 h-4 text-brand-primary" />
                      ) : (
                        <User className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  )}

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] space-y-1 ${isMe ? "items-end text-right" : "items-start text-left"}`}
                  >
                    <span className="text-[10px] font-mono text-text-faint px-1 block">
                      {isMe
                        ? isAgentView
                          ? "You (Support Specialist)"
                          : "You"
                        : msg.senderName ||
                          (msg.senderType === "admin"
                            ? "Support Specialist"
                            : "Shopper")}
                    </span>

                    <div
                      className={`p-3 sm:p-3.5 rounded-2xl text-xs shadow-md space-y-2 ${
                        isMe
                          ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs border border-blue-500/30"
                          : "bg-surface-elevated text-text-main border border-border-main rounded-bl-xs"
                      }`}
                    >
                      {/* Text Paragraph */}
                      {hasText && (
                        <p className="leading-relaxed whitespace-pre-wrap wrap-break-word text-xs text-left">
                          {msg.text}
                        </p>
                      )}

                      {/* Visual Attachments Previews */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="space-y-1.5 pt-0.5">
                          {msg.attachments.map((att, i) => {
                            const isImg =
                              att.url?.startsWith("data:image") ||
                              att.fileType?.startsWith("image/") ||
                              /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(
                                att.fileName || "",
                              ) ||
                              att.url?.includes("cloudinary.com");

                            if (isImg) {
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setPreviewAttachment(att)}
                                  className="block relative rounded-xl overflow-hidden border border-white/20 bg-black/40 group cursor-pointer text-left transition-all hover:scale-[1.01] w-full"
                                >
                                  <img
                                    src={att.url}
                                    alt={att.fileName || "Attachment thumbnail"}
                                    className="max-h-56 w-full object-cover rounded-xl"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-mono font-semibold">
                                    <Eye className="w-4 h-4" />
                                    <span>View Photo</span>
                                  </div>
                                </button>
                              );
                            }

                            return (
                              <a
                                key={i}
                                href={att.url}
                                download={att.fileName || "attachment"}
                                className={`flex items-center gap-2 p-2 rounded-xl text-xs font-mono transition-opacity hover:opacity-85 ${
                                  isMe
                                    ? "bg-white/15 text-white"
                                    : "bg-surface-card text-text-main border border-border-subtle"
                                }`}
                              >
                                <Paperclip className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-44">
                                  {att.fileName || "Attachment"}
                                </span>
                                <Download className="w-3.5 h-3.5 ml-auto opacity-70 shrink-0" />
                              </a>
                            );
                          })}
                        </div>
                      )}

                      {/* Timestamp & High-Contrast Read Receipts */}
                      <div
                        className={`flex items-center gap-1.5 text-[9px] font-mono pt-0.5 ${
                          isMe
                            ? "justify-end text-white/90"
                            : "justify-start text-text-faint"
                        }`}
                      >
                        <span>
                          {msg.createdAt
                            ? format(new Date(msg.createdAt), "HH:mm")
                            : ""}
                        </span>

                        {isMe && (
                          <span
                            title={
                              msg.isRead ? "Read by recipient" : "Delivered"
                            }
                            className="inline-flex items-center"
                          >
                            {msg.isRead ? (
                              <CheckCheck className="w-4 h-4 text-cyan-300 font-bold shrink-0 drop-shadow-xs" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-300/80 shrink-0" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Avatar for Me */}
                  {isMe && (
                    <div className="w-8 h-8 rounded-xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary shrink-0 shadow-xs mb-1">
                      {isAgentView ? (
                        <ShieldCheck className="w-4 h-4 text-brand-primary" />
                      ) : (
                        <User className="w-4 h-4 text-brand-primary" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Real-Time Animated Typing Indicator */}
      {isTyping && (
        <div className="flex items-center gap-2.5 text-left animate-in fade-in slide-in-from-bottom-2 duration-200 my-2">
          <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-border-main flex items-center justify-center text-text-muted shrink-0 shadow-xs">
            {isAgentView ? (
              <User className="w-4 h-4 text-amber-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-brand-primary" />
            )}
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border-main text-text-muted text-xs flex items-center gap-2.5 shadow-md">
            <span className="text-[11px] font-mono text-text-muted font-medium">
              {typingUserName ||
                (isAgentView ? "Customer" : "Support Specialist")}{" "}
              is typing
            </span>
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce" />
            </span>
          </div>
        </div>
      )}

      {/* Fullscreen Attachment Lightbox Modal */}
      {previewAttachment && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewAttachment(null)}
        >
          <div
            className="relative max-w-4xl max-h-[92vh] flex flex-col items-center gap-3 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Action Bar */}
            <div className="w-full flex items-center justify-between text-white px-1">
              <span className="text-xs font-mono truncate max-w-xs sm:max-w-md">
                {previewAttachment.fileName || "Attachment Preview"}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewAttachment.url}
                  download={
                    previewAttachment.fileName || "nexus_attachment.jpg"
                  }
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lightbox Image Viewport */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center max-h-[82vh] w-full shadow-2xl">
              <img
                src={previewAttachment.url}
                alt={previewAttachment.fileName || "Attachment preview"}
                className="max-h-[82vh] w-auto max-w-full object-contain select-none"
              />
            </div>
          </div>
        </div>
      )}

      <div ref={scrollBottomRef} />
    </div>
  );
}
