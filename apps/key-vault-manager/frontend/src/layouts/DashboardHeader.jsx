// src/layouts/DashboardHeader.jsx

import { useState, useMemo } from "react";
import { Menu, Search, Settings, Command } from "lucide-react";
import { useAuthUser } from "../lib/auth/useAuthUser";
import { SettingsDrawer } from "../components/settings/SettingsDrawer";

export function DashboardHeader({ onToggleSidebar, onOpenSearch }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { data: authData, isPending } = useAuthUser();

  // 🟢 Safely unwraps user data across initial load, post-login, and page reload
  const user = authData?.user || authData;

  // OS-aware keyboard shortcut detection (⌘K for Apple devices, Ctrl+K for others)
  const isMac = useMemo(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return false;
    }
    return /Mac|iPhone|iPod|iPad/i.test(
      navigator.userAgent || navigator.platform || "",
    );
  }, []);

  // Compute initials for the avatar placeholder fallback
  const userInitials = useMemo(() => {
    if (!user) return "OP";
    const nameStr = (user.name || user.username || "").trim();
    if (!nameStr) return "OP";

    const parts = nameStr.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  }, [user]);

  const operatorDisplayName =
    user?.name || user?.username || "Authenticated Operator";

  return (
    <>
      <header className="dashboard-header">
        {/* Left Area: Mobile Menu Trigger & Command-Palette Search Bar */}
        <div className="dashboard-header-left">
          <button
            onClick={onToggleSidebar}
            className="dashboard-header-menu-btn"
            aria-label="Toggle Navigation Sidebar"
            type="button"
          >
            <Menu className="dashboard-header-menu-icon" />
          </button>

          {/* Global Command-Palette Search Bar Trigger */}
          <div className="dashboard-header-search-wrapper">
            <button
              onClick={onOpenSearch}
              className="dashboard-header-search-btn"
              type="button"
              aria-label="Open Command Palette Search"
            >
              <div className="dashboard-header-search-content min-w-0">
                <Search className="dashboard-header-search-icon shrink-0" />
                <span className="truncate">
                  Search secrets, vaults, policies, or service accounts...
                </span>
              </div>

              {/* Dynamic OS Shortcut Badge */}
              <kbd
                className="dashboard-header-kbd shrink-0"
                title={`Shortcut: ${isMac ? "Cmd + K" : "Ctrl + K"}`}
              >
                {isMac ? (
                  <>
                    <Command className="dashboard-header-kbd-icon" />
                    <span>K</span>
                  </>
                ) : (
                  <span>Ctrl + K</span>
                )}
              </kbd>
            </button>
          </div>
        </div>

        {/* Right Area: System Controls & Operator Profile */}
        <div className="dashboard-header-right">
          {/* Mobile Search Icon Button */}
          <button
            onClick={onOpenSearch}
            className="dashboard-header-mobile-search-btn"
            aria-label="Search Vault"
            title="Search (Ctrl + K)"
            type="button"
          >
            <Search className="dashboard-header-mobile-search-icon" />
          </button>

          {/* Operator Profile Avatar Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="dashboard-header-avatar cursor-pointer hover:border-brand-primary transition-colors overflow-hidden flex items-center justify-center shrink-0"
            aria-label={`Operator Profile: ${operatorDisplayName}`}
            title={`Operator: ${operatorDisplayName} (Click to open preferences)`}
            type="button"
          >
            {isPending ? (
              <span className="h-2.5 w-2.5 rounded-full bg-brand-primary/50 animate-pulse" />
            ) : user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username || "Operator Avatar"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="font-mono text-xs font-bold text-brand-primary tracking-wider select-none">
                {userInitials}
              </span>
            )}
          </button>

          {/* System Engine Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="dashboard-header-settings-btn"
            aria-label="Open System Settings and Preferences"
            title="System Settings"
            type="button"
          >
            <Settings className="dashboard-header-settings-icon" />
          </button>
        </div>
      </header>

      {/* Slide-Over Settings & Preferences Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
