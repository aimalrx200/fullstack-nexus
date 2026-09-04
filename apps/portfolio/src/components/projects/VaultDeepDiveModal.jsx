import { X, Shield, Zap } from "lucide-react";
import { GithubIcon } from "../common/Icons";

export function VaultDeepDiveModal({ isOpen, onClose, project }) {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0a0a10] border border-[#232334] rounded-xl shadow-2xl p-6 text-[#f0f3ff] space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#232334]">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#ff6b00]" />
            <h3 className="font-bold text-sm tracking-wider uppercase text-[#f0f3ff]">
              Deep Dive // Key Vault Manager Specifications
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#737890] hover:text-[#f0f3ff] cursor-pointer"
            aria-label="Close Deep Dive Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cryptographic Spec Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#141424] rounded-lg border border-[#232334]">
            <span className="text-[#737890] text-10px uppercase block">
              Encryption Standard
            </span>
            <span className="text-[#00ff66] font-bold">AES-256-GCM (AEAD)</span>
          </div>
          <div className="p-3 bg-[#141424] rounded-lg border border-[#232334]">
            <span className="text-[#737890] text-10px uppercase block">
              Master Key Derivation
            </span>
            <span className="text-[#00f0ff] font-bold">
              Scrypt 256-bit Sync
            </span>
          </div>
          <div className="p-3 bg-[#141424] rounded-lg border border-[#232334]">
            <span className="text-[#737890] text-10px uppercase block">
              Session Invalidation
            </span>
            <span className="text-[#ffb700] font-bold">
              Upstash Redis Sliding Set
            </span>
          </div>
          <div className="p-3 bg-[#141424] rounded-lg border border-[#232334]">
            <span className="text-[#737890] text-10px uppercase block">
              Cookie Architecture
            </span>
            <span className="text-[#f0f3ff] font-bold">
              SameSite=Strict (1st-Party Edge)
            </span>
          </div>
        </div>

        {/* Architecture Summary */}
        <div className="space-y-3 text-xs">
          <h4 className="font-bold text-[#ff6b00] uppercase text-[11px]">
            Engine Architecture Summary
          </h4>
          <p className="text-[#737890] leading-relaxed">
            Standard vaults store secrets unencrypted or rely on raw token
            cookies vulnerable to XSS and CSRF. Key Vault Manager enforces a
            defense-in-depth zero-trust pipeline: every secret is generated with
            a dedicated 96-bit IV and 128-bit authentication tag, refreshed
            through atomic database concurrency gates with Web Locks
            synchronization, and sealed behind an immutable SHA-256 Merkle audit
            trail.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-[#232334]">
          <a
            href={project.links?.liveDemo || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded bg-[#ff6b00] text-black font-bold text-center text-xs uppercase hover:bg-[#ff8533] transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Launch Live App</span>
          </a>
          <a
            href={project.links?.github || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded border border-[#232334] bg-[#141424] text-[#f0f3ff] font-bold text-center text-xs uppercase hover:bg-[#232334] transition-colors flex items-center justify-center gap-2"
          >
            <GithubIcon className="w-4 h-4" />
            <span>Source Code</span>
          </a>
        </div>
      </div>
    </div>
  );
}
