// src/pages/identities/MachineIdentities.jsx

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Cpu,
  Zap,
  ScrollText,
  ShieldCheck,
  Server,
  Cloud,
  Lock,
  Globe,
  Radio,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  Settings,
  MoreHorizontal,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Layers,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { triggerToast } from "../../redux/slices/notificationSlice";
import { StatsCard } from "../../components/dashboard/common/StatsCard";
import { DataTable } from "../../components/common/DataTable";
import { vaultMockService } from "../../lib/vault/vaultMockService";
import {
  RegisterIdentityModal,
  AddWifGatewayModal,
} from "../../components/vault/VaultModals";

export function MachineIdentities() {
  const dispatch = useDispatch();

  // Dynamic state from centralized service
  const [workloads, setWorkloads] = useState(() =>
    vaultMockService.getWorkloadIdentities(),
  );
  const [wifGateways, setWifGateways] = useState(() =>
    vaultMockService.getWifGateways(),
  );

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAddWifOpen, setIsAddWifOpen] = useState(false);

  // Sync state on notifications
  const syncState = useCallback(() => {
    setWorkloads(vaultMockService.getWorkloadIdentities());
    setWifGateways(vaultMockService.getWifGateways());
  }, []);

  useEffect(() => {
    return vaultMockService.subscribe(syncState);
  }, [syncState]);

  // Handlers
  const handleRegisteredIdentity = (nhiData) => {
    vaultMockService.registerWorkloadIdentity(nhiData);
    syncState();
    dispatch(
      triggerToast({
        message: "Workload Identity Registered",
        description: `Bound SPIFFE credentials issued for ${nhiData.workloadId}.`,
        type: "success",
      }),
    );
  };

  const handleRotateIdentity = useCallback(
    (item) => {
      vaultMockService.rotateWorkloadIdentity(item.id);
      syncState();
      dispatch(
        triggerToast({
          message: "Identity Credentials Rotated",
          description: `New AppRole/STS secret assigned to ${item.workloadId}.`,
          type: "success",
        }),
      );
    },
    [syncState, dispatch],
  );

  const handleRenewIdentity = useCallback(
    (item) => {
      vaultMockService.renewWorkloadIdentity(item.id);
      syncState();
      dispatch(
        triggerToast({
          message: "Lease Renewed",
          description: `Active STS token extended for ${item.workloadId}.`,
          type: "success",
        }),
      );
    },
    [syncState, dispatch],
  );

  const handlePurgeIdentity = useCallback(
    (item) => {
      vaultMockService.purgeWorkloadIdentity(item.id);
      syncState();
      dispatch(
        triggerToast({
          message: "Identity Purged",
          description: `Revoked machine identity ${item.workloadId}.`,
          type: "warning",
        }),
      );
    },
    [syncState, dispatch],
  );

  const handleCreatedWif = (wifData) => {
    vaultMockService.addWifGateway(wifData);
    syncState();
    dispatch(
      triggerToast({
        message: "WIF Gateway Added",
        description: `Federation linked with ${wifData.providerName}.`,
        type: "success",
      }),
    );
  };

  // Top Metrics
  const metrics = useMemo(() => {
    const activeCount = workloads.filter((w) => w.status === "PASS").length;
    const expiringCount = workloads.filter((w) => w.status === "EXP").length;

    return [
      {
        id: "workload-identities",
        title: "Workload Identities",
        value: `${activeCount} Active`,
        badgeText: "99% OK",
        badgeVariant: "success",
        subtext: "SPIFFE, K8s & Cloud IAM Non-Human Identities",
        icon: Cpu,
      },
      {
        id: "auto-rotating-leases",
        title: "Auto-Rotating Leases",
        value: `${workloads.length} Leases`,
        badgeText: "Auto-Rot",
        badgeVariant: "success",
        subtext: "Automated 4-Hour TTL Secret Sweeper",
        icon: Zap,
      },
      {
        id: "ephemeral-mtls-certs",
        title: "Expiring Leases",
        value: `${expiringCount} Expiring`,
        badgeText: expiringCount > 0 ? "Renew Req" : "Healthy",
        badgeVariant: expiringCount > 0 ? "warning" : "success",
        subtext: "Short-Lived X.509 SVID Attestations",
        icon: ScrollText,
      },
    ];
  }, [workloads]);

  // Columns: Workload Registry
  const workloadColumns = useMemo(
    () => [
      {
        accessorKey: "workloadId",
        header: "Workload ID",
        cell: ({ row }) => (
          <div className="overview-table-secret-cell">
            <Server className="overview-table-secret-icon" />
            <span className="overview-table-secret-name">
              {row.original.workloadId}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "authBackend",
        header: "Auth Backend",
        cell: ({ row }) => {
          const { backendType, authBackend } = row.original;
          let Icon = Shield;
          if (backendType === "approle") Icon = Zap;
          if (backendType === "aws") Icon = Cloud;
          if (backendType === "static") Icon = Lock;

          return (
            <div className="flex items-center gap-1.5 font-mono text-xs text-text-subtle">
              <Icon className="h-3.5 w-3.5 text-brand-primary" />
              <span>{authBackend}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "spiffeId",
        header: "Attestation / SPIFFE ID",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-text-main">
            <Fingerprint className="h-3.5 w-3.5 text-brand-secondary shrink-0" />
            <span>{row.original.spiffeId}</span>
          </div>
        ),
      },
      {
        accessorKey: "boundScope",
        header: "Bound Scope / Path",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium text-text-subtle">
            {row.original.boundScope}
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

          if (status === "EXP") {
            badgeStyle = "overview-table-status-warning";
            StatusIcon = AlertTriangle;
          } else if (status === "REV") {
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
          const item = row.original;
          return (
            <div className="overview-table-actions-group">
              {item.status === "PASS" && (
                <button
                  type="button"
                  title="Rotate Identity Credentials"
                  onClick={() => handleRotateIdentity(item)}
                  className="overview-action-btn-standard"
                >
                  <RefreshCw className="overview-action-btn-icon" />
                </button>
              )}

              {item.status === "EXP" && (
                <button
                  type="button"
                  title="Renew Expiring Lease"
                  onClick={() => handleRenewIdentity(item)}
                  className="overview-action-btn-warning"
                >
                  <RotateCcw className="overview-action-btn-icon" />
                </button>
              )}

              {item.status === "REV" && (
                <button
                  type="button"
                  title="Purge Revoked Identity"
                  onClick={() => handlePurgeIdentity(item)}
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
                      message: "Identity Scope",
                      description: `Bound: ${item.boundScope}`,
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
    [dispatch, handlePurgeIdentity, handleRenewIdentity, handleRotateIdentity],
  );

  // Columns: WIF Gateways Matrix
  const gatewayColumns = useMemo(
    () => [
      {
        accessorKey: "providerName",
        header: "Gateway / Provider",
        cell: ({ row }) => {
          const { providerType, providerName } = row.original;
          let ProviderIcon = Layers;
          if (providerType === "spire") ProviderIcon = Globe;
          if (providerType === "aws") ProviderIcon = Cloud;

          return (
            <div className="overview-table-secret-cell">
              <ProviderIcon className="overview-table-secret-icon" />
              <span className="overview-table-secret-name">{providerName}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "tokenType",
        header: "Token Type / Format",
        cell: ({ row }) => (
          <span className="vault-text-cell-muted">
            {row.original.tokenType}
          </span>
        ),
      },
      {
        accessorKey: "activeNhis",
        header: "Active NHIs",
        cell: ({ row }) => (
          <span className="vault-text-cell-bold">
            {row.original.activeNhis}
          </span>
        ),
      },
      {
        accessorKey: "attestationEngine",
        header: "Attestation Engine",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-text-main">
            {row.original.attestationEngine}
          </span>
        ),
      },
      {
        accessorKey: "health",
        header: "Health",
        cell: ({ row }) => (
          <span className="overview-table-status-badge overview-table-status-success">
            <CheckCircle2 className="overview-table-status-icon" />
            {row.original.health}
          </span>
        ),
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
              title="Configure Gateway Provider"
              onClick={() =>
                dispatch(
                  triggerToast({
                    message: "Gateway Provider",
                    description: `Attestation: ${row.original.attestationEngine}`,
                    type: "info",
                  }),
                )
              }
              className="overview-action-btn-standard"
            >
              <Settings className="overview-action-btn-icon" />
            </button>
          </div>
        ),
      },
    ],
    [dispatch],
  );

  return (
    <div className="vault-container font-mono">
      {/* Top Header Banner */}
      <div className="vault-header">
        <div>
          <div className="vault-header-titles">
            <h1 className="vault-title">Machine Identities</h1>
            <span className="vault-namespace">── Workload IAM & SPIFFE</span>
          </div>
          <p className="vault-subtitle">
            Manage non-human identities (NHIs), AppRoles, SPIFFE/SPIRE workload
            attestations, and federated cloud trusts.
          </p>
        </div>

        <div className="vault-header-badges">
          <span className="vault-cluster-badge">
            <Radio className="vault-cluster-icon animate-pulse" />
            <span>NHI Engine: Active</span>
          </span>
          <span className="vault-env-security-badge">
            <ShieldCheck className="vault-badge-icon" />
            <span>mTLS Bound</span>
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

      {/* Section 1: Registered Workload Identities Table */}
      <DataTable
        title="Registered Workload Identities & AppRoles"
        data={workloads}
        columns={workloadColumns}
        showActionButton
        actionButtonLabel="Register Identity"
        actionButtonIcon={Plus}
        onAction={() => setIsRegisterOpen(true)}
      />

      {/* Section 2: WIF Gateways Table */}
      <DataTable
        title="Workload Identity Federation (WIF) Gateways"
        data={wifGateways}
        columns={gatewayColumns}
        showActionButton
        actionButtonLabel="Add Auth Gateway"
        actionButtonIcon={Plus}
        onAction={() => setIsAddWifOpen(true)}
      />

      {/* Modals */}
      <RegisterIdentityModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onCreated={handleRegisteredIdentity}
      />

      <AddWifGatewayModal
        isOpen={isAddWifOpen}
        onClose={() => setIsAddWifOpen(false)}
        onCreated={handleCreatedWif}
      />
    </div>
  );
}
