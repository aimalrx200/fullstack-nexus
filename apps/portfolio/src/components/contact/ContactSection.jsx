// apps/portfolio/src/components/contact/ContactSection.jsx

import { Mail, ArrowUpRight, Sparkles } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../common/Icons";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="py-24 border-t border-surface-border bg-surface-app relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Section Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Get in Touch</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-bold text-text-main tracking-tight">
          Let’s build something great together.
        </h2>

        {/* Subtitle */}
        <p className="mt-3 text-sm sm:text-base text-text-subtle max-w-xl mx-auto leading-relaxed">
          Open to full-stack engineering opportunities, exciting product builds,
          and collaborations. Feel free to reach out anytime.
        </p>

        {/* Contact Links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 text-xs">
          {/* Email Button */}
          <a
            href="mailto:contact@example.com"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-primary text-black font-semibold uppercase tracking-wider hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/20 transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Send Email</span>
          </a>

          {/* GitHub Profile */}
          <a
            href="https://github.com/aimalrx200"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-surface-border bg-surface-card text-text-main font-semibold uppercase tracking-wider hover:bg-surface-hover hover:border-brand-primary/40 transition-all"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-text-subtle" />
          </a>

          {/* LinkedIn Profile */}
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-surface-border bg-surface-card text-text-main font-semibold uppercase tracking-wider hover:bg-surface-hover hover:border-brand-primary/40 transition-all"
          >
            <LinkedinIcon className="w-4 h-4" />
            <span>LinkedIn</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-text-subtle" />
          </a>
        </div>

        {/* Response Guarantee Badge */}
        <div className="mt-8 inline-flex items-center gap-2 text-xs text-text-subtle">
          <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
          <span>Typically responds within 24 hours</span>
        </div>
      </div>
    </section>
  );
}
