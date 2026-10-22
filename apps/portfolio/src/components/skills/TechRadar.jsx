// apps/portfolio/src/components/skills/TechRadar.jsx

import { SKILLS_CATEGORIES } from "../../data/skills.data";
import { Sparkles, Code2, Server, ShieldCheck, Database } from "lucide-react";

export function TechRadar() {
  const icons = [Code2, Server, Database, ShieldCheck];

  const categories = Array.isArray(SKILLS_CATEGORIES) ? SKILLS_CATEGORIES : [];

  return (
    <section
      id="skills"
      className="py-20 border-t border-surface-border bg-surface-app"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Skills &amp; Expertise</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main tracking-tight">
            Tools &amp; Technologies
          </h2>
          <p className="text-sm text-text-subtle mt-2 max-w-2xl leading-relaxed">
            A comprehensive look at the modern frameworks, databases, and
            development tools used to build fast, dependable, and responsive web
            products.
          </p>
        </div>

        {/* Skills Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat, idx) => {
            const Icon = icons[idx % icons.length] || Code2;

            return (
              <div
                key={cat.name}
                className="cyber-glass rounded-2xl p-6 sm:p-7 border border-surface-border flex flex-col justify-between cyber-glass-hover transition-all"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-base sm:text-lg text-text-main">
                      {cat.name}
                    </h3>
                  </div>

                  {cat.description && (
                    <p className="text-xs text-text-subtle mb-6 leading-relaxed">
                      {cat.description}
                    </p>
                  )}

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {cat.skills?.map((skill) => (
                      <div
                        key={skill.name}
                        className="px-3.5 py-2.5 rounded-xl bg-surface-card border border-surface-border flex items-center justify-between transition-colors hover:border-brand-primary/30"
                      >
                        <span className="text-xs font-medium text-text-main">
                          {skill.name}
                        </span>
                        {skill.level && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary font-semibold">
                            {skill.level}
                          </span>
                        )}
                      </div>
                    ))}
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
