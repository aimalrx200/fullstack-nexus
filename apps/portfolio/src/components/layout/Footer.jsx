// apps/portfolio/src/components/layout/Footer.jsx

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-4 sm:py-5 border-t border-surface-border/60 bg-surface-app text-xs text-text-subtle shrink-0">
      <div className="w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 items-center gap-2 sm:gap-0">
        {/* Left: Spacer to ensure the center remains mathematically centered */}
        <div className="hidden sm:block" aria-hidden="true" />

        {/* Center: Copyright */}
        <div className="flex items-center justify-center text-center">
          <p className="text-[11px] sm:text-xs text-text-subtle font-mono">
            © {currentYear} Nexus Systems. All rights reserved.
          </p>
        </div>

        {/* Right: Signature without "by" */}
        <div className="flex items-center justify-center sm:justify-end">
          <span className="font-mono text-text-subtle text-[11px] sm:text-xs">
            Aimal Khan
          </span>
        </div>
      </div>
    </footer>
  );
}
