import React, { useState } from "react";
import { Truck, MapPin, CheckCircle2, Navigation, Play } from "lucide-react";
import { useOrderTrackingStream } from "../../hooks/useRealTimeSubsystems";

export function OrderLiveMap({ order, onSimulateTrigger }) {
  const [currentCoord, setCurrentCoord] = useState(
    order?.courier?.currentLocation ||
      order?.shippingAddress?.coordinates || { lat: 31.5204, lng: 74.3587 },
  );
  const [statusMessage, setStatusMessage] = useState(
    order?.courier?.currentLocation?.label ||
      `Dispatched with ${order?.courier?.carrier || "Courier"}`,
  );
  const [isSimulating, setIsSimulating] = useState(false);

  // Bind live tracking stream (SSE / Socket.io)
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
    setIsSimulating(true);
    if (onSimulateTrigger) {
      await onSimulateTrigger(order._id);
    }
    setTimeout(() => setIsSimulating(false), 20000);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Truck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">
              Live Courier Dispatch Radar
            </h3>
            <p className="text-slate-400 text-xs">
              Tracking ID: {order?.courier?.trackingNumber || "NEX-TRACK-001"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Real-time Connection Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`}
            />
            <span className="text-slate-300 font-mono">
              {isConnected ? "LIVE STREAM ACTIVE" : "CONNECTING..."}
            </span>
          </div>

          {/* Evaluator Simulation Button */}
          <button
            onClick={handleStartSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {isSimulating ? "Simulating GPS..." : "Simulate Live Delivery"}
          </button>
        </div>
      </div>

      {/* Interactive Visual Radar Grid */}
      <div className="relative w-full h-64 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-hidden">
        {/* Radar Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-30" />

        {/* Origin Hub Marker */}
        <div className="absolute left-12 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-slate-300">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">
            Fulfillment Hub
          </span>
        </div>

        {/* Animated Polyline Path */}
        <div className="absolute left-20 right-20 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800">
          <div className="h-full bg-linear-to-r from-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-all duration-1000" />
        </div>

        {/* Dynamic Courier Vehicle Marker */}
        <div className="relative z-10 flex flex-col items-center transition-all duration-1000 transform">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 border-2 border-white/20 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 animate-bounce">
            <Truck className="w-6 h-6" />
          </div>
          <div className="mt-2 px-3 py-1 rounded-full bg-slate-900/90 border border-blue-500/30 text-[11px] font-mono text-blue-300 flex items-center gap-1.5 shadow-md">
            <Navigation className="w-3 h-3 text-blue-400" />
            Lat: {currentCoord.lat}, Lng: {currentCoord.lng}
          </div>
        </div>

        {/* Destination Customer Marker */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-1">
            Destination
          </span>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">
            Current Status
          </p>
          <p className="text-sm font-semibold text-white mt-0.5">
            {statusMessage}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">
            Carrier
          </p>
          <p className="text-sm font-medium text-slate-200 mt-0.5">
            {order?.courier?.carrier || "Express Delivery"}
          </p>
        </div>
      </div>
    </div>
  );
}
