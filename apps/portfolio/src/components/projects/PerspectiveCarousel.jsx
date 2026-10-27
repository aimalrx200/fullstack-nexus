// apps/portfolio/src/components/projects/PerspectiveCarousel.jsx

import { useState, useEffect, useRef } from "react";
import { GithubIcon } from "../common/Icons";

const REEL_PROJECTS = [
  {
    id: "nexus-commerce",
    title: "Nexus Commerce",
    description:
      "Distributed e-commerce engine engineered for high-concurrency flash sales with Redis inventory locking, order FSM, and WebAuthn passkeys.",
    liveUrl: "https://nexus-commerce-frontend.vercel.app",
    codeUrl:
      "https://github.com/aimalrx200/fullstack-nexus/tree/main/apps/nexus-commerce",
    isLive: true,
  },
  {
    id: "key-vault-manager",
    title: "Key Vault Manager",
    description:
      "Zero-trust cryptographic secrets platform featuring envelope encryption, machine identity tokens, and tamper-evident audit logs.",
    liveUrl: "https://fullstack-nexus-frontend.vercel.app",
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
      <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col justify-center min-h-0 bg-surface-card">
        {project.isLive && (
          <div className="flex items-center gap-1.5 mb-1.5 shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] sm:text-xs font-medium tracking-wider text-emerald-400 font-mono">
              LIVE SYSTEM
            </span>
          </div>
        )}

        <h3 className="text-sm sm:text-base lg:text-lg font-semibold tracking-tight text-text-main truncate">
          {project.title}
        </h3>

        <p className="text-xs sm:text-xs lg:text-sm text-text-subtle leading-relaxed mt-1.5 line-clamp-2 sm:line-clamp-3">
          {project.description}
        </p>
      </div>

      {/* Bottom: Action Links */}
      <div className="px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 border-t border-surface-border/60 shrink-0 flex items-center justify-between text-xs sm:text-xs lg:text-sm bg-surface-card font-mono">
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
              className="text-text-subtle hover:text-text-main transition-colors flex items-center gap-1.5"
            >
              <GithubIcon className="w-3.5 h-3.5 opacity-80" />
              Code ↗
            </a>
          </>
        ) : (
          <span className="text-text-subtle/70 text-[10px] sm:text-xs flex items-center justify-end w-full">
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
    cardWidth: 320,
    cardHeight: 420,
    thumbnailHeight: 180,
    radius: 650,
    perspective: 1400,
    isShortScreen: false,
  });

  useEffect(() => {
    const calculateGeometry = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const isShort = vh < 650;
      const reservedVertical = isShort ? 120 : 160;
      const availableHeight = Math.max(vh - reservedVertical, 220);

      // 1. Card Height: Takes up 60-68% of available vertical height (scales up to 580px on large displays)
      const targetCardHeight = availableHeight * (isShort ? 0.7 : 0.64);
      const cardHeight = Math.round(
        Math.min(Math.max(targetCardHeight, 230), 580),
      );

      // 2. Card Width: Scales with BOTH height and viewport width (allows up to 450px on widescreen)
      const targetWidthFromVw = vw < 640 ? vw * 0.78 : Math.min(vw * 0.22, 450);
      const cardWidth = Math.round(
        vw < 640
          ? Math.min(vw * 0.78, 290)
          : Math.min(Math.max(cardHeight * 0.72, targetWidthFromVw), 450),
      );

      const thumbnailHeight = Math.round(cardHeight * 0.44);

      // 3. Perspective & Orbit Radius:
      // With perspective D ≈ 2.1 * R, the foreshortened horizontal span of 5 cards (72° spokes) is:
      // Span ≈ 1.414 * R + 0.74 * cardWidth
      // We target the outer edges of the side cards to span ~88% of the viewport width.
      let dynamicRadius;
      if (vw < 640) {
        dynamicRadius = Math.min(cardWidth * 1.2, vw * 0.44);
      } else {
        const targetSpan = vw * 0.88; // Span 88% of full screen width
        const computedRadius = (targetSpan - 0.74 * cardWidth) / 1.414;
        dynamicRadius = Math.max(computedRadius, cardWidth * 1.4);
      }

      const radius = Math.round(Math.max(dynamicRadius, 210));
      const perspective = Math.round(Math.max(radius * 2.1, 1100));

      setDimensions({
        cardWidth,
        cardHeight,
        thumbnailHeight,
        radius,
        perspective,
        isShortScreen: isShort,
      });
    };

    calculateGeometry();
    window.addEventListener("resize", calculateGeometry);
    return () => window.removeEventListener("resize", calculateGeometry);
  }, [totalCards, angleStep]);

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
          height: `${Math.round(dimensions.cardHeight * 1.08 + 20)}px`,
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

            const opacity = isActive ? 1 : 0.82 + depthFactor * 0.18;
            const scale = isActive ? 1.04 : 0.88 + depthFactor * 0.1;
            const zIndex = isActive ? 50 : Math.round(depthFactor * 30) + 1;

            return (
              <div
                key={project.id}
                onClick={() => rotateTo(idx)}
                className="absolute inset-0 cursor-pointer transition-all duration-420 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-2xl"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${cardSpokeAngle}deg) translateZ(${dimensions.radius}px) scale(${scale})`,
                  opacity,
                  zIndex,
                }}
              >
                {/* 3D Core Slab */}
                <div
                  className="absolute inset-0 rounded-2xl bg-[#060608] border border-surface-border/80 pointer-events-none"
                  style={{ transform: "translateZ(0px)" }}
                  aria-hidden="true"
                />

                {/* FRONT FACE */}
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

                {/* BACK FACE */}
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
