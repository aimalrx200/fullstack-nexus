// apps/portfolio/src/components/skills/SkillsModal.jsx

import { useEffect, useRef } from "react";

const SKILL_CLUSTERS = [
  {
    category: "Distributed & Backend Systems",
    skills: [
      "Node.js",
      "Express",
      "Redis",
      "MongoDB",
      "WebSockets",
      "FSM Architecture",
      "Distributed Locking",
      "Cron Workers",
    ],
  },
  {
    category: "Security & Zero-Trust",
    skills: [
      "WebAuthn / FIDO2",
      "Passkeys",
      "AES-256-GCM Envelope Encryption",
      "JWT & Session Caching",
      "RBAC",
      "Tamper-Evident Audit Logs",
    ],
  },
  {
    category: "Frontend & Spatial Engineering",
    skills: [
      "React",
      "Redux Toolkit",
      "Vite",
      "3D Euclidean CSS",
      "Tailwind CSS",
      "Real-Time Telemetry Streams",
    ],
  },
  {
    category: "Tooling & Infrastructure",
    skills: [
      "Docker",
      "GitHub Actions CI/CD",
      "Husky",
      "Monorepo Workspaces",
      "FFmpeg / WebP",
      "Linux",
    ],
  },
];

export function SkillsModal({ isOpen, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Page Scroll Lock
  useEffect(() => {
    if (!isOpen) return;
    const origBody = document.body.style.overflow;
    const origHtml = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = origHtml;
      document.body.style.overflow = origBody;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/75 backdrop-blur-md p-4 sm:p-6 scrollbar-thin [scrollbar-color:#27272a_transparent] animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="min-h-full w-full flex items-center justify-center">
        <div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl bg-[#0e0e13] border border-white/10 p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.9)] my-auto select-none"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 h-7 w-7 rounded-lg border border-white/8 bg-white/4 hover:bg-white/8 flex items-center justify-center text-text-subtle hover:text-text-main text-xs transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>

          {/* Header */}
          <div className="mb-5 pr-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
              Technical Capabilities
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-text-main tracking-tight mt-0.5">
              System Architecture & Stack
            </h2>
            <p className="text-xs text-text-subtle mt-1 leading-relaxed">
              Core technologies deployed across production services in this
              monorepo.
            </p>
          </div>

          {/* Categorized Skills Cluster */}
          <div className="space-y-4">
            {SKILL_CLUSTERS.map((group) => (
              <div
                key={group.category}
                className="p-3.5 rounded-xl bg-white/2 border border-white/6"
              >
                <h3 className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-2.5">
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md bg-white/4 border border-white/6 text-xs font-mono text-text-main"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[10px] font-mono text-text-subtle/40 mt-4">
            Press{" "}
            <kbd className="px-1 py-0.5 rounded bg-white/6 border border-white/8 text-[9px]">
              ESC
            </kbd>{" "}
            or click outside to dismiss
          </p>
        </div>
      </div>
    </div>
  );
}
