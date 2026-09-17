import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";

const CARRIERS = ["TCS", "DHL", "Trax", "Leopards", "FedEx", "Standard"];

export function CourierTrackingModal({
  isOpen,
  onClose,
  order,
  onAssign,
  isLoading,
}) {
  const [carrier, setCarrier] = useState("TCS");

  // Lazy initializer function ensures purity during re-renders
  const [trackingNumber, setTrackingNumber] = useState(() => {
    return `TRK-${Date.now().toString().slice(-6)}`;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAssign({
      orderId: order._id,
      carrier,
      trackingNumber,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Courier Tracking Label"
      description={`Order #${order?.orderNumber} • Destination: ${order?.shippingAddress?.city || "Domestic"}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted">
            Courier Carrier Partner
          </label>
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full min-h-11 px-3 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary cursor-pointer"
          >
            {CARRIERS.map((c) => (
              <option key={c} value={c}>
                {c} Express Logistics
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted">
            Courier Waybill / Tracking ID
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full min-h-11 px-3.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs font-mono focus:outline-hidden focus:border-brand-primary"
            required
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="luxury"
            size="md"
            icon={CheckCircle2}
            isLoading={isLoading}
          >
            Confirm & Dispatch
          </Button>
        </div>
      </form>
    </Modal>
  );
}
