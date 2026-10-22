// apps/portfolio/src/components/layout/Footer.jsx

export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="py-8 border-t border-surface-border bg-surface-app text-xs text-text-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Clean, brand-focused copyright */}
        <p>© {currentYear} Nexus. All rights reserved.</p>

        {/* Clutter-free actions */}
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/aimalrx200/fullstack-nexus"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-main transition-colors"
          >
            GitHub
          </a>
          <span className="text-surface-border">·</span>
          <button
            type="button"
            onClick={scrollToTop}
            className="hover:text-text-main transition-colors cursor-pointer"
          >
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
