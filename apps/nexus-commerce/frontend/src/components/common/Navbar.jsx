// apps/nexus-commerce/frontend/src/components/common/Navbar.jsx

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  ShoppingBag,
  Menu,
  X,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Headphones,
  Search,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { ThemeSelector } from "./ThemeSelector";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { getRoleDefaultRoute } from "../../lib/auth/rbacNav";

function StorefrontUserAvatar({ user, size = "w-6 h-6" }) {
  const [imgError, setImgError] = useState(false);
  const avatarSrc =
    user?.avatarUrl || user?.picture || user?.avatar || user?.image;
  const initial = user?.name
    ? user.name[0].toUpperCase()
    : user?.email
      ? user.email[0].toUpperCase()
      : "U";

  if (avatarSrc && !imgError) {
    return (
      <img
        src={avatarSrc}
        alt={user?.name || "User Avatar"}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setImgError(true)}
        className={`${size} rounded-full object-cover border border-brand-primary/30 shrink-0 shadow-xs`}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary font-mono text-[11px] font-bold shrink-0 select-none`}
    >
      {initial}
    </div>
  );
}

export function Navbar({ onOpenAuthModal }) {
  const {
    user,
    isAuthenticated,
    isInitialized,
    isStaff,
    isMerchantAdmin,
    logout,
  } = useAuth();
  const { itemCount, openCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileMenuOpen]);

  const staffLinkPath = isStaff ? getRoleDefaultRoute(user?.role) : "/";
  const staffLinkLabel = isMerchantAdmin
    ? "Merchant Dashboard"
    : "Support Desk";

  return (
    <header className="sticky top-0 w-full z-40">
      {/* 1. TOP UTILITY BAR (Desktop Only): Announcement, Currency, and Theme */}
      <div className="hidden lg:block w-full bg-surface-elevated/90 border-b border-border-subtle text-xs text-text-muted py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-[11px] font-medium text-text-muted">
            ✨ Free doorstep delivery on orders over $50 nationwide
          </p>
          <div className="flex items-center gap-4">
            <CurrencySwitcher />
            <ThemeSelector compact showLabels={false} />
          </div>
        </div>
      </div>

      {/* 2. MAIN STOREFRONT NAVBAR */}
      <div className="w-full bg-surface-app/80 backdrop-blur-md border-b border-border-main transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Desktop Nav Links */}
          <div className="flex items-center gap-6 lg:gap-8 min-w-0">
            <Link
              to="/"
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
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-muted">
              <Link
                to="/catalog"
                className="hover:text-text-main transition-colors"
              >
                All Products
              </Link>
              <Link
                to="/catalog?category=Electronics"
                className="hover:text-text-main transition-colors"
              >
                Electronics
              </Link>
              <Link
                to="/catalog?category=Apparel"
                className="hover:text-text-main transition-colors"
              >
                Clothing
              </Link>
            </nav>
          </div>

          {/* Right: Desktop Search, Cart, Account, and Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search Trigger (Desktop Only - hidden on mobile) */}
            <Link
              to="/catalog"
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-elevated transition-colors text-xs border border-border-subtle"
              aria-label="Search Catalog"
            >
              <Search className="w-4 h-4" />
              <span>Search products...</span>
            </Link>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={openCart}
              className="relative p-2.5 rounded-xl flex items-center justify-center text-text-main hover:bg-surface-elevated transition-colors cursor-pointer"
              aria-label={`Shopping bag, ${itemCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {isInitialized && itemCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-brand-primary text-white text-[10px] font-bold font-mono flex items-center justify-center animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="h-10 px-2 sm:px-3 rounded-xl flex items-center gap-2 hover:bg-surface-elevated text-text-main text-xs font-semibold border border-border-subtle transition-colors cursor-pointer"
                  aria-label="User Account Menu"
                  aria-expanded={isUserDropdownOpen}
                >
                  <StorefrontUserAvatar user={user} size="w-6 h-6" />
                  <span className="hidden md:inline max-w-28 truncate">
                    {user?.name || "Account"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                </button>

                {isUserDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 p-1.5 rounded-2xl bg-surface-card border border-border-main shadow-2xl z-40 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2.5 border-b border-border-subtle flex items-center gap-2.5">
                        <StorefrontUserAvatar user={user} size="w-8 h-8" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-text-main truncate">
                            {user?.name}
                          </p>
                          <p className="text-[11px] text-text-muted truncate mt-0.5">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/account"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-main hover:bg-surface-elevated transition-colors"
                        >
                          <User className="w-4 h-4 text-text-muted" />
                          <span>Order History & Profile</span>
                        </Link>

                        {isStaff && (
                          <Link
                            to={staffLinkPath}
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-brand-primary font-medium hover:bg-brand-primary/10 transition-colors"
                          >
                            {isMerchantAdmin ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <Headphones className="w-4 h-4" />
                            )}
                            <span>{staffLinkLabel}</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-border-subtle">
                        <button
                          type="button"
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
                type="button"
                onClick={onOpenAuthModal}
                className="h-10 px-4 rounded-xl bg-surface-elevated hover:bg-surface-hover text-text-main text-xs font-semibold border border-border-main transition-colors cursor-pointer shadow-xs"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl flex items-center justify-center text-text-main hover:bg-surface-elevated transition-colors cursor-pointer"
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
      </div>

      {/* 3. MOBILE SLIDE-OUT DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16.25 bottom-0 bg-surface-app/98 backdrop-blur-2xl border-t border-border-subtle overflow-y-auto z-50 flex flex-col justify-between p-5 pb-8 animate-in fade-in slide-in-from-top-2 duration-200">
          <div>
            {/* Search Trigger Button (Positioned at top of mobile menu) */}
            <div className="mb-4">
              <Link
                to="/catalog"
                onClick={closeMobileMenu}
                className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-muted hover:text-text-main transition-colors text-xs font-medium"
              >
                <Search className="w-4 h-4 text-text-muted shrink-0" />
                <span>Search products, categories...</span>
              </Link>
            </div>

            <nav className="flex flex-col gap-1.5 text-sm font-medium">
              <Link
                to="/catalog"
                onClick={closeMobileMenu}
                className="px-4 py-3 rounded-xl text-text-main hover:bg-surface-elevated transition-colors"
              >
                All Products
              </Link>
              <Link
                to="/catalog?category=Electronics"
                onClick={closeMobileMenu}
                className="px-4 py-3 rounded-xl text-text-muted hover:bg-surface-elevated hover:text-text-main transition-colors"
              >
                Electronics
              </Link>
              <Link
                to="/catalog?category=Apparel"
                onClick={closeMobileMenu}
                className="px-4 py-3 rounded-xl text-text-muted hover:bg-surface-elevated hover:text-text-main transition-colors"
              >
                Clothing
              </Link>

              {isStaff && (
                <Link
                  to={staffLinkPath}
                  onClick={closeMobileMenu}
                  className="px-4 py-3 rounded-xl text-brand-primary font-semibold flex items-center gap-2 hover:bg-brand-primary/10 transition-colors"
                >
                  {isMerchantAdmin ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <Headphones className="w-4 h-4" />
                  )}
                  <span>{staffLinkLabel}</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Localization Controls at Bottom of Mobile Menu */}
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
