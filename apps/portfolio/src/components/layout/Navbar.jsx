// apps/portfolio/src/components/layout/Navbar.jsx

import { useState, useEffect } from "react";
import { Search, Sparkles } from "lucide-react";
import { LiveGatewayPing } from "../telemetry/LiveGatewayPing";
import { GithubIcon } from "../common/Icons";

export function Navbar({ onOpenPalette }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 border-b transition-[background-color,border-color,padding,box-shadow] duration-200 ${
        scrolled
          ? "bg-surface-card/80 backdrop-blur-md border-surface-border py-3 shadow-lg"
          : "bg-transparent border-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand & Identity */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-text-main">
              Nexus
            </span>
            <p className="text-xs text-text-subtle">Project Showcase</p>
          </div>
        </a>

        {/* Live Systems Status */}
        <div className="hidden lg:flex items-center">
          <LiveGatewayPing />
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <button
            type="button"
            onClick={onOpenPalette}
            className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-surface-border bg-surface-card/60 text-xs text-text-subtle hover:text-text-main hover:border-brand-primary/40 transition-colors cursor-pointer"
            aria-label="Quick Search"
          >
            <Search className="w-3.5 h-3.5 text-brand-primary" />
            <span>Search</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-hover text-[11px] font-sans font-medium text-text-main border border-surface-border">
              ⌘K
            </kbd>
          </button>

          {/* GitHub Source Link */}
          <a
            href="https://github.com/aimalrx200/fullstack-nexus"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/20 text-xs font-semibold transition-all"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>View Code</span>
          </a>
        </div>
      </div>
    </header>
  );
}
