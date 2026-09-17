import React from "react";
import { ShieldCheck, CreditCard, Lock, Radio } from "lucide-react";
import { Badge } from "./Badge";

export function Footer() {
  return (
    <footer className="w-full bg-surface-card border-t border-border-main mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 font-bold tracking-tight text-base text-text-main">
              <span>NEXUS COMMERCE</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Real-time multi-currency commerce platform powered by WebAuthn
              biometrics, atomic Redis inventory locks, and distributed
              telemetry.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="success" size="sm" pulse>
                ENGINE ONLINE
              </Badge>
              <Badge variant="glow" size="sm">
                100% FREE TIER
              </Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-main">
              Storefront
            </h4>
            <ul className="space-y-1.5 text-xs text-text-muted">
              <li>
                <a
                  href="/catalog"
                  className="hover:text-text-main transition-colors"
                >
                  Product Catalog
                </a>
              </li>
              <li>
                <a
                  href="/account"
                  className="hover:text-text-main transition-colors"
                >
                  Order Tracking Radar
                </a>
              </li>
              <li>
                <a
                  href="/catalog?sort=price-low"
                  className="hover:text-text-main transition-colors"
                >
                  Flash Sales & Drops
                </a>
              </li>
            </ul>
          </div>

          {/* Supported Gateways */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-main">
              Payment Infrastructure
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="px-2 py-1 rounded-md bg-surface-elevated border border-border-subtle font-mono text-[11px] text-text-muted">
                Stripe (3D Secure)
              </span>
              <span className="px-2 py-1 rounded-md bg-surface-elevated border border-border-subtle font-mono text-[11px] text-text-muted">
                JazzCash (03xx)
              </span>
              <span className="px-2 py-1 rounded-md bg-surface-elevated border border-border-subtle font-mono text-[11px] text-text-muted">
                Easypaisa
              </span>
              <span className="px-2 py-1 rounded-md bg-surface-elevated border border-border-subtle font-mono text-[11px] text-text-muted">
                Cash on Delivery (COD)
              </span>
            </div>
          </div>

          {/* Security & Concurrency Specs */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-main">
              Zero-Trust Security
            </h4>
            <div className="space-y-1 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-primary" />
                <span>WebAuthn Biometric Passkeys</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>Redis Lua 10m Stock Holds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>CHIPS Partitioned Cookies</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-faint">
          <p>
            © 2026 FullStack Nexus. Distributed Enterprise Systems Monorepo.
          </p>
          <div className="flex items-center gap-4">
            <span>SRE Health: /api/v1/health</span>
            <span>Latency: &lt;15ms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
