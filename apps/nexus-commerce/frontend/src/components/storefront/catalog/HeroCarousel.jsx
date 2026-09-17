import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "../../common/Button";

const HERO_SLIDES = [
  {
    tag: "AUTONOMOUS COMMERCE 2026",
    title: "Next-Gen Titanium Tech & Luxury Essentials",
    description:
      "Explore real-time multi-currency catalog with instant biometric checkout and 10-minute flash-sale stock reservation.",
    cta: "Explore Catalog",
    link: "/catalog",
    badge: "100% SECURE CHECKOUT",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&q=85",
  },
  {
    tag: "INSTANT BIOMETRIC PASSKEYS",
    title: "Passwordless Shopping Powered by WebAuthn",
    description:
      "Sign in with Face ID or Touch ID. Zero passwords, zero phishing, instant order tracking.",
    cta: "Shop Electronics",
    link: "/catalog?category=Electronics",
    badge: "FIDO2 CERTIFIED",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&q=85",
  },
];

export function HeroCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true, duration: 30 }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-border-main bg-surface-card shadow-2xl mb-10">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={idx}
              className="relative min-w-full flex-[0_0_100%] h-95 sm:h-115 overflow-hidden"
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.4] transition-transform duration-1000 scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-surface-app via-surface-app/40 to-transparent" />

              <div className="relative z-10 h-full max-w-4xl mx-auto px-6 sm:px-12 flex flex-col justify-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/20 border border-brand-primary/30 text-brand-primary text-xs font-mono font-bold w-fit shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{slide.tag}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl drop-shadow-md">
                  {slide.title}
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  {slide.description}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a href={slide.link}>
                    <Button variant="luxury" size="lg" icon={ArrowRight}>
                      {slide.cta}
                    </Button>
                  </a>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {slide.badge}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
