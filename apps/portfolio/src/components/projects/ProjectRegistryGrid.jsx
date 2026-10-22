// apps/portfolio/src/components/projects/ProjectRegistryGrid.jsx

import { useMemo } from "react";
import { PROJECTS_REGISTRY } from "../../data/projects.data";
import { ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";
import { GithubIcon } from "../common/Icons";

// Whitelist only the two active projects in your monorepo
const VALID_PROJECT_IDS = ["nexus-commerce", "key-vault-manager", "key-vault"];

export function ProjectRegistryGrid({ onOpenDeepDive }) {
  // Filter exclusively for Nexus Commerce and Key Vault Manager
  const activeProjects = useMemo(() => {
    const list = Array.isArray(PROJECTS_REGISTRY) ? PROJECTS_REGISTRY : [];
    return list.filter((p) => {
      const id = p.id?.toLowerCase() || "";
      const title = p.title?.toLowerCase() || "";
      return (
        VALID_PROJECT_IDS.includes(id) ||
        title.includes("nexus") ||
        title.includes("vault")
      );
    });
  }, []);

  return (
    <section
      id="projects"
      className="py-20 border-t border-surface-border bg-surface-app"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <span>Featured Work</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main tracking-tight">
            Featured Projects &amp; Live Demos
          </h2>
          <p className="text-sm text-text-subtle mt-2 max-w-2xl leading-relaxed">
            Explore live production applications featuring responsive
            interfaces, secure access, and real-time experiences.
          </p>
        </div>

        {/* 2-Column Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeProjects.map((project) => (
            <div
              key={project.id}
              className="cyber-glass rounded-2xl p-6 sm:p-8 border border-surface-border flex flex-col justify-between cyber-glass-hover transition-all"
            >
              <div>
                {/* Category & Badge */}
                <div className="flex items-center justify-between gap-2 mb-4 text-xs">
                  {project.badge && (
                    <span className="px-2.5 py-0.5 rounded-full font-semibold uppercase text-[11px] bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                      {project.badge}
                    </span>
                  )}
                  {project.category && (
                    <span className="text-text-subtle text-[11px]">
                      {project.category}
                    </span>
                  )}
                </div>

                {/* Project Title & Tagline */}
                <h3 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
                  {project.title}
                </h3>
                <p className="text-sm text-text-subtle mt-2 leading-relaxed">
                  {project.tagline || project.description}
                </p>

                {/* Key Features Highlights */}
                {project.architectureHighlights?.length > 0 && (
                  <div className="mt-5 space-y-2.5">
                    {project.architectureHighlights
                      .slice(0, 3)
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-text-main"
                        >
                          <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                          <span className="leading-snug">
                            <strong>{item.title}:</strong>{" "}
                            <span className="text-text-subtle">
                              {item.desc}
                            </span>
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Technologies & Actions Footer */}
              <div className="mt-8 pt-5 border-t border-surface-border">
                {/* Tech Chips */}
                {project.techStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-0.5 rounded-md bg-surface-hover border border-surface-border text-[11px] text-text-subtle"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Links */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  {onOpenDeepDive && (
                    <button
                      type="button"
                      onClick={() => onOpenDeepDive(project)}
                      className="text-text-subtle hover:text-text-main flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <span>Overview</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="flex items-center gap-3 ml-auto">
                    {project.links?.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-subtle hover:text-text-main flex items-center gap-1.5 transition-colors px-2 py-1 rounded"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        <span>Source</span>
                      </a>
                    )}

                    {project.links?.liveDemo && (
                      <a
                        href={project.links.liveDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-primary text-black font-semibold hover:bg-brand-primary-hover transition-colors shadow-sm"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
