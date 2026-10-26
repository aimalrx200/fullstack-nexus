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
        <PerspectiveCarousel />
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}
