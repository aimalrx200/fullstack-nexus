import { useState } from "react";
import { PROJECTS_REGISTRY } from "../../data/projects.data";
import { ExternalLink, Zap, ArrowRight } from "lucide-react";
import { GithubIcon } from "../common/Icons";

export function ProjectRegistryGrid({ onOpenDeepDive }) {
  const [filter, setFilter] = useState("ALL");

  const categories = [
    "ALL",
    "Security & Distributed Systems",
    "Distributed Systems & Streaming",
    "AI Infrastructure & Vector Search",
  ];

  const projectsList = Array.isArray(PROJECTS_REGISTRY)
    ? PROJECTS_REGISTRY
    : [];

  const filteredProjects = projectsList.filter((p) => {
    if (filter === "ALL") return true;
    return p.category === filter;
  });

  return (
    <section id="projects" className="py-20 border-t border-[#232334]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[#ff6b00] font-mono text-xs font-bold uppercase tracking-wider">
              PORTFOLIO REGISTRY &amp; SHOWCASE
            </span>
            <h2 className="text-3xl font-bold text-[#f0f3ff] mt-1">
              Production Systems &amp; Project Pipeline
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-md border transition-all cursor-pointer ${
                  filter === cat
                    ? "bg-[#ff6b00]/15 border-[#ff6b00] text-[#ff6b00] font-bold"
                    : "border-[#232334] bg-[#0a0a10] text-[#737890] hover:text-[#f0f3ff]"
                }`}
              >
                {cat === "ALL" ? "All Projects" : cat.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const isFlagship = project.tier === "flagship";

            return (
              <div
                key={project.id}
                className={`cyber-glass rounded-xl p-6 flex flex-col justify-between cyber-glass-hover transition-all relative ${
                  isFlagship
                    ? "lg:col-span-2 border-[#ff6b00]/30 shadow-[0_0_30px_rgba(255,107,0,0.1)]"
                    : "border-[#232334]"
                }`}
              >
                <div>
                  {/* Badge & Category */}
                  <div className="flex items-center justify-between gap-2 mb-4 font-mono text-[11px]">
                    <span
                      className={`px-2.5 py-1 rounded font-bold uppercase ${
                        isFlagship
                          ? "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30"
                          : "bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30"
                      }`}
                    >
                      {project.badge}
                    </span>
                    <span className="text-[#737890]">{project.category}</span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-xl font-bold text-[#f0f3ff] tracking-tight">
                    {project.title}
                  </h3>
                  <p className="text-xs font-mono text-[#737890] mt-3 leading-relaxed">
                    {project.tagline}
                  </p>

                  {/* Flagship Evaluator Highlight */}
                  {isFlagship && project.demoCredentials && (
                    <div className="my-5 p-3 rounded-lg border border-[#ff6b00]/30 bg-[#ff6b00]/5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-mono text-[#ff6b00]">
                        <Zap className="w-4 h-4 fill-current" />
                        <span className="font-bold">
                          1-Click Evaluator Demo Access Enabled
                        </span>
                      </div>
                      <a
                        href={project.links?.liveDemo || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded bg-[#ff6b00] text-black font-mono text-[11px] font-bold uppercase hover:bg-[#ff8533] transition-colors shrink-0"
                      >
                        Instant Launch ➔
                      </a>
                    </div>
                  )}

                  {/* Architecture Bullets */}
                  <div className="mt-4 space-y-2 font-mono text-xs">
                    {project.architectureHighlights?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-[#f0f3ff]"
                      >
                        <span className="text-[#ff6b00] font-bold">›</span>
                        <div>
                          <strong className="text-[#f0f3ff]">
                            {item.title}:
                          </strong>{" "}
                          <span className="text-[#737890]">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Tags & Footer Links */}
                <div className="mt-6 pt-4 border-t border-[#232334]">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.techStack?.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded bg-[#141424] border border-[#232334] text-10px font-mono text-[#737890]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3 font-mono text-xs">
                    {isFlagship ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpenDeepDive(project)}
                          className="text-[#ff6b00] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <span>Deep-Dive Specs</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-3">
                          <a
                            href={project.links?.github || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#737890] hover:text-[#f0f3ff] flex items-center gap-1"
                          >
                            <GithubIcon className="w-3.5 h-3.5" /> Source
                          </a>
                          <a
                            href={project.links?.liveDemo || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00ff66] hover:underline flex items-center gap-1 font-bold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                          </a>
                        </div>
                      </>
                    ) : (
                      <span className="text-[#737890] text-[11px] italic">
                        Architecture in Progress in fullstack-nexus monorepo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
