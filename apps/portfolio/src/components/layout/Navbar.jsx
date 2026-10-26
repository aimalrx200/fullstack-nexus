// apps/portfolio/src/components/layout/Navbar.jsx

import { useState, useEffect } from "react";
import { LiveGatewayPing } from "../telemetry/LiveGatewayPing";
import { GithubIcon } from "../common/Icons";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? "bg-surface-app/80 backdrop-blur-md py-2.5 sm:py-3"
          : "bg-transparent py-3 sm:py-4.5"
      }`}
    >
      <div className="w-full px-3 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Logo + LiveGatewayPing */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <a
            href="#"
            className="flex items-center gap-2 text-text-main group focus:outline-none shrink-0"
            aria-label="Nexus Systems Home"
            title="Nexus Systems"
          >
            {/* Logo Glyph */}
            <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-surface-card border border-surface-border group-hover:border-text-subtle/50 group-hover:bg-surface-hover/80 transition-all shrink-0">
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-current fill-none stroke-[1.8] stroke-linecap-round stroke-linejoin-round group-hover:scale-105 transition-transform"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" className="opacity-60" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>

            {/* Logo Text */}
            <span className="font-semibold text-xs sm:text-sm tracking-tight text-text-main group-hover:text-text-subtle transition-colors whitespace-nowrap">
              Nexus Systems
            </span>
          </a>

          {/* Telemetry Ping */}
          <div className="shrink-0">
            <LiveGatewayPing />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* GitHub Source */}
          <a
            href="https://github.com/aimalrx200/fullstack-nexus"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-8 w-8 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-md border border-surface-border bg-surface-card/40 hover:bg-surface-hover text-text-subtle hover:text-text-main transition-colors text-xs font-mono group"
            title="View Monorepo on GitHub"
            aria-label="View Monorepo on GitHub"
          >
            <GithubIcon className="w-3.5 h-3.5 opacity-75 group-hover:opacity-100 transition-opacity" />
            <span className="hidden sm:inline sm:ml-1.5">GitHub</span>
            <span className="hidden sm:inline text-[10px] text-text-subtle/70 group-hover:text-text-subtle ml-1">
              ↗
            </span>
          </a>

          {/* Contact Button */}
          <a
            href="#contact"
            className="flex items-center justify-center h-8 w-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-md bg-text-main text-surface-app hover:opacity-90 font-medium text-xs transition-opacity tracking-tight"
            title="Contact"
            aria-label="Contact"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round sm:hidden"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="hidden sm:inline">Contact</span>
          </a>
        </div>
      </div>
    </header>
  );
}
