// apps/nexus-commerce/frontend/src/pages/admin/StaffManagerPage.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffTable } from "../../components/admin/staff/StaffTable";
import { InviteStaffModal } from "../../components/admin/staff/InviteStaffModal";
import { Button } from "../../components/common/Button";
import { staffApi } from "../../lib/api/staffApi";
import { queryKeys } from "../../lib/api/queryKeys";
import { UserPlus, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export function StaffManagerPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.staff.list({ page }),
    queryFn: () => staffApi.getStaffMembers({ page, limit: 15 }),
  });

  const inviteMutation = useMutation({
    mutationFn: staffApi.inviteStaffMember,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      setIsModalOpen(false);
      toast.success(res.message || "Team member added successfully!");
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Failed to invite staff member",
      );
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => staffApi.updateStaffRole(userId, role),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success(res.message || "Staff role updated successfully!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update role");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: staffApi.revokeStaffAccess,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.info(res.message || "Staff access revoked.");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to revoke access");
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
            Team & Staff Authorization
          </h1>
          <p className="text-xs text-text-muted">
            Manage granular role delegation between Support Agents, Merchant
            Admins, and Root Owners.
          </p>
        </div>

        <Button
          variant="luxury"
          size="md"
          icon={UserPlus}
          onClick={() => setIsModalOpen(true)}
        >
          Invite Staff Member
        </Button>
      </div>

      <StaffTable
        staff={data?.staff || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPaginationChange={setPage}
        onRoleChange={(userId, role) =>
          updateRoleMutation.mutate({ userId, role })
        }
        onRevoke={(userId) => revokeMutation.mutate(userId)}
        isUpdating={updateRoleMutation.isPending || revokeMutation.isPending}
      />

      <InviteStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInvite={inviteMutation.mutate}
        isLoading={inviteMutation.isPending}
      />
    </div>
  );
}
