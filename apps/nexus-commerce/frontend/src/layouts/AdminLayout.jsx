// apps/nexus-commerce/frontend/src/layouts/AdminLayout.jsx
import React, { useState } from "react";
import { Outlet, NavLink } from "react-router";
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
  ArrowLeft,
  Menu,
  X,
  Headphones,
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
  const { user } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const userRole = user?.role || "customer";

  const visibleLinks = ALL_ADMIN_LINKS.filter(
    (link) => userRole === "super_admin" || link.roles.includes(userRole),
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface-app text-text-main transition-colors">
      {/* Mobile Top Header (Visible on < 1024px) */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface-card border-b border-border-main px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            {userRole === "support_agent" ? (
              <Headphones className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
          </div>
          <div>
            <h2 className="text-xs font-bold font-mono tracking-tight text-text-main uppercase">
              {userRole.replace("_", " ")}
            </h2>
            <span className="text-[10px] font-mono text-brand-primary">
              Nexus Ops
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSelector />
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="w-9 h-9 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-main"
            aria-label="Toggle Navigation"
          >
            {isMobileNavOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Desktop Persistent Sidebar & Mobile Slide-Over Drawer */}
      <aside
        className={`${
          isMobileNavOpen
            ? "fixed inset-0 z-50 flex flex-col bg-surface-card p-5"
            : "hidden"
        } lg:flex lg:static lg:w-64 lg:h-screen lg:sticky lg:top-0 bg-surface-card border-r border-border-main p-4 flex-col justify-between shrink-0 shadow-lg`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <h2 className="text-xs font-bold font-mono tracking-tight text-text-main uppercase">
                  {userRole === "support_agent"
                    ? "SUPPORT CARE"
                    : userRole === "super_admin"
                      ? "ROOT OWNER"
                      : "MERCHANT OPS"}
                </h2>
                <span className="text-[10px] font-mono text-brand-primary uppercase font-bold">
                  {userRole.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="lg:hidden p-2 text-text-muted hover:text-text-main"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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

        <div className="pt-4 border-t border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <CurrencySwitcher />
            <ThemeSelector />
          </div>

          <a
            href="/"
            className="w-full min-h-9 rounded-xl bg-surface-elevated hover:bg-surface-hover text-text-muted hover:text-text-main border border-border-subtle text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </a>
        </div>
      </aside>

      {/* Fluid Canvas Main Content Area */}
      <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-y-auto w-full min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
