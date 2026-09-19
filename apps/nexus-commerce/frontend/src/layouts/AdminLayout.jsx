// apps/nexus-commerce/frontend/src/layouts/AdminLayout.jsx
import React from "react";
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
  const userRole = user?.role || "customer";

  const visibleLinks = ALL_ADMIN_LINKS.filter(
    (link) => userRole === "super_admin" || link.roles.includes(userRole),
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-app text-text-main transition-colors">
      <aside className="w-full md:w-64 bg-surface-card border-r border-border-main p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <h2 className="text-xs font-bold font-mono tracking-tight text-text-main uppercase">
                {userRole === "support_agent"
                  ? "SUPPORT CARE"
                  : userRole === "super_admin"
                    ? "ROOT OWNER"
                    : "MERCHANT OPS"}
              </h2>
              <span className="text-[10px] font-mono text-brand-primary uppercase">
                {userRole.replace("_", " ")}
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `min-h-10 px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/30"
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

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
