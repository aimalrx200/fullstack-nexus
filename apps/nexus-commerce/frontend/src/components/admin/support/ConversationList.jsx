// apps/nexus-commerce/frontend/src/components/admin/support/ConversationList.jsx
import React from "react";
import { format } from "date-fns";
import {
  MessageSquare,
  User,
  Search,
  UserCheck,
  Smartphone,
} from "lucide-react";

export function ConversationList({
  conversations = [],
  selectedId,
  onSelect,
  statusFilter,
  onStatusFilterChange,
  customerTypeFilter,
  onCustomerTypeFilterChange,
  searchQuery,
  onSearchChange,
}) {
  return (
    <div className="w-full sm:w-88 bg-surface-card border-r border-border-main flex flex-col h-full shrink-0">
      {/* Header & Status Dropdown */}
      <div className="p-3.5 border-b border-border-subtle space-y-3">
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

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search customer or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full min-h-8 pl-8 pr-3 rounded-lg bg-surface-elevated border border-border-subtle text-[11px] text-text-main placeholder:text-text-faint focus:outline-hidden focus:border-brand-primary"
          />
          <Search className="w-3.5 h-3.5 text-text-faint absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-3 p-0.5 rounded-lg bg-surface-elevated border border-border-subtle text-[11px] font-medium">
          <button
            type="button"
            onClick={() => onCustomerTypeFilterChange("all")}
            className={`py-1 rounded-md transition-all cursor-pointer ${
              customerTypeFilter === "all"
                ? "bg-surface-card text-brand-primary font-bold shadow-xs"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onCustomerTypeFilterChange("customers")}
            className={`py-1 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
              customerTypeFilter === "customers"
                ? "bg-surface-card text-indigo-400 font-bold shadow-xs"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>VIP</span>
          </button>
          <button
            type="button"
            onClick={() => onCustomerTypeFilterChange("guests")}
            className={`py-1 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
              customerTypeFilter === "guests"
                ? "bg-surface-card text-amber-400 font-bold shadow-xs"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Guests</span>
          </button>
        </div>
      </div>

      {/* Conversation Thread Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-subtle custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted font-mono space-y-1">
            <p>No conversations found</p>
            <p className="text-[10px] text-text-faint">
              Waiting for customer messages
            </p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = conv._id === selectedId;
            const isGuest = !conv.customerId;
            // Badge only appears on unselected conversations with pending messages
            const showUnreadBadge =
              !isSelected && (conv.unreadCountAdmin || 0) > 0;

            return (
              <button
                key={conv._id}
                type="button"
                onClick={() => onSelect(conv._id)}
                className={`w-full p-3.5 text-left transition-all flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-brand-primary/10 border-l-4 border-brand-primary shadow-inner"
                    : "hover:bg-surface-elevated/70"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 text-xs font-bold font-mono ${
                    isGuest
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                  }`}
                >
                  {isGuest ? (
                    <Smartphone className="w-4 h-4" />
                  ) : (
                    conv.customerName?.[0] || <User className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h4 className="text-xs font-bold text-text-main truncate">
                        {conv.customerName ||
                          (isGuest ? "Guest Shopper" : "Customer")}
                      </h4>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                          isGuest
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                            : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                        }`}
                      >
                        {isGuest ? "GUEST" : "VIP"}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-text-faint shrink-0 ml-1">
                      {conv.lastMessageAt
                        ? format(new Date(conv.lastMessageAt), "HH:mm")
                        : ""}
                    </span>
                  </div>

                  <p className="text-[11px] text-text-muted truncate">
                    {conv.customerEmail}
                  </p>
                </div>

                {showUnreadBadge && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold font-mono flex items-center justify-center animate-pulse shrink-0">
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
