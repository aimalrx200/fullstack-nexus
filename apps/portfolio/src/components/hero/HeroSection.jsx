// apps/portfolio/src/components/hero/HeroSection.jsx

import { ArrowRight, Zap, Lock, Shield, Layers, Sparkles } from "lucide-react";

export function HeroSection({ onOpenTopology }) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Cyber Grid & Soft Glow */}
      <div className="cyber-grid absolute inset-0 -z-10 opacity-60" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Product Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-primary text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          <span>Interactive Production Demos</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-main max-w-5xl leading-[1.1]">
          Building fast, secure, and real-time digital experiences.
        </h1>

        {/* Product Narrative */}
        <p className="mt-6 text-base sm:text-lg text-text-subtle max-w-3xl leading-relaxed">
          Explore interactive applications engineered for complete data privacy,
          instant live order updates, and seamless end-to-end performance.
        </p>

        {/* CTA Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="https://fullstack-nexus-frontend.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-black font-semibold text-xs uppercase tracking-wider shadow-lg shadow-brand-primary/20 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Launch Key Vault Demo</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={onOpenTopology}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-hover hover:border-brand-primary/40 text-text-main font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-brand-secondary" />
            <span>Explore System Overview</span>
          </button>
        </div>

        {/* User-Facing Feature Highlights */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Card 1: Data Protection */}
          <div className="cyber-glass rounded-xl p-3.5 flex items-center gap-3">
            <Lock className="w-4 h-4 text-brand-primary shrink-0" />
            <div>
              <p className="text-text-main font-semibold">Data Protection</p>
              <p className="text-[11px] text-text-subtle">
                Fully encrypted at rest
              </p>
            </div>
          </div>

          {/* Card 2: Live Sync */}
          <div className="cyber-glass rounded-xl p-3.5 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-brand-secondary shrink-0" />
            <div>
              <p className="text-text-main font-semibold">Real-Time Sync</p>
              <p className="text-[11px] text-text-subtle">
                Instant live updates
              </p>
            </div>
          </div>

          {/* Card 3: Performance */}
          <div className="cyber-glass rounded-xl p-3.5 flex items-center gap-3">
            <Zap className="w-4 h-4 text-status-success shrink-0" />
            <div>
              <p className="text-text-main font-semibold">High Performance</p>
              <p className="text-[11px] text-text-subtle">
                Fast loading & response
              </p>
            </div>
          </div>

          {/* Card 4: Access Security */}
          <div className="cyber-glass rounded-xl p-3.5 flex items-center gap-3">
            <Shield className="w-4 h-4 text-status-warning shrink-0" />
            <div>
              <p className="text-text-main font-semibold">Privacy & Security</p>
              <p className="text-[11px] text-text-subtle">
                Protected user sessions
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
