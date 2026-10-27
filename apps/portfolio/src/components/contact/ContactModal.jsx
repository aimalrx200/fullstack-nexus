// apps/portfolio/src/components/contact/ContactModal.jsx

import { useState, useEffect, useRef } from "react";
import { GithubIcon } from "../common/Icons";

export function ContactModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef(null);
  const email = "aimal.engineer@gmail.com"; // Replace with your email

  // 1. Keyboard 'Escape' Key Handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 2. Lock Page Scrollbar & Prevent Background Scrolling
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;

    // Compensate for scrollbar width to prevent page content layout shift
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.paddingRight = originalBodyPaddingRight;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    /* Modal Overlay: Handles the scrollbar entirely with overscroll protection */
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/75 backdrop-blur-md p-4 sm:p-6 scrollbar-thin [scrollbar-color:#27272a_transparent] animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      {/* Centering Wrapper: Safe vertical flex centering that prevents top-clipping when scrolled */}
      <div className="min-h-full w-full flex items-center justify-center">
        {/* Contact Card: Natural width and natural height (No scrollbar on card) */}
        <div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl bg-[#0e0e13] border border-white/10 p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.9)] my-auto select-none"
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
            <div className="flex items-center gap-1.5 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                Open to Opportunities
              </span>
            </div>
            <h2
              id="contact-modal-title"
              className="text-lg sm:text-xl font-semibold text-text-main tracking-tight"
            >
              Direct Contact
            </h2>
            <p className="text-xs text-text-subtle mt-1 leading-relaxed">
              Reach out directly for engineering roles, technical advisory, or
              distributed architecture inquiries.
            </p>
          </div>

          {/* 1-Click Copy Email Card */}
          <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-white/3 border border-white/8 mb-3.5">
            <div className="min-w-0 pr-2">
              <span className="block text-[10px] font-mono text-text-subtle uppercase tracking-wider">
                Primary Email
              </span>
              <span className="block text-xs sm:text-sm font-mono text-text-main truncate mt-0.5">
                {email}
              </span>
            </div>
            <button
              type="button"
              onClick={copyEmail}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all shrink-0 cursor-pointer ${
                copied
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/8 hover:bg-white/15 text-text-main border border-white/6"
              }`}
            >
              {copied ? "Copied! ✓" : "Copy"}
            </button>
          </div>

          {/* Channels */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <a
              href="https://github.com/aimalrx200"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/2 border border-white/6 hover:bg-white/6 text-xs font-mono text-text-subtle hover:text-text-main transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub ↗</span>
            </a>
            <a
              href="https://linkedin.com/in/your-profile"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/2 border border-white/6 hover:bg-white/6 text-xs font-mono text-text-subtle hover:text-text-main transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
              </svg>
              <span>LinkedIn ↗</span>
            </a>
          </div>

          {/* Native Mail Client Action */}
          <a
            href={`mailto:${email}?subject=Engineering%20Inquiry`}
            className="w-full flex items-center justify-center py-2.5 rounded-xl bg-text-main text-surface-app font-medium text-xs hover:opacity-90 transition-opacity cursor-pointer forced-color-adjust-none"
          >
            Compose Email in Client ↗
          </a>

          {/* Keyboard dismissal indicator */}
          <p className="text-center text-[10px] font-mono text-text-subtle/40 mt-3 sm:mt-4">
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
