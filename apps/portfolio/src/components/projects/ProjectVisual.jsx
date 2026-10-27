// apps/portfolio/src/components/projects/ProjectVisual.jsx

export function ProjectVisual({ projectId }) {
  switch (projectId) {
    case "nexus-commerce":
      return (
        <div className="relative w-full h-full bg-[#0a0a0d] overflow-hidden group">
          <img
            src="/projects-preview-images/nexus-commerce.webp"
            alt="Nexus Commerce live interface"
            draggable={false}
            className="w-full h-full object-cover object-top select-none transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {/* Subtle bottom vignette to blend seamlessly into card border */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>
      );

    case "key-vault-manager":
      return (
        <div className="relative w-full h-full bg-[#0a0a0d] overflow-hidden group">
          <img
            src="/projects-preview-images/key-vault.webp"
            alt="Key Vault Manager live interface"
            draggable={false}
            className="w-full h-full object-cover object-top select-none transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {/* Subtle bottom vignette */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>
      );

    case "nexus-stream":
      return (
        <svg
          viewBox="0 0 640 360"
          className="w-full h-full bg-[#070709]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* WebSocket Hub & Live Telemetry Stream */}
          <radialGradient id="stream-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
          <rect width="640" height="360" fill="url(#stream-glow)" />

          <circle cx="320" cy="160" r="14" fill="#10b981" />
          <circle
            cx="320"
            cy="160"
            r="40"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle cx="320" cy="160" r="85" stroke="#27272a" strokeWidth="1.5" />
          <circle
            cx="320"
            cy="160"
            r="130"
            stroke="#27272a"
            strokeWidth="1"
            strokeDasharray="6 6"
          />

          {/* Broadcast Node Satellites */}
          <circle cx="210" cy="120" r="6" fill="#3b82f6" />
          <line
            x1="320"
            y1="160"
            x2="210"
            y2="120"
            stroke="#3b82f6"
            strokeWidth="1.5"
          />

          <circle cx="430" cy="120" r="6" fill="#3b82f6" />
          <line
            x1="320"
            y1="160"
            x2="430"
            y2="120"
            stroke="#3b82f6"
            strokeWidth="1.5"
          />

          <circle cx="320" cy="270" r="6" fill="#10b981" />
          <line
            x1="320"
            y1="160"
            x2="320"
            y2="270"
            stroke="#10b981"
            strokeWidth="1.5"
          />

          {/* Telemetry Badge */}
          <rect
            x="200"
            y="295"
            width="240"
            height="34"
            rx="8"
            fill="#121216"
            stroke="#27272a"
          />
          <text
            x="320"
            y="316"
            fill="#10b981"
            fontSize="12"
            fontWeight="600"
            textAnchor="middle"
            fontFamily="monospace"
          >
            WS BROADCAST • 12ms LATENCY
          </text>
        </svg>
      );

    case "aegis-enclave":
      return (
        <svg
          viewBox="0 0 640 360"
          className="w-full h-full bg-[#070709]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Biometric FIDO2 / Passkey Security Layer */}
          <circle
            cx="320"
            cy="150"
            r="75"
            fill="#121216"
            stroke="#27272a"
            strokeWidth="2"
          />
          <circle
            cx="320"
            cy="150"
            r="55"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          <path
            d="M305 150 L316 161 L338 139"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="180"
            y="270"
            width="280"
            height="34"
            rx="8"
            fill="#121216"
            stroke="#27272a"
          />
          <text
            x="320"
            y="291"
            fill="#fafafa"
            fontSize="12"
            fontWeight="600"
            textAnchor="middle"
            fontFamily="monospace"
          >
            FIDO2 BIOMETRIC ATTESTATION
          </text>
        </svg>
      );

    case "chronos-reconciler":
      return (
        <svg
          viewBox="0 0 640 360"
          className="w-full h-full bg-[#070709]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Distributed Workflow / Reconciliation Worker */}
          <circle cx="320" cy="150" r="70" stroke="#27272a" strokeWidth="2" />
          <path
            d="M320 95 V150 H365"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="320" cy="150" r="4" fill="#3b82f6" />

          <rect
            x="190"
            y="270"
            width="260"
            height="34"
            rx="8"
            fill="#121216"
            stroke="#27272a"
          />
          <text
            x="320"
            y="291"
            fill="#3b82f6"
            fontSize="12"
            fontWeight="600"
            textAnchor="middle"
            fontFamily="monospace"
          >
            CRON: LOCK EXPIRATION WORKER
          </text>
        </svg>
      );

    default:
      return (
        <div className="w-full h-full bg-[#0a0a0d] flex items-center justify-center border-b border-surface-border/60">
          <span className="font-mono text-xs text-text-subtle">
            SYSTEM ENGINE
          </span>
        </div>
      );
  }
}
