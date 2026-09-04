import {
  Shield,
  ArrowRight,
  Server,
  Database,
  Lock,
  KeyRound,
  Globe,
  Layers,
} from "lucide-react";

export function SystemTopology() {
  return (
    <section
      id="topology"
      className="py-20 border-t border-[#232334] bg-[#030305] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-12">
          <span className="text-[#ff6b00] font-mono text-xs font-bold uppercase tracking-wider">
            SYSTEM ARCHITECTURE & FLOW
          </span>
          <h2 className="text-3xl font-bold text-[#f0f3ff] mt-1">
            End-to-End Cryptographic & Distributed Data Pipeline
          </h2>
          <p className="text-sm text-[#737890] font-mono mt-2">
            How requests securely flow from Client $\rightarrow$ Vercel Edge
            Proxy $\rightarrow$ Serverless Express 5 Gateway $\rightarrow$
            Cryptographic Engine & Distributed Stores.
          </p>
        </div>

        {/* Visual Flow Topology Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          {/* Node 1 */}
          <div className="cyber-glass rounded-xl p-5 border border-[#232334] relative">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded bg-[#ff6b00]/10 text-[#ff6b00] text-10px font-bold uppercase">
                TIER 1
              </span>
              <Globe className="w-4 h-4 text-[#ff6b00]" />
            </div>
            <h3 className="font-bold text-[#f0f3ff] text-sm">
              Client (React 19 + Vite)
            </h3>
            <p className="text-[#737890] text-[11px] mt-2 leading-relaxed">
              Command Palette (Cmd+K), Web Locks token single-flight refresh,
              and React Query zero-leak cache eviction.
            </p>
            <div className="mt-4 pt-3 border-t border-[#232334] text-10px text-[#00f0ff]">
              → Sends Signed httpOnly Cookies
            </div>
          </div>

          {/* Node 2 */}
          <div className="cyber-glass rounded-xl p-5 border border-[#232334] relative">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] text-10px font-bold uppercase">
                TIER 2
              </span>
              <Layers className="w-4 h-4 text-[#00f0ff]" />
            </div>
            <h3 className="font-bold text-[#f0f3ff] text-sm">
              Edge Rewrite Proxy
            </h3>
            <p className="text-[#737890] text-[11px] mt-2 leading-relaxed">
              Vercel Edge Proxy maps /api/v1/* without CORS restrictions,
              ensuring 100% 1st-party cookie persistence.
            </p>
            <div className="mt-4 pt-3 border-t border-[#232334] text-10px text-[#00f0ff]">
              → Same-Origin SSL Tunnel
            </div>
          </div>

          {/* Node 3 */}
          <div className="cyber-glass rounded-xl p-5 border border-[#232334] relative">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded bg-[#00ff66]/10 text-[#00ff66] text-10px font-bold uppercase">
                TIER 3
              </span>
              <Lock className="w-4 h-4 text-[#00ff66]" />
            </div>
            <h3 className="font-bold text-[#f0f3ff] text-sm">
              Cryptographic Gateway
            </h3>
            <p className="text-[#737890] text-[11px] mt-2 leading-relaxed">
              Express 5 serverless handler derives Scrypt 256-bit barrier keys
              and executes AES-256-GCM AEAD encryption.
            </p>
            <div className="mt-4 pt-3 border-t border-[#232334] text-10px text-[#00ff66]">
              → Verified Token Family Checks
            </div>
          </div>

          {/* Node 4 */}
          <div className="cyber-glass rounded-xl p-5 border border-[#232334] relative">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded bg-[#ffb700]/10 text-[#ffb700] text-10px font-bold uppercase">
                TIER 4
              </span>
              <Database className="w-4 h-4 text-[#ffb700]" />
            </div>
            <h3 className="font-bold text-[#f0f3ff] text-sm">
              Redis & MongoDB Atlas
            </h3>
            <p className="text-[#737890] text-[11px] mt-2 leading-relaxed">
              Upstash sliding session blacklist (sub-ms lookup) & MongoDB WORM
              tamper-proof HMAC audit trails.
            </p>
            <div className="mt-4 pt-3 border-t border-[#232334] text-10px text-[#ffb700]">
              ✔ Zero Plaintext Stored
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
