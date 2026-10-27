// apps/portfolio/src/components/projects/PerspectiveCarousel.jsx

import { useState, useEffect, useRef, memo, useCallback } from "react";
import { GithubIcon } from "../common/Icons";
import { ProjectVisual } from "./ProjectVisual";

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

const HALF_THICKNESS = 10; // 20px total slab thickness

// 1. Memoized 3D Lateral Walls (Never re-renders during rotations)
const CardChassis = memo(function CardChassis() {
  return (
    <>
      {/* LEFT WALL */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `-${HALF_THICKNESS}px`,
          width: `${HALF_THICKNESS * 2}px`,
          top: "16px",
          bottom: "16px",
          transform: "rotateY(-90deg)",
          background:
            "linear-gradient(180deg, #32323e 0%, #1e1e26 40%, #101016 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.22)",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "inset 0 0 6px rgba(0,0,0,0.6)",
        }}
        aria-hidden="true"
      />

      {/* RIGHT WALL */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: `-${HALF_THICKNESS}px`,
          width: `${HALF_THICKNESS * 2}px`,
          top: "16px",
          bottom: "16px",
          transform: "rotateY(90deg)",
          background:
            "linear-gradient(180deg, #32323e 0%, #1e1e26 40%, #101016 100%)",
          borderRight: "1px solid rgba(255,255,255,0.22)",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "inset 0 0 6px rgba(0,0,0,0.6)",
        }}
        aria-hidden="true"
      />

      {/* TOP WALL */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: `-${HALF_THICKNESS}px`,
          height: `${HALF_THICKNESS * 2}px`,
          left: "16px",
          right: "16px",
          transform: "rotateX(90deg)",
          background:
            "linear-gradient(90deg, #252530 0%, #383846 50%, #252530 100%)",
          borderTop: "1px solid rgba(255,255,255,0.35)",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 0 12px rgba(255,255,255,0.06)",
        }}
        aria-hidden="true"
      />

      {/* BOTTOM WALL */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: `-${HALF_THICKNESS}px`,
          height: `${HALF_THICKNESS * 2}px`,
          left: "16px",
          right: "16px",
          transform: "rotateX(-90deg)",
          background: "#08080c",
          borderBottom: "1px solid rgba(0,0,0,0.8)",
        }}
        aria-hidden="true"
      />

      {/* SOLID INTERNAL MASS */}
      <div
        className="absolute inset-0 rounded-2xl bg-[#0e0e13] border border-white/8 pointer-events-none"
        style={{ transform: "translateZ(0px)" }}
        aria-hidden="true"
      />
    </>
  );
});

// 2. Memoized Front Face Content
const CardFace = memo(function CardFace({
  project,
  isActive,
  thumbnailHeight,
}) {
  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-[#121216] rounded-2xl select-none">
      {/* Top: Media Area */}
      <div
        className="w-full shrink-0 overflow-hidden border-b border-white/8"
        style={{ height: `${thumbnailHeight}px` }}
      >
        <ProjectVisual projectId={project.id} />
      </div>

      {/* Middle: Content */}
      <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col justify-center min-h-0 bg-[#121216]">
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
      <div className="px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 border-t border-white/8 shrink-0 flex items-center justify-between text-xs sm:text-xs lg:text-sm bg-[#121216] font-mono">
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
});

// 3. Lightweight Inward-Facing Backplate (Saves 50% DOM & image memory)
const CardBackFace = memo(function CardBackFace({ title }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#0c0c10] rounded-2xl select-none border border-white/6 text-center">
      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-text-subtle/40 mb-2 font-mono text-xs">
        ✦
      </div>
      <span className="font-mono text-xs tracking-wider uppercase text-text-subtle/50 truncate max-w-50">
        {title}
      </span>
      <span className="text-[10px] font-mono text-text-subtle/30 mt-1">
        SYSTEM CORE
      </span>
    </div>
  );
});

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

  // Throttled Resize with requestAnimationFrame
  useEffect(() => {
    let rAFId = null;

    const calculateGeometry = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const isShort = vh < 650;
      const reservedVertical = isShort ? 120 : 160;
      const availableHeight = Math.max(vh - reservedVertical, 220);

      const targetCardHeight = availableHeight * (isShort ? 0.7 : 0.64);
      const cardHeight = Math.round(
        Math.min(Math.max(targetCardHeight, 230), 580),
      );

      const targetWidthFromVw = vw < 640 ? vw * 0.78 : Math.min(vw * 0.22, 450);
      const cardWidth = Math.round(
        vw < 640
          ? Math.min(vw * 0.78, 290)
          : Math.min(Math.max(cardHeight * 0.72, targetWidthFromVw), 450),
      );

      const thumbnailHeight = Math.round(cardHeight * 0.44);

      let dynamicRadius;
      if (vw < 640) {
        dynamicRadius = Math.min(cardWidth * 1.2, vw * 0.44);
      } else {
        const targetSpan = vw * 0.88;
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

    const handleResize = () => {
      if (rAFId) cancelAnimationFrame(rAFId);
      rAFId = requestAnimationFrame(calculateGeometry);
    };

    calculateGeometry();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rAFId) cancelAnimationFrame(rAFId);
    };
  }, [totalCards, angleStep]);

  const handlePrev = useCallback(() => setStepCount((prev) => prev - 1), []);
  const handleNext = useCallback(() => setStepCount((prev) => prev + 1), []);

  const rotateTo = useCallback(
    (targetIdx) => {
      let diff = (targetIdx - activeIndex) % totalCards;
      if (diff > totalCards / 2) diff -= totalCards;
      if (diff < -totalCards / 2) diff += totalCards;
      setStepCount((prev) => prev + diff);
    },
    [activeIndex, totalCards],
  );

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
          perspectiveOrigin: "50% 38%",
          touchAction: "pan-y",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Revolving Cylinder Ring with GPU Compositor Acceleration */}
        <div
          className="relative ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: `${dimensions.cardWidth}px`,
            height: `${dimensions.cardHeight}px`,
            transformStyle: "preserve-3d",
            transform: `translateZ(-${dimensions.radius}px) rotateY(${-stepCount * angleStep}deg)`,
            transition: "transform 420ms cubic-bezier(0.16,1,0.3,1)",
            willChange: "transform",
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
                className="absolute inset-0 cursor-pointer rounded-2xl"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${cardSpokeAngle}deg) translateZ(${dimensions.radius}px) scale(${scale})`,
                  opacity,
                  zIndex,
                  transition:
                    "transform 420ms cubic-bezier(0.16,1,0.3,1), opacity 420ms ease",
                  willChange: "transform, opacity",
                }}
              >
                {/* 1. Memoized 3D Lateral Walls (Solid 20px Box) */}
                <CardChassis />

                {/* 2. FRONT FACE */}
                <div
                  className={`absolute inset-0 rounded-2xl border bg-[#121216] ${
                    isActive
                      ? "border-white/20 shadow-[0_28px_70px_rgba(0,0,0,0.95),0_0_30px_rgba(16,185,129,0.08),inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                      : "border-white/8 hover:border-white/15 shadow-[-8px_0_20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                  }`}
                  style={{
                    transform: `translateZ(${HALF_THICKNESS}px)`,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transition:
                      "border-color 300ms ease, box-shadow 300ms ease",
                  }}
                >
                  <CardFace
                    project={project}
                    isActive={isActive}
                    thumbnailHeight={dimensions.thumbnailHeight}
                  />
                </div>

                {/* 3. LIGHTWEIGHT BACK FACE (Inward facing plate) */}
                <div
                  className="absolute inset-0 rounded-2xl bg-[#0c0c10] shadow-[-8px_0_20px_rgba(0,0,0,0.8)]"
                  style={{
                    transform: `rotateY(180deg) translateZ(${HALF_THICKNESS}px)`,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <CardBackFace title={project.title} />
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
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-surface-border bg-surface-card hover:bg-surface-hover flex items-center justify-center text-text-main transition-colors text-xs sm:text-sm cursor-pointer active:scale-95 shadow-sm"
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
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
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
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-surface-border bg-surface-card hover:bg-surface-hover flex items-center justify-center text-text-main transition-colors text-xs sm:text-sm cursor-pointer active:scale-95 shadow-sm"
          aria-label="Next project"
        >
          →
        </button>
      </div>
    </section>
  );
}
