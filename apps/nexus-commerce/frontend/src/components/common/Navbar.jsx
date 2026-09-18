import React, { useState, useEffect } from "react";
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

export function Navbar({ onOpenAuthModal }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, openCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Lock background body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 w-full bg-surface-app/80 backdrop-blur-md border-b border-border-main transition-colors ${
        isMobileMenuOpen ? "z-60" : "z-40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo & Desktop Navigation Links */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          <a
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2 text-text-main font-bold tracking-tight text-base sm:text-lg group select-none shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1">
              <span>NEXUS</span>
              <span className="text-brand-primary text-xs font-mono font-medium tracking-normal hidden xs:inline">
                COMMERCE
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links: Visible only on >= 962px */}
          <nav className="hidden min-[962px]:flex items-center gap-5 lg:gap-6 text-sm font-medium text-text-muted">
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

        {/* Right: Actions Tray */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Top Bar Switchers: Hidden when < 962px, Visible on >= 962px */}
          <div className="hidden min-[962px]:flex items-center gap-2">
            <CurrencySwitcher />
            <ThemeSelector />
          </div>

          {/* Shopping Bag Button */}
          <button
            onClick={openCart}
            className="relative min-h-10 min-w-10 sm:min-h-11 sm:min-w-11 rounded-xl flex items-center justify-center text-text-main hover:bg-surface-elevated transition-colors cursor-pointer"
            aria-label={`Shopping bag, ${itemCount} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 min-w-4.5 h-4.5 px-1 rounded-full bg-brand-primary text-white text-[10px] font-bold font-mono flex items-center justify-center animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Account / Auth Actions */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="min-h-10 px-2 sm:min-h-11 sm:px-3 rounded-xl flex items-center gap-1.5 sm:gap-2 hover:bg-surface-elevated text-text-main text-xs font-semibold border border-border-subtle transition-colors cursor-pointer"
                aria-label="User Account Menu"
                aria-expanded={isUserDropdownOpen}
              >
                <div className="w-6 h-6 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary font-mono text-[11px] shrink-0">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="hidden min-[962px]:inline max-w-24 truncate">
                  {user?.name || "Account"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              </button>

              {/* User Dropdown */}
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
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-main hover:bg-surface-elevated transition-colors"
                      >
                        <User className="w-4 h-4 text-text-muted" />
                        <span>Order History & Addresses</span>
                      </a>
                      {isAdmin && (
                        <a
                          href="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
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
              className="min-h-10 px-3 sm:min-h-11 sm:px-4 rounded-xl bg-surface-elevated hover:bg-surface-hover text-text-main text-xs font-semibold border border-border-main transition-colors cursor-pointer shadow-xs"
            >
              Sign In
            </button>
          )}

          {/* Hamburger Mobile Menu Toggle Button: Visible on < 962px */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="min-[962px]:hidden min-h-10 min-w-10 sm:min-h-11 sm:min-w-11 rounded-xl flex items-center justify-center text-text-main hover:bg-surface-elevated transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Full-Height Scrollable Mobile Drawer: z-[60] overlays over all floating elements */}
      {isMobileMenuOpen && (
        <div className="min-[962px]:hidden fixed inset-x-0 top-16 bottom-0 h-[calc(100dvh-4rem)] bg-surface-app/98 backdrop-blur-2xl border-t border-border-subtle overflow-y-auto custom-scrollbar z-60 flex flex-col justify-between p-5 pb-8 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 text-sm font-medium">
            <a
              href="/catalog"
              onClick={closeMobileMenu}
              className="px-4 py-3 rounded-xl text-text-main hover:bg-surface-elevated hover:text-brand-primary transition-colors flex items-center justify-between"
            >
              <span>All Products</span>
            </a>
            <a
              href="/catalog?category=Electronics"
              onClick={closeMobileMenu}
              className="px-4 py-3 rounded-xl text-text-muted hover:bg-surface-elevated hover:text-text-main transition-colors flex items-center justify-between"
            >
              <span>Electronics</span>
            </a>
            <a
              href="/catalog?category=Apparel"
              onClick={closeMobileMenu}
              className="px-4 py-3 rounded-xl text-text-muted hover:bg-surface-elevated hover:text-text-main transition-colors flex items-center justify-between"
            >
              <span>Apparel</span>
            </a>
            {isAdmin && (
              <a
                href="/admin"
                onClick={closeMobileMenu}
                className="px-4 py-3 rounded-xl text-brand-primary font-semibold flex items-center gap-2 hover:bg-brand-primary/10 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Merchant Control Center</span>
              </a>
            )}
          </nav>

          {/* Preferences Inside Mobile Menu Drawer */}
          <div className="pt-4 mt-6 border-t border-border-subtle space-y-3.5">
            <div className="flex items-center justify-between gap-3 px-2">
              <span className="text-xs font-medium text-text-muted">
                Currency
              </span>
              <CurrencySwitcher />
            </div>
            <div className="flex items-center justify-between gap-3 px-2">
              <span className="text-xs font-medium text-text-muted">
                Appearance
              </span>
              <ThemeSelector />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
