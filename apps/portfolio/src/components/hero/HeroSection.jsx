import {
  ArrowRight,
  Zap,
  Database,
  Lock,
  Cpu,
  Server,
  Shield,
} from "lucide-react";

export function HeroSection({ onOpenTopology }) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Cyber Grid & Glow */}
      <div className="cyber-grid absolute inset-0 -z-10 opacity-70" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ff6b00]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Status Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#ff6b00]/30 bg-[#ff6b00]/10 text-[#ff6b00] font-mono text-xs mb-6 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-pulse" />
          <span>Full-Stack Systems &amp; Distributed Engineering Monorepo</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#f0f3ff] max-w-5xl leading-[1.1]">
          Architecting Zero-Trust Systems, Distributed Caching &amp;
          Cryptographic Platforms.
        </h1>

        {/* Bio Narrative */}
        <p className="mt-6 text-base sm:text-lg text-[#737890] max-w-3xl leading-relaxed">
          I build high-concurrency cloud architectures with hardware-grade AEAD
          cryptography, Redis sliding token rotation, zero-leak cache eviction,
          and resilient serverless connection pooling.
        </p>

        {/* CTA Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="https://fullstack-nexus-frontend.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#ff6b00] hover:bg-[#ff8533] text-black font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(255,107,0,0.4)] transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Launch Flagship Live Demo (Key Vault)</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={onOpenTopology}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#232334] bg-[#0a0a10] hover:bg-[#141424] hover:border-[#ff6b00]/40 text-[#f0f3ff] font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-[#00f0ff]" />
            <span>Explore Monorepo Topology</span>
          </button>
        </div>

        {/* Engineering Badges Bar */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="cyber-glass rounded-lg p-3.5 flex items-center gap-3">
            <Lock className="w-4 h-4 text-[#ff6b00] shrink-0" />
            <div>
              <p className="text-[#f0f3ff] font-bold">AES-256-GCM AEAD</p>
              <p className="text-10px text-[#737890]">Zero Plaintext at Rest</p>
            </div>
          </div>
          <div className="cyber-glass rounded-lg p-3.5 flex items-center gap-3">
            <Server className="w-4 h-4 text-[#00f0ff] shrink-0" />
            <div>
              <p className="text-[#f0f3ff] font-bold">Token Family Rotation</p>
              <p className="text-10px text-[#737890]">
                2,000ms Concurrency Buffer
              </p>
            </div>
          </div>
          <div className="cyber-glass rounded-lg p-3.5 flex items-center gap-3">
            <Database className="w-4 h-4 text-[#00ff66] shrink-0" />
            <div>
              <p className="text-[#f0f3ff] font-bold">Upstash Redis Cache</p>
              <p className="text-10px text-[#737890]">
                Sliding Session Blacklist
              </p>
            </div>
          </div>
          <div className="cyber-glass rounded-lg p-3.5 flex items-center gap-3">
            <Shield className="w-4 h-4 text-[#ffb700] shrink-0" />
            <div>
              <p className="text-[#f0f3ff] font-bold">Edge Rewrite Proxy</p>
              <p className="text-10px text-[#737890]">100% 1st-Party Cookies</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
