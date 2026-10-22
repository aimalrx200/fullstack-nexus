// apps/portfolio/src/components/telemetry/LiveGatewayPing.jsx

import { useState, useEffect } from "react";

export function LiveGatewayPing() {
  const [status, setStatus] = useState("measuring"); // 'measuring' | 'online' | 'degraded'

  useEffect(() => {
    let isMounted = true;

    const checkServiceHealth = async () => {
      try {
        const targetUrl = "https://fullstack-nexus-backend.vercel.app/api/v1";
        await fetch(targetUrl, { method: "HEAD", mode: "no-cors" });

        if (isMounted) {
          setStatus("online");
        }
      } catch {
        if (isMounted) {
          setStatus("degraded");
        }
      }
    };

    checkServiceHealth();
    const interval = setInterval(checkServiceHealth, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const config = {
    measuring: {
      dotColor: "bg-amber-400",
      text: "Checking status...",
    },
    online: {
      dotColor: "bg-emerald-500",
      text: "All Systems Operational",
    },
    degraded: {
      dotColor: "bg-amber-400",
      text: "Experiencing Delays",
    },
  };

  const current = config[status];

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-surface-border bg-surface-card/60 text-xs text-text-muted transition-colors">
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.dotColor}`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${current.dotColor}`}
        />
      </span>

      <span className="font-medium text-text-main text-[11px] sm:text-xs">
        {current.text}
      </span>
    </div>
  );
}
