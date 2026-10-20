// apps/nexus-commerce/frontend/src/components/storefront/catalog/HeroCarousel.jsx

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Tag,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "../../common/Button";
import { useCurrency } from "../../../hooks/useCurrency";

const DEFAULT_HERO_SLIDES = [
  {
    id: "default-1",
    tag: "FEATURED DEAL",
    title: "Premium Sound & Noise-Cancelling Headphones",
    description:
      "Immerse yourself in high-fidelity audio with ultra-comfortable ear cushions and up to 40 hours of battery life.",
    cta: "Shop Now",
    link: "/catalog",
    badge: "Free Delivery Included",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=85",
    videoUrl: null,
    priceUSD: 149,
    pricePKR: 41720,
  },
  {
    id: "default-2",
    tag: "NEW ARRIVAL",
    title: "Smart Accessories for Everyday Life",
    description:
      "Upgrade your daily routine with precision-engineered smart wearables and modern workspace essentials.",
    cta: "Explore Electronics",
    link: "/catalog?category=Electronics",
    badge: "Official Brand Warranty",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=85",
    videoUrl: null,
    priceUSD: 89,
    pricePKR: 24920,
  },
];

export function HeroCarousel({ products = [] }) {
  const { formatPrice } = useCurrency();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeVideoSlideId, setActiveVideoSlideId] = useState(null);

  const slides =
    products.length > 0
      ? products.map((product) => ({
          id: product._id,
          tag: product.category
            ? `${product.category.toUpperCase()}`
            : "FEATURED",
          title: product.title,
          description: product.description,
          cta: "Shop Now",
          link: `/product/${product.slug || product._id}`,
          badge: "In Stock & Ready to Ship",
          priceUSD: product.basePriceUSD,
          pricePKR: product.basePricePKR,
          image:
            product.images?.[0]?.url ||
            product.video?.thumbnailUrl ||
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=85",
          videoUrl: product.video?.url || null,
          videoPoster:
            product.video?.thumbnailUrl || product.images?.[0]?.url || null,
        }))
      : DEFAULT_HERO_SLIDES;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: slides.length > 1, duration: 25 },
    [Autoplay({ delay: 6500, stopOnInteraction: true })],
  );

  const scrollPrev = useCallback(() => {
    setActiveVideoSlideId(null);
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    setActiveVideoSlideId(null);
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index) => {
      setActiveVideoSlideId(null);
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setActiveVideoSlideId(null);
    };

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  const handleStartVideo = (slideId) => {
    setActiveVideoSlideId(slideId);
    if (emblaApi?.plugins()?.autoplay) {
      emblaApi.plugins().autoplay.stop();
    }
  };

  const handleStopVideo = () => {
    setActiveVideoSlideId(null);
    if (emblaApi?.plugins()?.autoplay) {
      emblaApi.plugins().autoplay.play();
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-border-main bg-surface-card shadow-xl mb-10 group">
      {/* 1. Embla Carousel Track */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, idx) => {
            const hasVideo = Boolean(slide.videoUrl);
            const isPlayingThisVideo = activeVideoSlideId === slide.id;

            return (
              <div
                key={slide.id || idx}
                className="relative min-w-full flex-[0_0_100%] min-h-115 lg:min-h-110 flex items-center overflow-hidden p-6 sm:p-10 lg:p-12"
              >
                {/* Ambient glow backdrop */}
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-15 pointer-events-none scale-125"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                <div className="absolute inset-0 bg-radial from-brand-primary/5 via-transparent to-surface-card pointer-events-none" />

                {/* 2. Split Stage Grid */}
                <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Product Info & Actions */}
                  <div className="lg:col-span-7 flex flex-col justify-center space-y-4 text-left order-2 lg:order-1">
                    {/* Tags & Price */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{slide.tag}</span>
                      </div>

                      {slide.priceUSD && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                          <Tag className="w-3.5 h-3.5" />
                          <span>
                            {formatPrice(slide.priceUSD, slide.pricePKR)}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Headline */}
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-text-main tracking-tight leading-tight line-clamp-2">
                      <Link
                        to={slide.link}
                        className="hover:text-brand-primary transition-colors"
                      >
                        {slide.title}
                      </Link>
                    </h1>

                    {/* Description */}
                    <p className="text-sm text-text-muted max-w-lg leading-relaxed line-clamp-2">
                      {slide.description}
                    </p>

                    {/* CTAs and Reassurance Badge */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <Link to={slide.link}>
                        <Button
                          variant="luxury"
                          size="lg"
                          icon={ArrowRight}
                          className="font-bold shadow-md shadow-brand-primary/20"
                        >
                          {slide.cta}
                        </Button>
                      </Link>

                      {hasVideo && !isPlayingThisVideo && (
                        <Button
                          variant="secondary"
                          size="lg"
                          icon={Play}
                          onClick={() => handleStartVideo(slide.id)}
                          className="font-semibold"
                        >
                          Watch Video
                        </Button>
                      )}

                      <span className="text-xs text-text-muted flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{slide.badge}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Clean Visual Showcase */}
                  <div className="lg:col-span-5 flex items-center justify-center order-1 lg:order-2">
                    <div className="relative w-full max-w-sm sm:max-w-md aspect-square rounded-3xl bg-surface-elevated/70 border border-border-main p-6 shadow-xl flex items-center justify-center overflow-hidden group/stage">
                      {isPlayingThisVideo ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-black/95 rounded-2xl overflow-hidden z-20">
                          <video
                            src={slide.videoUrl}
                            autoPlay
                            controls
                            playsInline
                            poster={slide.videoPoster || slide.image}
                            className="w-full h-full max-h-full max-w-full object-contain rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={handleStopVideo}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 hover:bg-rose-500 text-white transition-colors cursor-pointer z-30"
                            title="Close Video"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full max-h-full max-w-full object-contain object-center drop-shadow-xl z-10 select-none group-hover/stage:scale-105 transition-transform duration-500 ease-out"
                          />

                          {hasVideo && (
                            <button
                              type="button"
                              onClick={() => handleStartVideo(slide.id)}
                              className="absolute inset-0 m-auto w-14 h-14 rounded-2xl bg-black/60 hover:bg-brand-primary backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-xl z-20 cursor-pointer group-hover/stage:scale-110"
                              title="Play Video"
                            >
                              <Play className="w-6 h-6 fill-current ml-0.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Slide Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-card/90 backdrop-blur-md border border-border-main text-text-muted hover:text-text-main items-center justify-center shadow-md transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={scrollNext}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-card/90 backdrop-blur-md border border-border-main text-text-muted hover:text-text-main items-center justify-center shadow-md transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* 4. Slide Pagination Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === selectedIndex
                    ? "w-7 bg-brand-primary shadow-xs shadow-brand-primary/50"
                    : "w-2 bg-surface-elevated border border-border-subtle hover:bg-text-muted"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default HeroCarousel;
