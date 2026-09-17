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
        className="overflow-hidden rounded-3xl bg-surface-elevated border border-border-main shadow-lg aspect-square"
      >
        <div className="flex h-full">
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              className="min-w-full flex-[0_0_100%] relative h-full"
            >
              <img
                src={img.url}
                alt={`Product image ${idx + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnail Bar */}
      {displayImages.length > 1 && (
        <div ref={thumbRef} className="overflow-hidden">
          <div className="flex gap-2.5">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onThumbClick(idx)}
                className={`relative min-w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  idx === selectedIndex
                    ? "border-brand-primary scale-105 shadow-md"
                    : "border-border-subtle opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
