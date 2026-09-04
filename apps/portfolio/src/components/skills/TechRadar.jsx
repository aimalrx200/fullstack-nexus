import { SKILLS_CATEGORIES } from "../../data/skills.data";
import { CheckCircle2, ShieldCheck, Cpu, Code2, Server } from "lucide-react";

export function TechRadar() {
  const icons = [Server, ShieldCheck, Code2, Cpu];

  return (
    <section id="skills" className="py-20 border-t border-[#232334]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-12">
          <span className="text-[#ff6b00] font-mono text-xs font-bold uppercase tracking-wider">
            TECHNICAL MASTERY & DOMAINS
          </span>
          <h2 className="text-3xl font-bold text-[#f0f3ff] mt-1">
            System Engineering Capabilities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SKILLS_CATEGORIES.map((cat, idx) => {
            const Icon = icons[idx] || Server;

            return (
              <div
                key={cat.name}
                className="cyber-glass rounded-xl p-6 border border-[#232334]"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded bg-[#ff6b00]/10 text-[#ff6b00]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-[#f0f3ff]">
                    {cat.name}
                  </h3>
                </div>
                <p className="text-xs font-mono text-[#737890] mb-5">
                  {cat.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                  {cat.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="p-2.5 rounded bg-[#030305]/80 border border-[#232334] flex items-center justify-between"
                    >
                      <span className="text-[#f0f3ff]">{skill.name}</span>
                      <span className="text-10px px-1.5 py-0.5 rounded bg-[#ff6b00]/10 text-[#ff6b00] font-bold">
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
