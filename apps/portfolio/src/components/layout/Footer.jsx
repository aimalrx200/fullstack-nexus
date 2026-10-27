// apps/portfolio/src/components/layout/Footer.jsx

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-3.5 sm:py-4 border-t border-surface-border/60 bg-surface-app text-xs text-text-subtle shrink-0 select-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 font-mono text-[11px] sm:text-xs">
        {/* Left: Copyright & Brand */}
        <p className="text-text-subtle/80">
          © {currentYear} Nexus Systems • Distributed Engineering
        </p>

        {/* Right: Direct Attribution Link */}
        <a
          href="https://github.com/aimalrx200"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-subtle hover:text-text-main transition-colors inline-flex items-center gap-1"
        >
          <span>Crafted by</span>
          <span className="text-text-main hover:underline underline-offset-4 decoration-emerald-400">
            Aimal Khan
          </span>
          <span className="text-[10px] text-text-subtle/50">↗</span>
        </a>
      </div>
    </footer>
  );
}
