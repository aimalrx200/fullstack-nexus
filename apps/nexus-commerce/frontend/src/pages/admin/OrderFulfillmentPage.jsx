import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/adminApi";
import { queryKeys } from "../../lib/api/queryKeys";
import { OrderFulfillmentFSM } from "../../components/admin/orders/OrderFulfillmentFSM";
import { CourierTrackingModal } from "../../components/admin/orders/CourierTrackingModal";
import { OrderSummaryCard } from "../../components/storefront/orders/OrderSummaryCard";
import { toast } from "sonner";

export function OrderFulfillmentPage() {
  const queryClient = useQueryClient();
  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.orders(),
    queryFn: () => adminApi.getAllOrders(),
  });

  const transitionMutation = useMutation({
    mutationFn: ({ orderId, status }) =>
      adminApi.updateFulfillmentStatus(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders() });
      toast.success("Order status updated successfully!");
    },
  });

  const courierMutation = useMutation({
    mutationFn: (payload) =>
      adminApi.assignCourierTracking(payload.orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders() });
      setSelectedOrderForCourier(null);
      toast.success("Courier tracking label assigned & dispatched!");
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
          Order Fulfillment & FSM Transitions
        </h1>
        <p className="text-xs text-text-muted">
          Manage fulfillment lifecycle with Saga rollback on cancellation.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-text-muted font-mono">
          Loading orders...
        </div>
      ) : (
        <div className="space-y-4">
          {data?.orders?.map((order) => (
            <div
              key={order._id}
              className="p-5 rounded-3xl bg-surface-card border border-border-main space-y-4"
            >
              <OrderSummaryCard order={order} />
              <OrderFulfillmentFSM
                order={order}
                onTransitionStatus={(orderId, status) =>
                  transitionMutation.mutate({ orderId, status })
                }
                onOpenCourierModal={setSelectedOrderForCourier}
                onSimulateDelivery={(orderId) =>
                  adminApi.simulateCourierDelivery(orderId)
                }
                isLoading={transitionMutation.isPending}
              />
            </div>
          ))}
        </div>
      )}

      {selectedOrderForCourier && (
        <CourierTrackingModal
          isOpen={Boolean(selectedOrderForCourier)}
          onClose={() => setSelectedOrderForCourier(null)}
          order={selectedOrderForCourier}
          onAssign={courierMutation.mutate}
          isLoading={courierMutation.isPending}
        />
      )}
    </div>
  );
}
