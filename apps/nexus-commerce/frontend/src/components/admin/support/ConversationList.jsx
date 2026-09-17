import React from "react";
import { format } from "date-fns";
import { MessageSquare, User } from "lucide-react";

export function ConversationList({
  conversations = [],
  selectedId,
  onSelect,
  statusFilter,
  onStatusFilterChange,
}) {
  return (
    <div className="w-full sm:w-80 bg-surface-card border-r border-border-main flex flex-col h-full">
      {/* Search & Status Filter */}
      <div className="p-3.5 border-b border-border-subtle space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-main flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-brand-primary" />
            <span>Support Inbox</span>
          </h3>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="min-h-7.5 px-2 rounded-lg bg-surface-elevated border border-border-subtle text-[11px] text-text-main focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-subtle custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="py-10 text-center text-xs text-text-muted font-mono">
            No active conversations
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = conv._id === selectedId;
            return (
              <button
                key={conv._id}
                type="button"
                onClick={() => onSelect(conv._id)}
                className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-brand-primary/10 border-l-2 border-brand-primary"
                    : "hover:bg-surface-elevated/70"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-border-main flex items-center justify-center text-text-muted shrink-0 text-xs font-bold font-mono">
                  {conv.customerName ? conv.customerName[0] : "C"}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-text-main truncate">
                      {conv.customerName || "Customer"}
                    </h4>
                    <span className="text-[10px] font-mono text-text-faint">
                      {conv.lastMessageAt
                        ? format(new Date(conv.lastMessageAt), "HH:mm")
                        : ""}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted truncate">
                    {conv.customerEmail}
                  </p>
                </div>

                {conv.unreadCountAdmin > 0 && (
                  <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold font-mono flex items-center justify-center">
                    {conv.unreadCountAdmin}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
