// apps/nexus-commerce/frontend/src/components/common/Footer.jsx

import { ShieldCheck } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface-card border-t border-border-main mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-3">
            <span className="font-bold tracking-tight text-base text-text-main">
              NEXUS COMMERCE
            </span>
            <p className="text-xs text-text-muted leading-relaxed">
              Your destination for premium products, effortless checkout, and
              reliable doorstep delivery nationwide.
            </p>
            <div className="flex items-center gap-2 text-xs text-text-muted pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Secure &amp; Verified Checkout</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-main">
              Shop
            </h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>
                <a
                  href="/catalog"
                  className="hover:text-text-main transition-colors"
                >
                  All Products
                </a>
              </li>
              <li>
                <a
                  href="/catalog?sort=price-low"
                  className="hover:text-text-main transition-colors"
                >
                  Featured &amp; Deals
                </a>
              </li>
              <li>
                <a
                  href="/account"
                  className="hover:text-text-main transition-colors"
                >
                  Track Your Order
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-main">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>
                <a
                  href="/account"
                  className="hover:text-text-main transition-colors"
                >
                  Help Center &amp; Support
                </a>
              </li>
              <li>
                <a
                  href="/account"
                  className="hover:text-text-main transition-colors"
                >
                  Shipping &amp; Delivery
                </a>
              </li>
              <li>
                <a
                  href="/account"
                  className="hover:text-text-main transition-colors"
                >
                  Returns &amp; Exchanges
                </a>
              </li>
            </ul>
          </div>

          {/* Accepted Payments */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-main">
              Payment Methods
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              We support secure digital payments and payment on delivery.
            </p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-surface-elevated border border-border-subtle text-[11px] text-text-muted font-medium">
                Credit / Debit Card
              </span>
              <span className="px-2.5 py-1 rounded-md bg-surface-elevated border border-border-subtle text-[11px] text-text-muted font-medium">
                JazzCash
              </span>
              <span className="px-2.5 py-1 rounded-md bg-surface-elevated border border-border-subtle text-[11px] text-text-muted font-medium">
                Easypaisa
              </span>
              <span className="px-2.5 py-1 rounded-md bg-surface-elevated border border-border-subtle text-[11px] text-text-muted font-medium">
                Cash on Delivery
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {currentYear} Nexus Commerce. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-text-main transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-text-main transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
