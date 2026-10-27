// apps/portfolio/src/App.jsx

import { Navbar } from "./components/layout/Navbar";
import { PerspectiveCarousel } from "./components/projects/PerspectiveCarousel";
import { Footer } from "./components/layout/Footer";

export function App() {
  return (
    <div className="min-h-dvh w-full bg-surface-app text-text-main flex flex-col justify-between font-sans-main overflow-x-hidden selection:bg-neutral-800 selection:text-neutral-100 antialiased">
      {/* 1. Header / Navbar */}
      <Navbar />

      {/* 2. Main Stage: dynamic vertical padding and safe flex centering */}
      <main className="flex-1 w-full flex flex-col items-center justify-center pt-14 sm:pt-16 pb-2 px-2 sm:px-6 min-h-0">
        <div className="text-center shrink-0 pt-6 mb-2 sm:mb-3">
          <p className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-emerald-400/90">
            Production Systems
          </p>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-text-main mt-0.5">
            Featured Engineering
          </h1>
        </div>
        <PerspectiveCarousel />
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}
