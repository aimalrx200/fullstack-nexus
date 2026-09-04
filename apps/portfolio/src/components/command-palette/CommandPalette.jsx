import { useState, useEffect, useRef } from "react";
import { Search, X, ArrowRight } from "lucide-react";

export function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    {
      id: "vault-demo",
      title: "Launch Flagship: Key Vault Manager",
      desc: "Opens the live production app with 1-Click demo evaluator access",
      category: "Flagship App",
      action: () => {
        onClose();
        window.open("https://fullstack-nexus-frontend.vercel.app", "_blank");
      },
    },
    {
      id: "api-gateway",
      title: "Inspect API Gateway (Health Check)",
      desc: "Live backend serverless Express 5 endpoint on Vercel",
      category: "Backend",
      action: () => {
        onClose();
        window.open(
          "https://fullstack-nexus-backend.vercel.app/api/v1",
          "_blank",
        );
      },
    },
    {
      id: "github-monorepo",
      title: "View GitHub Monorepo (fullstack-nexus)",
      desc: "Explore npm workspaces, CI/CD pipeline, and source code",
      category: "Source Code",
      action: () => {
        onClose();
        window.open("https://github.com/aimalrx200/fullstack-nexus", "_blank");
      },
    },
    {
      id: "scroll-topology",
      title: "Jump to System Architecture Topology",
      desc: "Scrolls to the end-to-end data pipeline diagram",
      category: "Navigation",
      action: () => {
        onClose();
        document
          .getElementById("topology")
          ?.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      id: "scroll-projects",
      title: "Jump to Projects Showcase Registry",
      desc: "View all active and upcoming pipeline projects",
      category: "Navigation",
      action: () => {
        onClose();
        document
          .getElementById("projects")
          ?.scrollIntoView({ behavior: "smooth" });
      },
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.desc.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-sm font-mono">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#0a0a10] border border-[#232334] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#232334] bg-[#141424]">
          <Search className="w-4 h-4 text-[#ff6b00]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, project name, or system keyword..."
            className="w-full bg-transparent text-xs text-[#f0f3ff] placeholder:text-[#737890] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-[#737890] hover:text-[#f0f3ff] cursor-pointer"
            aria-label="Close Command Palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="p-2 divide-y divide-[#232334]/50 max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-xs text-[#737890]">
              No commands matching &quot;{query}&quot;
            </p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className="w-full text-left p-3 rounded-lg hover:bg-[#141424] transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#f0f3ff] group-hover:text-[#ff6b00] transition-colors">
                      {item.title}
                    </span>
                    <span className="text-10px px-1.5 py-0.2 rounded bg-[#232334] text-[#737890]">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#737890] mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#737890] group-hover:text-[#ff6b00] transition-colors" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
