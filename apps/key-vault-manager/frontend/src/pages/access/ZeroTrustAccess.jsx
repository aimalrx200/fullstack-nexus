// src/pages/access/ZeroTrustAccess.jsx

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  User,
  Server,
  Plus,
  MoreHorizontal,
  RotateCcw,
  Ban,
  Trash2,
  Edit3,
  Fingerprint,
  Globe,
  Radio,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { triggerToast } from "../../redux/slices/notificationSlice";
import { StatsCard } from "../../components/dashboard/common/StatsCard";
import { DataTable } from "../../components/common/DataTable";
import { vaultMockService } from "../../lib/vault/vaultMockService";
import {
  IssueGrantModal,
  CreatePolicyModal,
} from "../../components/vault/VaultModals";

export function ZeroTrustAccess() {
  const dispatch = useDispatch();

  // Dynamic state loaded from interconnected mock service
  const [grants, setGrants] = useState(() => vaultMockService.getGrants());
  const [policies, setPolicies] = useState(() =>
    vaultMockService.getPolicies(),
  );

  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  // Sync state on service notifications
  const syncState = useCallback(() => {
    setGrants(vaultMockService.getGrants());
    setPolicies(vaultMockService.getPolicies());
  }, []);

  useEffect(() => {
    return vaultMockService.subscribe(syncState);
  }, [syncState]);

  // Handlers
  const handleCreatedGrant = (grantData) => {
    vaultMockService.issueGrant(grantData);
    syncState();
    dispatch(
      triggerToast({
        message: "Identity Grant Dispatched",
        description: `Active pass issued to ${grantData.principal}.`,
        type: "success",
      }),
    );
  };

  const handleCreatedPolicy = (policyData) => {
    vaultMockService.createPolicy(policyData);
    syncState();
    dispatch(
      triggerToast({
        message: "Access Policy Enforced",
        description: `Bound rules established for ${policyData.name}.`,
        type: "success",
      }),
    );
  };

  const handleRevokeGrant = useCallback(
    (grant) => {
      vaultMockService.revokeGrant(grant.id);
      syncState();
      dispatch(
        triggerToast({
          message: "Access Pass Revoked",
          description: `Revoked active access for ${grant.principal}.`,
          type: "warning",
        }),
      );
    },
    [syncState, dispatch],
  );

  const handleRenewGrant = useCallback(
    (grant) => {
      vaultMockService.renewGrant(grant.id);
      syncState();
      dispatch(
        triggerToast({
          message: "Lease Renewed",
          description: `Extended lease for ${grant.principal}.`,
          type: "success",
        }),
      );
    },
    [syncState, dispatch],
  );

  const handlePurgeGrant = useCallback(
    (grant) => {
      vaultMockService.purgeGrant(grant.id);
      syncState();
      dispatch(
        triggerToast({
          message: "Principal Purged",
          description: `Removed ${grant.principal} from boundary tables.`,
          type: "info",
        }),
      );
    },
    [syncState, dispatch],
  );

  const handleDeletePolicy = useCallback(
    (policy) => {
      vaultMockService.deletePolicy(policy.id);
      syncState();
      dispatch(
        triggerToast({
          message: "Policy Deleted",
          description: `Removed ${policy.name} from enforcement matrix.`,
          type: "warning",
        }),
      );
    },
    [syncState, dispatch],
  );

  // Derived Metrics
  const metrics = useMemo(() => {
    const activeGrants = grants.filter((g) => g.status === "Active").length;
    const blockedCount = grants.filter((g) => g.status === "Blocked").length;

    return [
      {
        id: "active-grants",
        title: "Active Grants",
        value: `${activeGrants} Grants`,
        badgeText: "Valid",
        badgeVariant: "success",
        subtext: "mTLS & FIDO2 Ephemeral Passes",
        icon: ShieldCheck,
      },
      {
        id: "enforced-policies",
        title: "Enforced Policies",
        value: `${policies.length} Rules`,
        badgeText: "Active",
        badgeVariant: "success",
        subtext: "ABAC / Boundary Strict Gate",
        icon: Lock,
      },
      {
        id: "blocked-anomalies",
        title: "Blocked Anomalies",
        value: `${blockedCount} Drops`,
        badgeText: "Perimeter",
        badgeVariant: blockedCount > 0 ? "danger" : "success",
        subtext: "CIDR / Expired Handshake Drop",
        icon: ShieldAlert,
      },
    ];
  }, [grants, policies]);

  // Columns: Active Identity Grants
  const grantColumns = useMemo(
    () => [
      {
        accessorKey: "principal",
        header: "Principal Identity",
        cell: ({ row }) => {
          const isMachine = row.original.principalType === "machine";
          const PrincipalIcon = isMachine ? Server : User;
          return (
            <div className="overview-table-secret-cell">
              <PrincipalIcon className="overview-table-secret-icon" />
              <span className="overview-table-secret-name">
                {row.original.principal}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role / Scope",
        cell: ({ row }) => (
          <span className="vault-text-cell-bold">{row.original.role}</span>
        ),
      },
      {
        accessorKey: "authMethod",
        header: "Auth Method",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-mono text-xs text-text-subtle">
            <Fingerprint className="h-3.5 w-3.5 text-brand-primary" />
            <span>{row.original.authMethod}</span>
          </div>
        ),
      },
      {
        accessorKey: "boundCidr",
        header: "Bound CIDR",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 font-mono text-xs text-text-subtle">
            <Globe className="h-3.5 w-3.5 text-text-subtle/70" />
            <span>{row.original.boundCidr}</span>
          </div>
        ),
      },
      {
        accessorKey: "leaseRemaining",
        header: "Lease Left",
        cell: ({ row }) => (
          <span className="overview-table-ttl-cell">
            {row.original.leaseRemaining}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          let badgeStyle = "overview-table-status-success";
          let StatusIcon = CheckCircle2;

          if (status === "Expiring") {
            badgeStyle = "overview-table-status-warning";
            StatusIcon = AlertTriangle;
          } else if (status === "Blocked") {
            badgeStyle = "overview-table-status-danger";
            StatusIcon = XCircle;
          }

          return (
            <span className={`overview-table-status-badge ${badgeStyle}`}>
              <StatusIcon className="overview-table-status-icon" />
              {status}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => (
          <span className="overview-table-actions-header">Actions</span>
        ),
        cell: ({ row }) => {
          const { status } = row.original;
          return (
            <div className="overview-table-actions-group">
              {status === "Active" && (
                <button
                  type="button"
                  title="Revoke Grant"
                  onClick={() => handleRevokeGrant(row.original)}
                  className="overview-action-btn-danger"
                >
                  <Ban className="overview-action-btn-icon" />
                </button>
              )}

              {status === "Expiring" && (
                <button
                  type="button"
                  title="Renew Lease"
                  onClick={() => handleRenewGrant(row.original)}
                  className="overview-action-btn-warning"
                >
                  <RotateCcw className="overview-action-btn-icon" />
                </button>
              )}

              {status === "Blocked" && (
                <button
                  type="button"
                  title="Purge Blocked Principal"
                  onClick={() => handlePurgeGrant(row.original)}
                  className="overview-action-btn-danger"
                >
                  <Trash2 className="overview-action-btn-icon" />
                </button>
              )}

              <button
                type="button"
                title="More Options"
                onClick={() =>
                  dispatch(
                    triggerToast({
                      message: "Grant Details",
                      description: `CIDR: ${row.original.boundCidr}`,
                      type: "info",
                    }),
                  )
                }
                className="overview-action-btn-standard"
              >
                <MoreHorizontal className="overview-action-btn-icon" />
              </button>
            </div>
          );
        },
      },
    ],
    [dispatch, handlePurgeGrant, handleRenewGrant, handleRevokeGrant],
  );

  // Columns: Perimeter Policies Matrix
  const policyColumns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Policy Identifier",
        cell: ({ row }) => (
          <div className="overview-table-secret-cell">
            <Lock className="overview-table-secret-icon" />
            <span className="overview-table-secret-name">
              {row.original.name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "pathPattern",
        header: "Path Boundary Pattern",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-text-main">
            {row.original.pathPattern}
          </span>
        ),
      },
      {
        accessorKey: "mfaGate",
        header: "MFA Gate / Proof",
        cell: ({ row }) => (
          <span className="vault-text-cell-muted">{row.original.mfaGate}</span>
        ),
      },
      {
        accessorKey: "riskScore",
        header: "Risk Score",
        cell: ({ row }) => {
          const isLow = row.original.riskLevel === "low";
          const badgeClass = isLow
            ? "overview-table-status-success"
            : "overview-table-status-warning";
          const Icon = isLow ? CheckCircle2 : AlertTriangle;

          return (
            <span className={`overview-table-status-badge ${badgeClass}`}>
              <Icon className="overview-table-status-icon" />
              {row.original.riskScore}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => (
          <span className="overview-table-actions-header">Actions</span>
        ),
        cell: ({ row }) => (
          <div className="overview-table-actions-group">
            <button
              type="button"
              title="Delete Policy"
              onClick={() => handleDeletePolicy(row.original)}
              className="overview-action-btn-danger"
            >
              <Trash2 className="overview-action-btn-icon" />
            </button>
          </div>
        ),
      },
    ],
    [handleDeletePolicy],
  );

  return (
    <div className="vault-container font-mono">
      {/* Top Header Banner */}
      <div className="vault-header">
        <div>
          <div className="vault-header-titles">
            <h1 className="vault-title">Zero-Trust Access</h1>
            <span className="vault-namespace">── Global Enforcement</span>
          </div>
          <p className="vault-subtitle">
            Manage ephemeral access passes, bound CIDRs, strict mTLS identity
            grants, and perimeter gates.
          </p>
        </div>

        <div className="vault-header-badges">
          <span className="vault-cluster-badge">
            <Radio className="vault-cluster-icon animate-pulse" />
            <span>Gateway: Enforced</span>
          </span>
          <span className="vault-env-security-badge">
            <ShieldCheck className="vault-badge-icon" />
            <span>Strict mTLS</span>
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="vault-metrics-grid">
        {metrics.map((metric) => (
          <StatsCard
            key={metric.id}
            icon={metric.icon}
            title={metric.title}
            value={metric.value}
            badgeText={metric.badgeText}
            badgeVariant={metric.badgeVariant}
            subtext={metric.subtext}
          />
        ))}
      </div>

      {/* Section 1: Active Identity Grants Table */}
      <DataTable
        title="Active Identity Grants & Ephemeral Passes"
        data={grants}
        columns={grantColumns}
        showActionButton
        actionButtonLabel="Issue Access Grant"
        actionButtonIcon={Plus}
        onAction={() => setIsIssueModalOpen(true)}
      />

      {/* Section 2: Perimeter Policies Matrix Table */}
      <DataTable
        title="Perimeter Policies & Enforcement Matrix"
        data={policies}
        columns={policyColumns}
        showActionButton
        actionButtonLabel="Create Access Policy"
        actionButtonIcon={Plus}
        onAction={() => setIsPolicyModalOpen(true)}
      />

      {/* Modals */}
      <IssueGrantModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onCreated={handleCreatedGrant}
      />

      <CreatePolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        onCreated={handleCreatedPolicy}
      />
    </div>
  );
}
