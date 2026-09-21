// apps/nexus-commerce/frontend/src/layouts/AdminLayout.jsx
import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, Link } from "react-router";
import {
  LayoutDashboard,
  BarChart3,
  PackageCheck,
  Layers,
  Tag,
  Users,
  MessageSquare,
  UserPlus,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ThemeSelector } from "../components/common/ThemeSelector";
import { CurrencySwitcher } from "../components/common/CurrencySwitcher";

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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const settingsDropdownRef = useRef(null);
  const settingsButtonRef = useRef(null);
  const userRole = user?.role || "customer";
  const avatarSrc = user?.avatarUrl || user?.picture || user?.avatar || null;

  const visibleLinks = ALL_ADMIN_LINKS.filter(
    (link) => userRole === "super_admin" || link.roles.includes(userRole),
  );

  // Click outside & Escape key listeners for Settings dropdown
  useEffect(() => {
    if (!isSettingsOpen) return;

    const handleClickOutside = (e) => {
      if (
        settingsDropdownRef.current &&
        !settingsDropdownRef.current.contains(e.target) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(e.target)
      ) {
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

  // Lock background scroll on mobile when sidebar drawer is open
  useEffect(() => {
    if (isMobileNavOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileNavOpen]);

  return (
    <div className="min-h-screen flex bg-surface-app text-text-main transition-colors">
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop Persistent Sidebar & Mobile Slide-Over Drawer */}
      <aside
        className={`${
          isMobileNavOpen
            ? "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface-card p-5 shadow-2xl animate-in slide-in-from-left duration-200"
            : "hidden"
        } lg:flex lg:w-64 lg:h-screen lg:sticky lg:top-0 bg-surface-card border-r border-border-main p-4 flex-col shrink-0 shadow-lg`}
      >
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          {/* Nexus Commerce Brand Logo (Links to Storefront) */}
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle shrink-0">
            <Link
              to="/"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center gap-2.5 text-text-main font-bold tracking-tight text-base group select-none"
              title="Return to Storefront"
            >
              <div className="w-9 h-9 rounded-2xl bg-linear-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-none">
                <div className="flex items-baseline gap-1">
                  <span className="font-extrabold text-sm tracking-tight text-text-main">
                    NEXUS
                  </span>
                  <span className="text-brand-primary text-[10px] font-mono font-bold tracking-wider">
                    COMMERCE
                  </span>
                </div>
                <span className="text-[10px] text-text-muted font-mono mt-0.5">
                  Control Center
                </span>
              </div>
            </Link>

            {/* Mobile Close Icon */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="lg:hidden p-2 rounded-xl hover:bg-surface-elevated text-text-muted hover:text-text-main transition-colors cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-0.5">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `min-h-10.5 px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25 font-bold"
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
      </aside>

      {/* Main Container (Top Header + Page Canvas) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-40 bg-surface-card/90 backdrop-blur-md border-b border-border-main px-4 sm:px-6 h-16 flex items-center justify-between gap-4 shrink-0">
          {/* Left: Mobile Drawer Trigger & Workspace Badge */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {isMobileNavOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-bold uppercase">
                {userRole.replace("_", " ")}
              </span>
              <span className="text-xs text-text-muted font-mono hidden md:inline">
                • Operations Live
              </span>
            </div>
          </div>

          {/* Right: Actions (Settings Gear Dropdown & User Avatar) */}
          <div className="flex items-center gap-3 relative">
            {/* Settings Gear Toggle Button */}
            <button
              ref={settingsButtonRef}
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                isSettingsOpen
                  ? "bg-brand-primary/15 border-brand-primary/40 text-brand-primary shadow-sm"
                  : "bg-surface-elevated hover:bg-surface-hover border-border-subtle text-text-muted hover:text-text-main"
              }`}
              aria-label="Open Settings"
              aria-expanded={isSettingsOpen}
              title="Preferences & Settings"
            >
              <Settings
                className={`w-4.5 h-4.5 transition-transform duration-300 ${
                  isSettingsOpen ? "rotate-90 text-brand-primary" : ""
                }`}
              />
            </button>

            {/* Settings Dropdown Popover */}
            {isSettingsOpen && (
              <div
                ref={settingsDropdownRef}
                className="absolute right-0 top-12 mt-1 w-72 p-3.5 rounded-2xl bg-surface-card border border-border-main shadow-2xl z-50 space-y-3.5 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-1 border-b border-border-subtle pb-2.5">
                  <h4 className="text-xs font-bold text-text-main">
                    Preferences & Controls
                  </h4>
                  <p className="text-[10px] font-mono text-text-muted">
                    Display currency & color mode
                  </p>
                </div>

                {/* Switchers with no overflow */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <span className="text-xs font-medium text-text-muted shrink-0">
                      Currency
                    </span>
                    <CurrencySwitcher />
                  </div>

                  <div className="flex items-center justify-between gap-2 px-1">
                    <span className="text-xs font-medium text-text-muted shrink-0">
                      Theme
                    </span>
                    <ThemeSelector compact={true} />
                  </div>
                </div>

                {/* Logout Action */}
                <div className="pt-2 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      logout();
                    }}
                    className="w-full min-h-9 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-98"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* User Profile Avatar Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-border-subtle">
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600/20 to-indigo-600/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary font-mono font-bold text-xs shadow-xs shrink-0 overflow-hidden">
                {avatarSrc && !imgError ? (
                  <img
                    src={avatarSrc}
                    alt={user?.name || "Avatar"}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : user?.name ? (
                  user.name[0].toUpperCase()
                ) : (
                  "A"
                )}
              </div>

              <div className="hidden sm:block text-left min-w-0">
                <p className="text-xs font-bold text-text-main leading-tight truncate max-w-28">
                  {user?.name || "Operations Lead"}
                </p>
                <p className="text-[10px] font-mono text-text-muted truncate max-w-28">
                  {user?.email || "staff@nexus.io"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Fluid Canvas Main Content Area */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto w-full min-w-0 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
