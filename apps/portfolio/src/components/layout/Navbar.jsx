// apps/portfolio/src/components/layout/Navbar.jsx

import { useState, useEffect } from "react";
import { LiveGatewayPing } from "../telemetry/LiveGatewayPing";
import { GithubIcon } from "../common/Icons";
import { ContactModal } from "../contact/ContactModal";
import { SkillsModal } from "../skills/SkillsModal";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed border-b border-surface-border/60 top-0 left-0 right-0 z-40 transition-all duration-200 ${
          scrolled
            ? "bg-surface-app/80 backdrop-blur-md py-2.5 sm:py-3"
            : "bg-transparent py-3 sm:py-4.5"
        }`}
      >
        <div className="w-full px-3 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Brand Identity & Telemetry */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <a
              href="#"
              className="flex items-center gap-2 text-text-main group focus:outline-none shrink-0"
              aria-label="Nexus Systems Home"
              title="Nexus Systems"
            >
              {/* Minimalist Multi-Tier Mark */}
              <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-surface-card border border-surface-border group-hover:border-text-subtle/50 group-hover:bg-surface-hover transition-all shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-current fill-none stroke-[1.8] stroke-linecap-round stroke-linejoin-round group-hover:scale-105 transition-transform"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" className="opacity-60" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>

              {/* Brand Title */}
              <span className="font-semibold text-xs sm:text-sm tracking-tight text-text-main group-hover:text-text-subtle transition-colors whitespace-nowrap">
                Nexus Systems
              </span>
            </a>

            {/* Live Gateway Ping Telemetry */}
            <div className="shrink-0">
              <LiveGatewayPing />
            </div>
          </div>

          {/* Right: Actions Group */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 1. Skills Button */}
            <button
              type="button"
              onClick={() => setIsSkillsOpen(true)}
              className="flex items-center justify-center h-8 w-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-lg border border-surface-border bg-surface-card/60 hover:bg-surface-hover text-text-subtle hover:text-text-main transition-all text-xs font-medium tracking-tight cursor-pointer active:scale-95"
              title="View Skills"
              aria-label="View Skills"
            >
              {/* Mobile Icon: Terminal Prompt (>_) */}
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round sm:hidden"
              >
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              {/* Desktop Text */}
              <span className="hidden sm:inline">Skills</span>
            </button>

            {/* 2. GitHub Source Link */}
            <a
              href="https://github.com/aimalrx200/fullstack-nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-8 w-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-lg border border-surface-border bg-surface-card/60 hover:bg-surface-hover text-text-subtle hover:text-text-main transition-all text-xs font-medium tracking-tight group"
              title="View Monorepo on GitHub"
              aria-label="View Monorepo on GitHub"
            >
              <GithubIcon className="w-3.5 h-3.5 opacity-75 group-hover:opacity-100 transition-opacity" />
              <span className="hidden sm:inline sm:ml-1.5">GitHub</span>
              <span className="hidden sm:inline text-[11px] text-text-subtle/70 group-hover:text-text-subtle ml-1 transition-colors">
                ↗
              </span>
            </a>

            {/* 3. Contact Button */}
            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="flex items-center justify-center h-8 w-8 sm:w-auto sm:px-3.5 sm:py-1.5 rounded-lg bg-text-main text-surface-app hover:opacity-90 font-medium text-xs tracking-tight transition-all cursor-pointer active:scale-95 forced-color-adjust-none"
              title="Open Contact Modal"
              aria-label="Open Contact Modal"
            >
              {/* Mobile Icon (Envelope) */}
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round sm:hidden"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              {/* Desktop Text */}
              <span className="hidden sm:inline">Contact</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modals with isolated scrolling & Escape handlers */}
      <SkillsModal
        isOpen={isSkillsOpen}
        onClose={() => setIsSkillsOpen(false)}
      />
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </>
  );
}
