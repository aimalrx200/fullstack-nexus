// apps/nexus-commerce/frontend/src/layouts/AdminLayout.jsx

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Outlet, NavLink, useLocation } from "react-router";
import {
  LayoutDashboard,
  BarChart3,
  PackageCheck,
  Layers,
  Tag,
  Users,
  MessageSquare,
  ShieldCheck,
  UserPlus,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  Headphones,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ThemeSelector } from "../components/common/ThemeSelector";
import { CurrencySwitcher } from "../components/common/CurrencySwitcher";
import { PageTransition } from "../components/common/PageTransition";

function AdminUserAvatar({ user, size = "w-8 h-8" }) {
  const [imgError, setImgError] = useState(false);
  const avatarSrc =
    user?.avatarUrl || user?.picture || user?.avatar || user?.image;
  const initial = user?.name
    ? user.name[0].toUpperCase()
    : user?.email
      ? user.email[0].toUpperCase()
      : "A";

  if (avatarSrc && !imgError) {
    return (
      <img
        src={avatarSrc}
        alt={user?.name || "User Avatar"}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setImgError(true)}
        className={`${size} rounded-xl object-cover border border-border-subtle shrink-0 shadow-xs`}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center border border-white/20 shadow-xs shrink-0 select-none`}
    >
      {initial}
    </div>
  );
}

const ALL_ADMIN_LINKS = [
  {
    label: "Dashboard Radar",
    to: "/admin",
    icon: LayoutDashboard,
    end: true,
    roles: ["merchant_admin", "super_admin"],
  },
  {
    label: "Analytics & GMV",
    to: "/admin/analytics",
    icon: BarChart3,
    roles: ["merchant_admin", "super_admin"],
  },
  {
    label: "Order Pipeline",
    to: "/admin/orders",
    icon: PackageCheck,
    roles: ["merchant_admin", "super_admin"],
  },
  {
    label: "Inventory Matrix",
    to: "/admin/inventory",
    icon: Layers,
    roles: ["merchant_admin", "super_admin"],
  },
  {
    label: "Coupons & Promos",
    to: "/admin/coupons",
    icon: Tag,
    roles: ["merchant_admin", "super_admin"],
  },
  {
    label: "Customer Directory",
    to: "/admin/customers",
    icon: Users,
    roles: ["support_agent", "merchant_admin", "super_admin"],
  },
  {
    label: "3-Pane Support Desk",
    to: "/admin/support",
    icon: MessageSquare,
    roles: ["support_agent", "merchant_admin", "super_admin"],
  },
  {
    label: "Team & Staff RBAC",
    to: "/admin/staff",
    icon: UserPlus,
    roles: ["super_admin"],
  },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const settingsButtonRef = useRef(null);

  const userRole = user?.role || "customer";

  const visibleLinks = ALL_ADMIN_LINKS.filter(
    (link) => userRole === "super_admin" || link.roles.includes(userRole),
  );

  // Outside click & Escape listener
  useEffect(() => {
    if (!isSettingsOpen) return;

    const handleClickOutside = (e) => {
      const isInsideDesktop =
        desktopDropdownRef.current &&
        desktopDropdownRef.current.contains(e.target);
      const isInsideMobile =
        mobileDropdownRef.current &&
        mobileDropdownRef.current.contains(e.target);
      const isInsideButton =
        settingsButtonRef.current &&
        settingsButtonRef.current.contains(e.target);

      if (!isInsideDesktop && !isInsideMobile && !isInsideButton) {
        setIsSettingsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSettingsOpen]);

  // Lock background scroll on mobile overlay
  useEffect(() => {
    const isMobileViewport =
      typeof window !== "undefined" && window.innerWidth < 640;
    const shouldLock = isMobileNavOpen || (isSettingsOpen && isMobileViewport);

    if (shouldLock) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isSettingsOpen, isMobileNavOpen]);

  const activePage = visibleLinks.find((link) =>
    link.end
      ? location.pathname === link.to
      : location.pathname.startsWith(link.to),
  );

  const renderPreferencesContent = (isMobile = false) => (
    <>
      <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
        <AdminUserAvatar user={user} size="w-9 h-9" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-text-main truncate">
            {user?.name || "Admin Member"}
          </p>
          <p className="text-[10px] font-mono text-text-muted truncate">
            {user?.email}
          </p>
        </div>
        {isMobile ? (
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="min-h-7 px-2.5 rounded-lg bg-surface-elevated hover:bg-surface-hover text-text-muted hover:text-text-main text-[11px] font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        ) : (
          <span className="text-[10px] font-mono text-text-faint">
            Press Esc
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-[11px] font-medium text-text-muted">
          Display Currency
        </label>
        <CurrencySwitcher className="w-full flex justify-between" />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[11px] font-medium text-text-muted">
          Interface Appearance
        </label>
        <ThemeSelector className="w-full flex justify-between" />
      </div>

      <div className="pt-2 border-t border-border-subtle">
        <button
          type="button"
          onClick={() => {
            setIsSettingsOpen(false);
            logout();
          }}
          className="w-full min-h-10 sm:min-h-9 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-surface-app text-text-main transition-colors">
      {/* Mobile Drawer Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* 1. SIDEBAR NAVIGATION */}
      <aside
        className={`${
          isMobileNavOpen
            ? "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface-card p-5 shadow-2xl"
            : "hidden"
        } lg:flex lg:w-64 lg:h-screen lg:sticky lg:top-0 bg-surface-card border-r border-border-main p-4 flex-col justify-between shrink-0 shadow-lg`}
      >
        <div className="space-y-6">
          {/* Logo navigates to Storefront */}
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <a
              href="/"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center gap-2.5 group select-none"
              title="Return to Storefront"
            >
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="font-extrabold text-text-main text-base tracking-tight leading-none">
                    NEXUS
                  </span>
                  <span className="text-brand-primary text-[10px] font-mono font-bold tracking-wider">
                    COMMERCE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted mt-0.5">
                  Operations Console
                </span>
              </div>
            </a>

            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-elevated transition-colors cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `min-h-10 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/30 font-bold"
                        : "text-text-muted hover:text-text-main hover:bg-surface-elevated"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Telemetry Footer */}
        <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-text-faint">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetry Online</span>
          </span>
          <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-surface-elevated border border-border-subtle">
            {userRole.replace("_", " ")}
          </span>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Navbar */}
        <header className="h-16 px-3.5 sm:px-6 bg-surface-card/90 backdrop-blur-md border-b border-border-main flex items-center justify-between gap-3 sm:gap-4 z-30 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden min-h-10 min-w-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-main transition-colors cursor-pointer shrink-0"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="hidden sm:flex w-7 h-7 rounded-lg bg-brand-primary/10 border border-brand-primary/20 items-center justify-center text-brand-primary shrink-0">
                {userRole === "support_agent" ? (
                  <Headphones className="w-3.5 h-3.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
              </div>
              <h1 className="text-xs sm:text-sm font-bold text-text-main truncate">
                {activePage?.label || "Operations Radar"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="relative">
              <button
                ref={settingsButtonRef}
                type="button"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`min-h-10 min-w-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isSettingsOpen
                    ? "bg-brand-primary/10 text-brand-primary border-brand-primary/40 shadow-xs"
                    : "bg-surface-elevated text-text-muted hover:text-text-main border-border-subtle hover:bg-surface-hover"
                }`}
                aria-label="Open settings & preferences"
                aria-expanded={isSettingsOpen}
              >
                <Settings
                  className={`w-4.5 h-4.5 transition-transform duration-300 ${
                    isSettingsOpen ? "rotate-90 text-brand-primary" : ""
                  }`}
                />
              </button>

              {/* Desktop Floating Dropdown */}
              {isSettingsOpen && (
                <div
                  ref={desktopDropdownRef}
                  className="hidden sm:block absolute right-0 top-full mt-2 w-72 p-4.5 rounded-2xl bg-surface-card border border-border-main shadow-2xl z-50 space-y-4 animate-in fade-in zoom-in-95 cursor-default select-text"
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderPreferencesContent(false)}
                </div>
              )}
            </div>

            {/* User Avatar Pill */}
            <div className="flex items-center gap-2 pl-1 border-l border-border-subtle">
              <AdminUserAvatar user={user} size="w-8 h-8" />

              <div className="hidden md:flex flex-col text-left leading-tight min-w-0 max-w-32">
                <span className="text-xs font-bold text-text-main truncate">
                  {user?.name || "Admin"}
                </span>
                <span className="text-[10px] font-mono text-text-muted truncate">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Fluid Content Area */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto w-full min-w-0 custom-scrollbar">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      {/* Mobile Modal Overlay */}
      {isSettingsOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="sm:hidden fixed inset-0 z-100 overflow-y-auto overscroll-contain custom-scrollbar flex flex-col items-center justify-start p-3.5 select-none"
            role="dialog"
            aria-modal="true"
            aria-label="Preferences Menu"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsSettingsOpen(false);
              }
            }}
          >
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs -z-10 transition-opacity pointer-events-none"
              aria-hidden="true"
            />

            <div
              ref={mobileDropdownRef}
              className="relative w-full max-w-sm mt-16 mb-8 p-4.5 rounded-2xl bg-surface-card border border-border-main shadow-2xl space-y-4 animate-in fade-in zoom-in-95 cursor-default select-text shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {renderPreferencesContent(true)}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
