import React, { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";

export function ProductGalleryCarousel({ images = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mainRef, emblaMain] = useEmblaCarousel({ loop: false });
  const [thumbRef, emblaThumb] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index) => {
      if (!emblaMain || !emblaThumb) return;
      emblaMain.scrollTo(index);
    },
    [emblaMain, emblaThumb],
  );

  const onSelect = useCallback(() => {
    if (!emblaMain || !emblaThumb) return;
    setSelectedIndex(emblaMain.selectedScrollSnap());
    emblaThumb.scrollTo(emblaMain.selectedScrollSnap());
  }, [emblaMain, emblaThumb]);

  useEffect(() => {
    if (!emblaMain) return;
    emblaMain.on("select", onSelect);
    emblaMain.on("reInit", onSelect);
  }, [emblaMain, onSelect]);

  const displayImages =
    images.length > 0
      ? images
      : [
          {
            url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
          },
        ];

  return (
    <div className="space-y-3">
      {/* Main Viewport */}
      <div
        ref={mainRef}
        className="overflow-hidden rounded-3xl bg-surface-elevated/40 border border-border-main shadow-lg aspect-square relative flex items-center justify-center p-6"
      >
        {/* Ambient Stage Glow */}
        <div className="absolute inset-0 bg-radial from-brand-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />

        <div className="flex h-full w-full">
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              className="min-w-full flex-[0_0_100%] relative h-full flex items-center justify-center"
            >
              <img
                src={img.url}
                alt={`Product image ${idx + 1}`}
                className="w-full h-full object-contain object-center drop-shadow-xl select-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnail Bar */}
      {displayImages.length > 1 && (
        <div ref={thumbRef} className="overflow-hidden pt-1">
          <div className="flex gap-2.5">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onThumbClick(idx)}
                className={`relative min-w-16 h-16 rounded-xl overflow-hidden border-2 bg-surface-elevated/50 p-1 flex items-center justify-center transition-all cursor-pointer ${
                  idx === selectedIndex
                    ? "border-brand-primary scale-105 shadow-md"
                    : "border-border-subtle opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
