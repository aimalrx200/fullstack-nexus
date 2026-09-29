// apps/nexus-commerce/frontend/src/components/storefront/product-detail/ProductGalleryCarousel.jsx

import React, { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Play } from "lucide-react";

export function ProductGalleryCarousel({ images = [], video = null }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [mainRef, emblaMain] = useEmblaCarousel({
    loop: false,
    containScroll: "trimSnaps",
    dragFree: false,
  });

  const [thumbRef, emblaThumb] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  // Assemble Slides: High-res images first, followed by the video slide
  const mediaSlides = [];

  // 1. Photos First
  images.forEach((img) => {
    mediaSlides.push({
      type: "image",
      url: img.url,
      thumbnailUrl: img.url,
    });
  });

  // 2. Video Slide (with thumbnail poster)
  if (video?.url) {
    mediaSlides.push({
      type: "video",
      url: video.url,
      thumbnailUrl: video.thumbnailUrl || images[0]?.url,
    });
  }

  // Fallback placeholder if product has no media
  if (mediaSlides.length === 0) {
    mediaSlides.push({
      type: "image",
      url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    });
  }

  const onThumbClick = useCallback(
    (index) => {
      if (!emblaMain) return;
      emblaMain.scrollTo(index);
    },
    [emblaMain],
  );

  useEffect(() => {
    if (!emblaMain || !emblaThumb) return;

    const onSelect = () => {
      const snapIndex = emblaMain.selectedScrollSnap();
      setSelectedIndex(snapIndex);
      emblaThumb.scrollTo(snapIndex);
    };

    onSelect();
    emblaMain.on("select", onSelect);
    emblaMain.on("reInit", onSelect);

    return () => {
      emblaMain.off("select", onSelect);
      emblaMain.off("reInit", onSelect);
    };
  }, [emblaMain, emblaThumb]);

  return (
    <div className="space-y-3 w-full max-w-full overflow-hidden">
      {/* 1. Main Viewport (Zero overflow leaks or edge bleeding) */}
      <div
        ref={mainRef}
        className="overflow-hidden rounded-3xl bg-surface-elevated/40 border border-border-main shadow-xl aspect-square relative"
      >
        <div className="flex h-full w-full">
          {mediaSlides.map((slide, idx) => (
            <div
              key={idx}
              className="min-w-full flex-[0_0_100%] h-full relative flex items-center justify-center p-3 sm:p-6"
            >
              {slide.type === "video" ? (
                <div className="w-full h-full flex items-center justify-center rounded-2xl overflow-hidden bg-black/95 relative shadow-inner">
                  <video
                    src={slide.url}
                    controls
                    preload="metadata"
                    playsInline
                    poster={slide.thumbnailUrl}
                    className="w-full h-full max-h-full max-w-full object-contain rounded-xl"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <img
                  src={slide.url}
                  alt={`Product slide ${idx + 1}`}
                  className="w-full h-full object-contain object-center drop-shadow-xl select-none"
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Responsive Thumbnail Navigation Bar */}
      {mediaSlides.length > 1 && (
        <div ref={thumbRef} className="overflow-hidden pt-1">
          <div className="flex gap-2.5">
            {mediaSlides.map((slide, idx) => {
              const isActive = idx === selectedIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onThumbClick(idx)}
                  className={`relative min-w-16 h-16 sm:min-w-20 sm:h-20 rounded-2xl overflow-hidden border-2 bg-surface-elevated p-1 flex items-center justify-center transition-all cursor-pointer select-none shrink-0 ${
                    isActive
                      ? "border-brand-primary scale-105 shadow-md shadow-brand-primary/20"
                      : "border-border-subtle opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View media ${idx + 1}`}
                >
                  {slide.type === "video" ? (
                    <div className="relative w-full h-full bg-slate-950 rounded-xl flex items-center justify-center overflow-hidden">
                      {slide.thumbnailUrl && (
                        <img
                          src={slide.thumbnailUrl}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-0.5 text-white">
                        <Play className="w-4 h-4 fill-current text-brand-primary" />
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider">
                          Video
                        </span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={slide.thumbnailUrl || slide.url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductGalleryCarousel;
