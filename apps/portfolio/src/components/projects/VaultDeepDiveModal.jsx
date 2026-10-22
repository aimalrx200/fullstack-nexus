// apps/portfolio/src/components/projects/VaultDeepDiveModal.jsx

import { X, Sparkles, ExternalLink, CheckCircle2 } from "lucide-react";
import { GithubIcon } from "../common/Icons";

export function VaultDeepDiveModal({ isOpen, onClose, project }) {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      {/* Backdrop Dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-6 sm:p-7 text-text-main space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-surface-border gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                {project.badge || "Live Showcase"}
              </span>
              {project.category && (
                <span className="text-text-subtle text-xs">
                  {project.category}
                </span>
              )}
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-text-main tracking-tight">
              {project.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-subtle hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer shrink-0"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Project Metrics Grid */}
        {project.metrics?.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {project.metrics.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-surface-hover/70 rounded-xl border border-surface-border"
              >
                <span className="text-text-subtle text-[11px] block">
                  {item.label}
                </span>
                <span className="text-text-main font-semibold text-xs mt-0.5 block truncate">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Overview Narrative */}
        <div className="space-y-1.5">
          <h4 className="font-semibold text-text-main text-xs uppercase tracking-wider">
            About the Project
          </h4>
          <p className="text-text-subtle text-sm leading-relaxed">
            {project.tagline || project.description}
          </p>
        </div>

        {/* 1-Click Demo Notice */}
        {project.demoCredentials?.description && (
          <div className="p-3.5 rounded-xl border border-brand-primary/20 bg-brand-primary/5 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
            <p className="text-xs text-text-main leading-relaxed">
              <strong>Quick Evaluation:</strong>{" "}
              {project.demoCredentials.description}
            </p>
          </div>
        )}

        {/* Key Features List */}
        {project.architectureHighlights?.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-text-main text-xs uppercase tracking-wider">
              Core Features &amp; Highlights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {project.architectureHighlights.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface-hover/40 border border-surface-border flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-xs text-text-main">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-text-subtle mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technologies Used */}
        {project.techStack?.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-text-subtle text-xs uppercase tracking-wider">
              Built With
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-0.5 rounded-md bg-surface-hover border border-surface-border text-[11px] text-text-subtle"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-surface-border">
          {project.links?.liveDemo && (
            <a
              href={project.links.liveDemo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl bg-brand-primary text-black font-semibold text-center text-xs hover:bg-brand-primary-hover transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Launch Live App</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {project.links?.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl border border-surface-border bg-surface-hover text-text-main font-semibold text-center text-xs hover:border-brand-primary/40 transition-colors flex items-center justify-center gap-2"
            >
              <GithubIcon className="w-4 h-4" />
              <span>View Source</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
