import React, { useState } from "react";
import {
  ShoppingBag,
  Menu,
  X,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { ThemeSelector } from "./ThemeSelector";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { Badge } from "./Badge";

export function Navbar({ onOpenAuthModal }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, openCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-app/80 backdrop-blur-md border-b border-border-main transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="flex items-center gap-2 text-text-main font-bold tracking-tight text-lg group select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1">
              <span>NEXUS</span>
              <span className="text-brand-primary text-xs font-mono font-medium tracking-normal">
                COMMERCE
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-muted">
            <a
              href="/catalog"
              className="hover:text-text-main transition-colors"
            >
              Catalog
            </a>
            <a
              href="/catalog?category=Electronics"
              className="hover:text-text-main transition-colors"
            >
              Electronics
            </a>
            <a
              href="/catalog?category=Apparel"
              className="hover:text-text-main transition-colors"
            >
              Apparel
            </a>
            {isAdmin && (
              <a
                href="/admin"
                className="flex items-center gap-1.5 text-brand-primary hover:text-brand-primary/80 font-semibold"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Merchant Hub</span>
              </a>
            )}
          </nav>
        </div>

        {/* Right: Actions, Currency, Theme & Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <CurrencySwitcher className="hidden sm:inline-flex" />

          {/* Theme Selector */}
          <ThemeSelector className="hidden sm:inline-flex" />

          {/* Shopping Bag Button with Live Indicator */}
          <button
            onClick={openCart}
            className="relative min-h-11 min-w-11 rounded-xl flex items-center justify-center text-text-main hover:bg-surface-elevated transition-colors cursor-pointer"
            aria-label={`Shopping bag, ${itemCount} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-4.5 h-4.5 px-1 rounded-full bg-brand-primary text-white text-[10px] font-bold font-mono flex items-center justify-center animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </button>

          {/* Auth Button or User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="min-h-11 px-3 rounded-xl flex items-center gap-2 hover:bg-surface-elevated text-text-main text-xs font-semibold border border-border-subtle transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary font-mono text-[11px]">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="hidden md:inline max-w-25 truncate">
                  {user?.name || "Account"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              </button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 p-1.5 rounded-2xl bg-surface-card border border-border-main shadow-2xl z-40 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-border-subtle">
                      <p className="text-xs font-semibold text-text-main truncate">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-text-muted truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <a
                        href="/account"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-main hover:bg-surface-elevated transition-colors"
                      >
                        <User className="w-4 h-4 text-text-muted" />
                        <span>Order History & Addresses</span>
                      </a>
                      {isAdmin && (
                        <a
                          href="/admin"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-brand-primary font-medium hover:bg-brand-primary/10 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Merchant Dashboard</span>
                        </a>
                      )}
                    </div>

                    <div className="pt-1 border-t border-border-subtle">
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="min-h-11 px-4 rounded-xl bg-surface-elevated hover:bg-surface-hover text-text-main text-xs font-semibold border border-border-main transition-colors cursor-pointer shadow-xs"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden min-h-11 min-w-11 rounded-xl flex items-center justify-center text-text-main hover:bg-surface-elevated transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border-subtle bg-surface-app/95 backdrop-blur-xl px-6 py-5 space-y-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-3 text-sm font-medium">
            <a
              href="/catalog"
              className="text-text-main hover:text-brand-primary"
            >
              All Products
            </a>
            <a
              href="/catalog?category=Electronics"
              className="text-text-muted hover:text-text-main"
            >
              Electronics
            </a>
            <a
              href="/catalog?category=Apparel"
              className="text-text-muted hover:text-text-main"
            >
              Apparel
            </a>
            {isAdmin && (
              <a
                href="/admin"
                className="text-brand-primary font-semibold flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Merchant Control Center
              </a>
            )}
          </nav>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
            <CurrencySwitcher />
            <ThemeSelector />
          </div>
        </div>
      )}
    </header>
  );
}
