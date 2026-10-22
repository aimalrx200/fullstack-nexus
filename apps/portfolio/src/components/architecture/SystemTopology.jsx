// apps/portfolio/src/components/architecture/SystemTopology.jsx

import { Sparkles, ShieldCheck, Zap, Layers, CheckCircle2 } from "lucide-react";

export function SystemTopology() {
  return (
    <section
      id="topology"
      className="py-20 border-t border-surface-border bg-surface-app relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <span>Core Standards</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main tracking-tight">
            Crafted for usability, speed, and privacy.
          </h2>
          <p className="text-sm text-text-subtle mt-2 max-w-2xl leading-relaxed">
            Every project in this showcase is built around fundamental software
            principles to deliver clean, engaging, and dependable experiences.
          </p>
        </div>

        {/* Feature Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Pillar 1: UI & Experience */}
          <div className="cyber-glass rounded-xl p-5 border border-surface-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-[11px] font-bold">
                  EXPERIENCE
                </span>
                <Sparkles className="w-4 h-4 text-brand-primary" />
              </div>
              <h3 className="font-semibold text-text-main text-sm">
                Intuitive Interfaces
              </h3>
              <p className="text-text-subtle text-[11px] mt-2 leading-relaxed">
                Thoughtful layouts, responsive controls, and smooth navigation
                that make complex workflows feel natural.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-surface-border flex items-center gap-1.5 text-[11px] text-brand-primary font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Clean & accessible</span>
            </div>
          </div>

          {/* Pillar 2: Security & Privacy */}
          <div className="cyber-glass rounded-xl p-5 border border-surface-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded-md bg-brand-secondary/10 text-brand-secondary text-[11px] font-bold">
                  PRIVACY
                </span>
                <ShieldCheck className="w-4 h-4 text-brand-secondary" />
              </div>
              <h3 className="font-semibold text-text-main text-sm">
                Security-First Design
              </h3>
              <p className="text-text-subtle text-[11px] mt-2 leading-relaxed">
                Disciplined session management, protected access barriers, and
                sensitive data safeguards across all views.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-surface-border flex items-center gap-1.5 text-[11px] text-brand-secondary font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Safe & reliable</span>
            </div>
          </div>

          {/* Pillar 3: Performance */}
          <div className="cyber-glass rounded-xl p-5 border border-surface-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded-md bg-status-success/10 text-status-success text-[11px] font-bold">
                  SPEED
                </span>
                <Zap className="w-4 h-4 text-status-success" />
              </div>
              <h3 className="font-semibold text-text-main text-sm">
                Fast & Responsive
              </h3>
              <p className="text-text-subtle text-[11px] mt-2 leading-relaxed">
                Lightweight bundles and optimized rendering guarantee snappier
                page transitions on desktop and mobile.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-surface-border flex items-center gap-1.5 text-[11px] text-status-success font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Instant feedback</span>
            </div>
          </div>

          {/* Pillar 4: Architecture */}
          <div className="cyber-glass rounded-xl p-5 border border-surface-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded-md bg-status-warning/10 text-status-warning text-[11px] font-bold">
                  STRUCTURE
                </span>
                <Layers className="w-4 h-4 text-status-warning" />
              </div>
              <h3 className="font-semibold text-text-main text-sm">
                Modular Architecture
              </h3>
              <p className="text-text-subtle text-[11px] mt-2 leading-relaxed">
                Clean, reusable component systems and predictable state handling
                designed for stability and future growth.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-surface-border flex items-center gap-1.5 text-[11px] text-status-warning font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Scalable code</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
