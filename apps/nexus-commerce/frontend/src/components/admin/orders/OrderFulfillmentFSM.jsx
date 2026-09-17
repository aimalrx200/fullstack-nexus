import React from "react";
import { CheckCircle2, Package, Truck, Play, AlertOctagon } from "lucide-react";
import { Button } from "../../common/Button";

export function OrderFulfillmentFSM({
  order,
  onTransitionStatus,
  onOpenCourierModal,
  onSimulateDelivery,
  isLoading,
}) {
  const currentStatus = order?.fulfillmentStatus || "unfulfilled";

  return (
    <div className="p-4 rounded-2xl bg-surface-elevated border border-border-main space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-main">
          FSM State Machine Action Control
        </span>
        <span className="text-[10px] font-mono text-brand-primary uppercase">
          Current: {currentStatus}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* State 1: Unfulfilled -> Confirmed */}
        {currentStatus === "unfulfilled" && (
          <Button
            variant="primary"
            size="sm"
            icon={CheckCircle2}
            isLoading={isLoading}
            onClick={() => onTransitionStatus(order._id, "confirmed")}
          >
            Confirm Order
          </Button>
        )}

        {/* State 2: Confirmed -> Processing */}
        {currentStatus === "confirmed" && (
          <Button
            variant="primary"
            size="sm"
            icon={Package}
            isLoading={isLoading}
            onClick={() => onTransitionStatus(order._id, "processing")}
          >
            Mark Processing & Pack
          </Button>
        )}

        {/* State 3: Processing -> Dispatched */}
        {currentStatus === "processing" && (
          <Button
            variant="luxury"
            size="sm"
            icon={Truck}
            onClick={() => onOpenCourierModal(order)}
          >
            Assign Courier & Dispatch
          </Button>
        )}

        {/* State 4: Dispatched -> Live Delivery Simulator */}
        {currentStatus === "dispatched" && (
          <>
            <Button
              variant="luxury"
              size="sm"
              icon={Play}
              onClick={() => onSimulateDelivery(order._id)}
            >
              Simulate Live Courier GPS
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              isLoading={isLoading}
              onClick={() => onTransitionStatus(order._id, "delivered")}
            >
              Mark Delivered
            </Button>
          </>
        )}

        {/* Cancel Action (Saga Rollback of stock) */}
        {currentStatus !== "cancelled" && currentStatus !== "delivered" && (
          <Button
            variant="danger"
            size="sm"
            icon={AlertOctagon}
            isLoading={isLoading}
            onClick={() => onTransitionStatus(order._id, "cancelled")}
          >
            Cancel (Rollback Stock)
          </Button>
        )}
      </div>
    </div>
  );
}
