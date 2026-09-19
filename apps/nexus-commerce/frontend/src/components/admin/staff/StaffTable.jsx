// apps/nexus-commerce/frontend/src/components/admin/staff/StaffTable.jsx
import React, { useMemo } from "react";
import { format } from "date-fns";
import { ShieldCheck, UserCheck, Smartphone, Trash2 } from "lucide-react";
import { DataTable } from "../../common/DataTable";
import { Badge } from "../../common/Badge";

export function StaffTable({
  staff = [],
  isLoading,
  pagination,
  onPaginationChange,
  onRoleChange,
  onRevoke,
  isUpdating,
}) {
  const columns = useMemo(
    () => [
      {
        header: "Staff Member",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-border-main flex items-center justify-center text-xs font-mono font-bold">
              {row.original.name ? row.original.name[0] : "S"}
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-text-main truncate">
                  {row.original.name}
                </span>
                {row.original.isProtected && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-bold">
                    OWNER
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-text-muted truncate">
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: "Current Role",
        accessorKey: "role",
        cell: ({ row }) => {
          const role = row.original.role;
          if (role === "super_admin") {
            return (
              <Badge variant="glow" size="sm">
                SUPER ADMIN
              </Badge>
            );
          }
          if (role === "merchant_admin") {
            return (
              <Badge variant="brand" size="sm">
                MERCHANT ADMIN
              </Badge>
            );
          }
          return (
            <Badge variant="success" size="sm">
              SUPPORT AGENT
            </Badge>
          );
        },
      },
      {
        header: "Enrolled",
        accessorKey: "createdAt",
        cell: ({ row }) => (
          <span className="text-xs font-mono text-text-muted">
            {row.original.createdAt
              ? format(new Date(row.original.createdAt), "MMM dd, yyyy")
              : "N/A"}
          </span>
        ),
      },
      {
        header: "Role Assignment",
        id: "actions",
        cell: ({ row }) => {
          const member = row.original;
          const isMaster = member.isProtected;

          if (isMaster) {
            return (
              <span className="text-[11px] font-mono text-text-faint">
                Immutable Owner
              </span>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <select
                value={member.role}
                disabled={isUpdating}
                onChange={(e) => onRoleChange(member._id, e.target.value)}
                className="min-h-7.5 px-2 rounded-lg bg-surface-elevated border border-border-subtle text-[11px] text-text-main focus:outline-hidden cursor-pointer disabled:opacity-50"
              >
                <option value="support_agent">Support Agent</option>
                <option value="merchant_admin">Merchant Admin</option>
              </select>

              <button
                type="button"
                onClick={() => onRevoke(member._id)}
                disabled={isUpdating}
                className="min-h-7.5 px-2 rounded-lg text-text-faint hover:text-rose-400 hover:bg-rose-500/10 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                title="Revoke access"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      },
    ],
    [onRoleChange, onRevoke, isUpdating],
  );

  return (
    <DataTable
      data={staff}
      columns={columns}
      isLoading={isLoading}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
    />
  );
}
