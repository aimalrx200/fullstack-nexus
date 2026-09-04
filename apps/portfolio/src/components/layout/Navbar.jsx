import { useState, useEffect } from "react";
import { Shield, Command } from "lucide-react";
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
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? "cyber-glass border-b border-[#232334] py-3 shadow-2xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand & Monorepo Badge */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-[#ff6b00]/10 border border-[#ff6b00]/40 flex items-center justify-center text-[#ff6b00] group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold tracking-wider text-[#f0f3ff] uppercase flex items-center gap-1.5">
              FULLSTACK NEXUS
              <span className="text-10px text-[#ff6b00] font-normal">v2.0</span>
            </span>
            <p className="text-10px font-mono text-[#737890]">
              Aimal Khan // Engineer
            </p>
          </div>
        </a>

        {/* Live Telemetry Ping */}
        <div className="hidden lg:flex items-center">
          <LiveGatewayPing />
        </div>

        {/* Navigation & Command Palette Trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenPalette}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#232334] bg-[#0a0a10]/80 text-xs font-mono text-[#737890] hover:text-[#f0f3ff] hover:border-[#ff6b00]/50 transition-colors cursor-pointer"
          >
            <Command className="w-3.5 h-3.5 text-[#ff6b00]" />
            <span>Command Palette</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#141424] text-10px text-[#f0f3ff]">
              ⌘K
            </kbd>
          </button>

          <a
            href="https://github.com/aimalrx200/fullstack-nexus"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#ff6b00]/10 border border-[#ff6b00]/40 text-[#ff6b00] hover:bg-[#ff6b00]/20 text-xs font-mono font-bold uppercase tracking-wider transition-all"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>Monorepo</span>
          </a>
        </div>
      </div>
    </header>
  );
}
