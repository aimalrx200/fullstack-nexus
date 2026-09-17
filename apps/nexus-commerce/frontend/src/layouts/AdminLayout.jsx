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
  ArrowLeft,
} from "lucide-react";
import { useAdminOrderStream } from "../hooks/useAdminOrderStream";
import { Badge } from "../components/common/Badge";
import { ThemeSelector } from "../components/common/ThemeSelector";
import { CurrencySwitcher } from "../components/common/CurrencySwitcher";

const ADMIN_LINKS = [
  { label: "Dashboard Radar", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Analytics & GMV", to: "/admin/analytics", icon: BarChart3 },
  { label: "Order Pipeline", to: "/admin/orders", icon: PackageCheck },
  { label: "Inventory Matrix", to: "/admin/inventory", icon: Layers },
  { label: "Coupons & Promos", to: "/admin/coupons", icon: Tag },
  { label: "Customer Directory", to: "/admin/customers", icon: Users },
  { label: "3-Pane Support Desk", to: "/admin/support", icon: MessageSquare },
];

export function AdminLayout() {
  const { isConnected } = useAdminOrderStream();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-app text-text-main transition-colors">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-surface-card border-r border-border-main p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <h2 className="text-xs font-bold font-mono tracking-tight text-text-main">
                  MERCHANT OPS
                </h2>
                <Badge
                  variant={isConnected ? "success" : "warning"}
                  size="sm"
                  pulse
                >
                  {isConnected ? "LIVE STREAM" : "POLLING"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Links */}
          <nav className="space-y-1">
            {ADMIN_LINKS.map((link) => {
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

        {/* Bottom Actions */}
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

      {/* Main Admin View */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
