import React, { useState } from "react";
import {
  Truck,
  MapPin,
  CheckCircle2,
  Navigation,
  Play,
  Loader2,
} from "lucide-react";
import { useOrderTrackingStream } from "../../../hooks/useRealTimeSubsystems";
import { orderApi } from "../../../lib/api/orderApi";
import { toast } from "sonner";

export function LiveDeliveryMap({ order }) {
  const [currentCoord, setCurrentCoord] = useState(
    order?.courier?.currentLocation ||
      order?.shippingAddress?.coordinates || { lat: 31.5204, lng: 74.3587 },
  );
  const [statusMessage, setStatusMessage] = useState(
    order?.courier?.currentLocation?.label ||
      `Dispatched with ${order?.courier?.carrier || "TCS Express"}`,
  );
  const [isSimulating, setIsSimulating] = useState(false);

  // Bind real-time tracking stream (SSE in Prod / Socket.io in Dev)
  const { isConnected } = useOrderTrackingStream(order?._id, {
    onLocationUpdate: (telemetry) => {
      if (telemetry.coordinates) {
        setCurrentCoord(telemetry.coordinates);
      }
      if (telemetry.statusLabel) {
        setStatusMessage(telemetry.statusLabel);
      }
    },
    onStatusUpdate: (statusData) => {
      if (statusData.status) {
        setStatusMessage(`Status: ${statusData.status.toUpperCase()}`);
      }
    },
  });

  const handleStartSimulation = async () => {
    if (!order?._id) return;
    setIsSimulating(true);
    try {
      await orderApi.simulateDelivery(order._id);
      toast.success("Live courier telemetry simulation started!");
    } catch {
      toast.info("GPS radar telemetry simulation active.");
    } finally {
      setTimeout(() => setIsSimulating(false), 20000);
    }
  };

  return (
    <div className="w-full bg-surface-card border border-border-main rounded-2xl overflow-hidden shadow-xl p-5 sm:p-6 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Truck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-text-main font-bold text-sm sm:text-base">
              Live Courier Radar & GPS Tracker
            </h3>
            <p className="text-text-muted text-xs font-mono">
              Tracking #{order?.courier?.trackingNumber || "NEX-TRACK-786"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Stream Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated border border-border-main text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-400 animate-ping" : "bg-amber-400"
              }`}
            />
            <span className="text-text-muted">
              {isConnected ? "LIVE RADAR" : "CONNECTING..."}
            </span>
          </div>

          {/* Simulate Courier Delivery Button */}
          <button
            type="button"
            onClick={handleStartSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold shadow-md shadow-brand-primary/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSimulating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>
              {isSimulating ? "Simulating GPS..." : "Simulate Delivery"}
            </span>
          </button>
        </div>
      </div>

      {/* Visual Radar Vector Grid */}
      <div className="relative w-full h-60 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
        {/* Radar Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-30" />

        {/* Origin Fulfillment Center */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-slate-300">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="text-[9px] text-slate-400 font-mono mt-1">
            Fulfillment Hub
          </span>
        </div>

        {/* Animated Vector Route Polyline */}
        <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800">
          <div className="h-full bg-linear-to-r from-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-all duration-1000" />
        </div>

        {/* Courier Marker */}
        <div className="relative z-10 flex flex-col items-center transition-all duration-1000">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 border-2 border-white/20 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 animate-bounce">
            <Truck className="w-5 h-5" />
          </div>
          <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-blue-500/30 text-[10px] font-mono text-blue-300 flex items-center gap-1 shadow-md">
            <Navigation className="w-3 h-3 text-blue-400" />
            Lat: {currentCoord.lat}, Lng: {currentCoord.lng}
          </div>
        </div>

        {/* Destination Customer House Marker */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-[9px] text-emerald-400 font-mono mt-1">
            Destination
          </span>
        </div>
      </div>

      {/* Live Status Bar */}
      <div className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-between text-xs">
        <div>
          <span className="text-text-muted font-mono block text-[10px] uppercase">
            Current Status
          </span>
          <span className="font-semibold text-text-main mt-0.5 block">
            {statusMessage}
          </span>
        </div>
        <div className="text-right">
          <span className="text-text-muted font-mono block text-[10px] uppercase">
            Carrier
          </span>
          <span className="font-medium text-text-main mt-0.5 block">
            {order?.courier?.carrier || "TCS Express Delivery"}
          </span>
        </div>
      </div>
    </div>
  );
}
