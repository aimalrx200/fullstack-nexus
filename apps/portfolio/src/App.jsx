import { useState, useEffect } from "react";
import { Navbar } from "./components/layout/Navbar";
import { HeroSection } from "./components/hero/HeroSection";
import { SystemTopology } from "./components/architecture/SystemTopology";
import { ProjectRegistryGrid } from "./components/projects/ProjectRegistryGrid";
import { VaultDeepDiveModal } from "./components/projects/VaultDeepDiveModal";
import { TechRadar } from "./components/skills/TechRadar";
import { ContactSection } from "./components/contact/ContactSection";
import { Footer } from "./components/layout/Footer";
import { CommandPalette } from "./components/command-palette/CommandPalette";

export function App() {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [selectedDeepDive, setSelectedDeepDive] = useState(null);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenTopology = () => {
    document.getElementById("topology")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#030305] text-[#f0f3ff] flex flex-col font-sans-main">
      <Navbar onOpenPalette={() => setIsPaletteOpen(true)} />

      <main className="flex-1">
        <HeroSection onOpenTopology={handleOpenTopology} />
        <SystemTopology />
        <ProjectRegistryGrid onOpenDeepDive={setSelectedDeepDive} />
        <TechRadar />
        <ContactSection />
      </main>

      <Footer />

      {/* Modals */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />

      <VaultDeepDiveModal
        isOpen={Boolean(selectedDeepDive)}
        onClose={() => setSelectedDeepDive(null)}
        project={selectedDeepDive}
      />
    </div>
  );
}
