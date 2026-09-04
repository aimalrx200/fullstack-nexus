import { Mail, ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../common/Icons";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="py-20 border-t border-[#232334] bg-[#030305]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <span className="text-[#ff6b00] font-mono text-xs font-bold uppercase tracking-wider">
          INITIATE CONTACT
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#f0f3ff] mt-2">
          Let&apos;s Build Resilient Distributed Systems.
        </h2>
        <p className="mt-4 text-sm font-mono text-[#737890] max-w-xl mx-auto">
          Open to Staff / Senior Full-Stack Engineering, Distributed Systems
          Architecture, and Cryptographic Security roles.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 font-mono text-xs">
          <a
            href="mailto:aimalkhan@example.com"
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#ff6b00] text-black font-bold uppercase hover:bg-[#ff8533] transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>Send Email</span>
          </a>

          <a
            href="https://github.com/aimalrx200"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-lg border border-[#232334] bg-[#0a0a10] text-[#f0f3ff] hover:border-[#ff6b00]/40 transition-all"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub Profile</span>
            <ArrowUpRight className="w-3 h-3 text-[#737890]" />
          </a>

          <a
            href="https://linkedin.com/in/aimalkhan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-lg border border-[#232334] bg-[#0a0a10] text-[#f0f3ff] hover:border-[#ff6b00]/40 transition-all"
          >
            <LinkedinIcon className="w-4 h-4" />
            <span>LinkedIn</span>
            <ArrowUpRight className="w-3 h-3 text-[#737890]" />
          </a>
        </div>
      </div>
    </section>
  );
}
