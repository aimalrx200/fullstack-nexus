// apps/portfolio/src/components/projects/PerspectiveCarousel.jsx

import { useState, useEffect, useRef } from "react";
import { GithubIcon } from "../common/Icons";

const REEL_PROJECTS = [
  {
    id: "nexus-commerce",
    title: "Nexus Commerce",
    description:
      "Distributed e-commerce engine engineered for high-concurrency flash sales with Redis inventory locking, order FSM, and WebAuthn passkeys.",
    liveUrl: "https://nexus-commerce.vercel.app",
    codeUrl:
      "https://github.com/aimalrx200/fullstack-nexus/tree/main/apps/nexus-commerce",
    isLive: true,
  },
  {
    id: "key-vault-manager",
    title: "Key Vault Manager",
    description:
      "Zero-trust cryptographic secrets platform featuring envelope encryption, machine identity tokens, and tamper-evident audit logs.",
    liveUrl: "https://key-vault.vercel.app",
    codeUrl:
      "https://github.com/aimalrx200/fullstack-nexus/tree/main/apps/key-vault-manager",
    isLive: true,
  },
  {
    id: "nexus-stream",
    title: "Nexus Stream",
    description:
      "Low-latency WebSocket telemetry router broadcasting live courier coordinates, order feeds, and real-time audio chimes.",
    liveUrl: "https://fullstack-nexus-backend.vercel.app/api/v1",
    codeUrl: "https://github.com/aimalrx200/fullstack-nexus",
    isLive: true,
  },
  {
    id: "aegis-enclave",
    title: "Aegis Enclave",
    description:
      "Hardware-backed security layer enforcing biometric FIDO2 authentication and zero-knowledge session assertions.",
    liveUrl: "https://key-vault.vercel.app",
    codeUrl: "https://github.com/aimalrx200/fullstack-nexus",
    isLive: true,
  },
  {
    id: "chronos-reconciler",
    title: "Chronos Reconciler",
    description:
      "Distributed workflow worker reconciling payment timeouts and releasing abandoned inventory reservation holds.",
    liveUrl: "https://nexus-commerce.vercel.app",
    codeUrl: "https://github.com/aimalrx200/fullstack-nexus",
    isLive: true,
  },
];

function LiveScreenshot({ url, title }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const screenshotSrc = url
    ? `https://api.microlink.io/?url=${encodeURIComponent(
        url,
      )}&screenshot=true&meta=false&embed=screenshot.url`
    : null;

  if (hasError || !screenshotSrc) {
    return (
      <div className="w-full h-full bg-surface-app flex flex-col items-center justify-center p-3 text-center border-b border-surface-border/60">
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 stroke-current fill-none stroke-[1.5] text-text-subtle/50 mb-1"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="m3 9 18 0M9 21V9" />
        </svg>
        <span className="text-[11px] text-text-subtle/70 truncate max-w-45">
          {title}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-surface-app border-b border-surface-border/60">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-app animate-pulse">
          <span className="text-[9px] uppercase tracking-wider text-text-subtle">
            Fetching snapshot...
          </span>
        </div>
      )}
      <img
        src={screenshotSrc}
        alt={`${title} live snapshot`}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover object-top transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}

// Reusable Solid Black Card Face with uniform rounded corners
function CardFace({ project, isActive, thumbnailHeight }) {
  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-surface-card rounded-2xl select-none">
      {/* Top: Screenshot Area */}
      <div
        className="w-full shrink-0 overflow-hidden"
        style={{ height: `${thumbnailHeight}px` }}
      >
        <LiveScreenshot url={project.liveUrl} title={project.title} />
      </div>

      {/* Middle: Title & Description */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-center min-h-0 bg-surface-card">
        {project.isLive && (
          <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5 shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[9px] sm:text-[10px] font-medium tracking-wider text-emerald-400">
              LIVE
            </span>
          </div>
        )}

        <h3 className="text-xs sm:text-base font-semibold tracking-tight text-text-main truncate">
          {project.title}
        </h3>

        <p className="text-[11px] sm:text-xs text-text-subtle leading-relaxed mt-1 line-clamp-2 sm:line-clamp-3">
          {project.description}
        </p>
      </div>

      {/* Bottom: Action Links */}
      <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 border-t border-surface-border/60 shrink-0 flex items-center justify-between text-[10px] sm:text-xs bg-surface-card font-mono">
        {isActive ? (
          <>
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-text-main hover:text-emerald-400 font-medium transition-colors underline underline-offset-4"
            >
              Live Demo ↗
            </a>
            <a
              href={project.codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-text-subtle hover:text-text-main transition-colors flex items-center gap-1"
            >
              <GithubIcon className="w-3 h-3 opacity-80" />
              Code ↗
            </a>
          </>
        ) : (
          <span className="text-text-subtle/70 text-[9px] sm:text-[10px] flex items-center justify-end w-full">
            <span>Click to focus ↗</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function PerspectiveCarousel() {
  const [stepCount, setStepCount] = useState(0);
  const totalCards = REEL_PROJECTS.length;
  const angleStep = 360 / Math.max(totalCards, 1);
  const touchStartX = useRef(null);

  const activeIndex = ((stepCount % totalCards) + totalCards) % totalCards;

  const [dimensions, setDimensions] = useState({
    cardWidth: 260,
    cardHeight: 350,
    thumbnailHeight: 155,
    radius: 390,
    perspective: 1300,
    isShortScreen: false,
  });

  useEffect(() => {
    const calculateGeometry = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const isShort = vh < 650;
      const reservedVertical = isShort ? 130 : 170;
      const availableHeight = Math.max(vh - reservedVertical, 220);

      const targetCardHeight = availableHeight * (isShort ? 0.68 : 0.56);
      const cardHeight = Math.min(Math.max(targetCardHeight, 210), 520);

      const maxAllowedWidth = vw < 640 ? vw * 0.76 : 380;
      const cardWidth = Math.min(
        Math.max(cardHeight * 0.72, 160),
        maxAllowedWidth,
      );

      const thumbnailHeight = Math.round(cardHeight * 0.44);

      const countFactor = Math.max(totalCards, 4);
      const dynamicRadius =
        vw < 640
          ? Math.min(cardWidth * 1.25, 250)
          : Math.max(
              cardWidth * 1.4,
              ((countFactor * cardWidth) / (2 * Math.PI)) * 1.15,
            );

      const radius = Math.min(Math.max(dynamicRadius, 190), 640);
      const perspective = Math.max(radius * 2.6, 950);

      setDimensions({
        cardWidth: Math.round(cardWidth),
        cardHeight: Math.round(cardHeight),
        thumbnailHeight,
        radius: Math.round(radius),
        perspective: Math.round(perspective),
        isShortScreen: isShort,
      });
    };

    calculateGeometry();
    window.addEventListener("resize", calculateGeometry);
    return () => window.removeEventListener("resize", calculateGeometry);
  }, [totalCards]);

  const handlePrev = () => {
    setStepCount((prev) => prev - 1);
  };

  const handleNext = () => {
    setStepCount((prev) => prev + 1);
  };

  const rotateTo = (targetIdx) => {
    let diff = (targetIdx - activeIndex) % totalCards;
    if (diff > totalCards / 2) diff -= totalCards;
    if (diff < -totalCards / 2) diff += totalCards;
    setStepCount((prev) => prev + diff);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) handlePrev();
      else handleNext();
    }
    touchStartX.current = null;
  };

  return (
    <section className="relative w-full max-w-full flex-1 flex flex-col items-center justify-center select-none overflow-x-clip my-auto py-2 sm:py-4">
      {/* 3D Ring Viewport */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{
          height: `${Math.round(dimensions.cardHeight * 1.1 + 24)}px`,
          perspective: `${dimensions.perspective}px`,
          touchAction: "pan-y",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Revolving Cylinder Ring */}
        <div
          className="relative transition-transform duration-420 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: `${dimensions.cardWidth}px`,
            height: `${dimensions.cardHeight}px`,
            transformStyle: "preserve-3d",
            transform: `translateZ(-${dimensions.radius}px) rotateY(${-stepCount * angleStep}deg)`,
          }}
        >
          {REEL_PROJECTS.map((project, idx) => {
            const cardSpokeAngle = idx * angleStep;

            const norm =
              ((((cardSpokeAngle - stepCount * angleStep) % 360) + 540) % 360) -
              180;
            const absAngle = Math.abs(norm);

            const isActive = absAngle < 35;
            const depthFactor = (Math.cos((norm * Math.PI) / 180) + 1) / 2;

            const opacity = isActive ? 1 : 0.85 + depthFactor * 0.15;
            const scale = isActive ? 1.05 : 0.88 + depthFactor * 0.1;
            const zIndex = isActive ? 50 : Math.round(depthFactor * 30) + 1;

            return (
              <div
                key={project.id}
                onClick={() => rotateTo(idx)}
                className="absolute inset-0 cursor-pointer transition-all duration-420 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-2xl"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${cardSpokeAngle}deg) translateZ(${dimensions.radius}px) scale(${scale})`,
                  opacity: opacity,
                  zIndex: zIndex,
                }}
              >
                {/* 3D Physical Extruded Core Slab (Black) */}
                <div
                  className="absolute inset-0 rounded-2xl bg-[#060608] border border-surface-border/80 pointer-events-none"
                  style={{ transform: "translateZ(0px)" }}
                  aria-hidden="true"
                />

                {/* FRONT FACE (Solid Black Card) */}
                <div
                  className={`absolute inset-0 rounded-2xl border transition-all duration-420 bg-surface-card ${
                    isActive
                      ? "border-surface-border shadow-[0_20px_50px_rgba(0,0,0,0.85),-6px_0_12px_rgba(0,0,0,0.6)]"
                      : "border-surface-border/60 hover:border-surface-border shadow-[-4px_0_12px_rgba(0,0,0,0.7)]"
                  }`}
                  style={{
                    transform: "translateZ(3px)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <CardFace
                    project={project}
                    isActive={isActive}
                    thumbnailHeight={dimensions.thumbnailHeight}
                  />
                </div>

                {/* BACK FACE (Solid Black Card Facing Inward) */}
                <div
                  className="absolute inset-0 rounded-2xl border border-surface-border/60 hover:border-surface-border bg-surface-card shadow-[-4px_0_12px_rgba(0,0,0,0.7)] transition-all duration-420"
                  style={{
                    transform: "rotateY(180deg) translateZ(3px)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <CardFace
                    project={project}
                    isActive={false}
                    thumbnailHeight={dimensions.thumbnailHeight}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-4 mt-3 sm:mt-5 z-10 shrink-0">
        <button
          type="button"
          onClick={handlePrev}
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-surface-border bg-surface-card hover:bg-surface-hover flex items-center justify-center text-text-main transition-all text-xs sm:text-sm cursor-pointer active:scale-95 shadow-sm"
          aria-label="Previous project"
        >
          ←
        </button>

        <div className="flex gap-1.5">
          {REEL_PROJECTS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => rotateTo(i)}
              className={`h-1.5 rounded-full transition-all duration-420 cursor-pointer ${
                i === activeIndex
                  ? "w-5 sm:w-6 bg-text-main"
                  : "w-1.5 bg-surface-border hover:bg-text-subtle"
              }`}
              aria-label={`Jump to project ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-surface-border bg-surface-card hover:bg-surface-hover flex items-center justify-center text-text-main transition-all text-xs sm:text-sm cursor-pointer active:scale-95 shadow-sm"
          aria-label="Next project"
        >
          →
        </button>
      </div>
    </section>
  );
}
