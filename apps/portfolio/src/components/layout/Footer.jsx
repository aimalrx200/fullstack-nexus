export function Footer() {
  return (
    <footer className="py-8 border-t border-[#232334] bg-[#030305] font-mono text-xs text-[#737890]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>
          © 2026 Aimal Khan. Built with React 19, Tailwind CSS v4 & Vercel
          Serverless.
        </p>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-[#00ff66]">
            ● All Monorepo Systems Operational
          </span>
          <span className="text-[#232334]">|</span>
          <a
            href="https://github.com/aimalrx200/fullstack-nexus"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#f0f3ff] transition-colors"
          >
            fullstack-nexus
          </a>
        </div>
      </div>
    </footer>
  );
}
