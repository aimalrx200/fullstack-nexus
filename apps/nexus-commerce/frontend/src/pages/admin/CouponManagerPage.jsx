import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CouponTable } from "../../components/admin/coupons/CouponTable";
import { CouponFormModal } from "../../components/admin/coupons/CouponFormModal";
import { Button } from "../../components/common/Button";
import { adminApi } from "../../lib/api/adminApi";
import { queryKeys } from "../../lib/api/queryKeys";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function CouponManagerPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.coupons({ page }),
    queryFn: () => adminApi.getCoupons({ page, limit: 10 }),
  });

  const saveMutation = useMutation({
    mutationFn: (formData) => {
      if (editingCoupon?._id) {
        return adminApi.updateCoupon(editingCoupon._id, formData);
      }
      return adminApi.createCoupon(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.coupons() });
      setIsModalOpen(false);
      setEditingCoupon(null);
      toast.success("Coupon saved successfully!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to save coupon");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (couponId) => adminApi.deleteCoupon(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.coupons() });
      toast.success("Coupon deleted successfully!");
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
            Promotional Coupons
          </h1>
          <p className="text-xs text-text-muted">
            Manage redemption caps, percentage discounts, and order rules.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => {
            setEditingCoupon(null);
            setIsModalOpen(true);
          }}
        >
          Create Coupon
        </Button>
      </div>

      <CouponTable
        coupons={data?.coupons || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPaginationChange={setPage}
        onEdit={(coupon) => {
          setEditingCoupon(coupon);
          setIsModalOpen(true);
        }}
        onDelete={deleteMutation.mutate}
      />

      {isModalOpen && (
        <CouponFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCoupon(null);
          }}
          initialData={editingCoupon}
          onSave={saveMutation.mutate}
          isLoading={saveMutation.isPending}
        />
      )}
    </div>
  );
}
