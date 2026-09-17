import React, { useCallback } from "react";
import { useJsApiLoader, GoogleMap, MarkerF } from "@react-google-maps/api";
import { MapPin, Crosshair } from "lucide-react";

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem",
};

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#0b0f19" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#07090e" }] },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#1e293b" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0f172a" }],
    },
  ],
};

export function DeliveryPinMap({
  coordinates = { lat: 31.5204, lng: 74.3587 },
  onPinChange,
  city = "Lahore",
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded } = useJsApiLoader({
    id: "nexus-google-map-script",
    googleMapsApiKey: apiKey,
  });

  const handleMarkerDragEnd = useCallback(
    (e) => {
      if (e?.latLng && onPinChange) {
        onPinChange({
          lat: Number(e.latLng.lat().toFixed(4)),
          lng: Number(e.latLng.lng().toFixed(4)),
        });
      }
    },
    [onPinChange],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-text-main flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-primary" />
          <span>Interactive Pinpoint Delivery Drop</span>
        </label>
        <span className="text-[10px] font-mono text-text-muted">
          Lat: {coordinates.lat.toFixed(4)}, Lng: {coordinates.lng.toFixed(4)}
        </span>
      </div>

      <div className="relative w-full h-52 rounded-2xl bg-slate-950 border border-border-main overflow-hidden shadow-inner">
        {/* Real Google Maps Render if Key is Configured */}
        {apiKey && isLoaded ? (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={coordinates}
            zoom={14}
            options={MAP_OPTIONS}
          >
            <MarkerF
              position={coordinates}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
              animation={window.google?.maps?.Animation?.DROP}
            />
          </GoogleMap>
        ) : (
          /* High-Tech Telemetry Radar Fallback */
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[1.5rem_1.5rem] opacity-40" />
            <div className="relative z-10 flex flex-col items-center select-none animate-bounce">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary border-2 border-white/20 flex items-center justify-center text-white shadow-xl shadow-brand-primary/40">
                <Crosshair className="w-5 h-5" />
              </div>
              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-surface-card/90 border border-border-main text-[10px] font-mono text-text-main font-semibold shadow-md">
                {city || "Fulfillment Target"}
              </div>
            </div>
            <div className="absolute w-28 h-28 rounded-full border border-brand-primary/30 animate-ping opacity-25" />
          </div>
        )}

        {/* Coordinate Adjuster Pill */}
        <div className="absolute bottom-2 left-3 right-3 px-3 py-1.5 rounded-xl bg-surface-card/85 backdrop-blur-md border border-border-subtle flex items-center justify-between text-[11px] text-text-muted z-10">
          <span>
            {apiKey && isLoaded ? "Drag pin to refine" : "Live GPS Radar"}
          </span>
          <button
            type="button"
            onClick={() =>
              onPinChange?.({
                lat: Number(
                  (coordinates.lat + (Math.random() - 0.5) * 0.005).toFixed(4),
                ),
                lng: Number(
                  (coordinates.lng + (Math.random() - 0.5) * 0.005).toFixed(4),
                ),
              })
            }
            className="text-brand-primary font-semibold hover:underline cursor-pointer"
          >
            Refine Coordinates
          </button>
        </div>
      </div>
    </div>
  );
}
