import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-lg",
  showCloseButton = true,
}) {
  const modalRef = useRef(null);

  // Lock background page scroll & trap Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // Completely lock the background page from scrolling
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        /* Outer Modal Scroll Environment: Captures all scroll events across the entire viewport */
        <div
          className="fixed inset-0 z-70 overflow-y-auto overscroll-contain custom-scrollbar select-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md pointer-events-none"
            aria-hidden="true"
          />

          {/* Full-Height Scrollable Canvas: Mouse hovering anywhere here scrolls the modal */}
          <div
            className="relative min-h-full flex items-center justify-center p-0 sm:p-4 md:p-6 cursor-pointer"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose?.();
              }
            }}
          >
            {/* Modal Content Window */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full ${maxWidth} bg-surface-card border-0 sm:border border-border-main rounded-none sm:rounded-3xl shadow-2xl z-10 flex flex-col my-auto cursor-default select-text`}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between rounded-t-3xl px-6 py-4 border-b border-border-subtle bg-surface-card/90 backdrop-blur-xs shrink-0">
                  <div>
                    {title && (
                      <h3
                        id="modal-title"
                        className="text-base sm:text-lg font-semibold text-text-main tracking-tight"
                      >
                        {title}
                      </h3>
                    )}
                    {description && (
                      <p className="text-xs text-text-muted mt-0.5">
                        {description}
                      </p>
                    )}
                  </div>

                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="min-h-11 min-w-11 -mr-2 rounded-xl flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-elevated transition-colors cursor-pointer"
                      aria-label="Close dialog"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content Area */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-center">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
