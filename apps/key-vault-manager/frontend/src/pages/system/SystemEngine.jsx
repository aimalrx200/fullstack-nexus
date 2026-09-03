// src/pages/system/SystemEngine.jsx

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LockOpen,
  Server,
  KeyRound,
  Zap,
  Crown,
  Vote,
  Archive,
  RefreshCw,
  RotateCcw,
  Settings,
  MoreHorizontal,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Shield,
  Lock,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { triggerToast } from "../../redux/slices/notificationSlice";
import { StatsCard } from "../../components/dashboard/common/StatsCard";
import { DataTable } from "../../components/common/DataTable";
import { vaultMockService } from "../../lib/vault/vaultMockService";
import { RotateMasterKeyModal } from "../../components/vault/VaultModals";

export function SystemEngine() {
  const dispatch = useDispatch();

  // Dynamic system engine state
  const [systemState, setSystemState] = useState(() =>
    vaultMockService.getSystemState(),
  );
  const [isRotateModalOpen, setIsRotateModalOpen] = useState(false);

  // Sync state on notifications
  const syncState = useCallback(() => {
    setSystemState(vaultMockService.getSystemState());
  }, []);

  useEffect(() => {
    return vaultMockService.subscribe(syncState);
  }, [syncState]);

  // Handlers
  const handleToggleSeal = () => {
    const isNowSealed = vaultMockService.toggleSealVault();
    syncState();
    dispatch(
      triggerToast({
        message: isNowSealed
          ? "Vault Barrier Sealed"
          : "Vault Barrier Unsealed",
        description: isNowSealed
          ? "Memory decrypted buffers wiped. Shamir unseal required."
          : "AES-256 master barrier unlocked & active.",
        type: isNowSealed ? "error" : "success",
      }),
    );
  };

  const handleStepDownLeader = useCallback(() => {
    vaultMockService.stepDownLeader();
    syncState();
    dispatch(
      triggerToast({
        message: "Raft Leader Stepped Down",
        description: "Coordinated cluster leader election executed.",
        type: "warning",
      }),
    );
  }, [syncState, dispatch]);

  const handlePromoteCandidate = useCallback(
    (node) => {
      vaultMockService.promoteCandidate(node.id);
      syncState();
      dispatch(
        triggerToast({
          message: "Node Promoted to Leader",
          description: `${node.nodeId} assumed HA leadership role.`,
          type: "success",
        }),
      );
    },
    [syncState, dispatch],
  );

  const handleSyncDrNode = useCallback(
    (node) => {
      vaultMockService.syncDrNode(node.id);
      syncState();
      dispatch(
        triggerToast({
          message: "DR Node Re-synced",
          description: `Synchronized Raft state on ${node.nodeId}.`,
          type: "success",
        }),
      );
    },
    [syncState, dispatch],
  );

  const handleRotatedKey = (keyData) => {
    vaultMockService.rotateMasterKey(keyData);
    syncState();
    dispatch(
      triggerToast({
        message: "Master Barrier Key Rotated",
        description: `Re-encrypted with ${keyData.algorithm}.`,
        type: "success",
      }),
    );
  };

  // Top Metrics
  const metrics = useMemo(() => {
    return [
      {
        id: "barrier-status",
        title: "Barrier Status",
        value: systemState.isSealed ? "Sealed" : "Unsealed",
        badgeText: systemState.isSealed ? "Sealed" : "Active",
        badgeVariant: systemState.isSealed ? "danger" : "success",
        subtext: "AES-256-GCM Primary Encryption Barrier",
        icon: systemState.isSealed ? Lock : LockOpen,
      },
      {
        id: "raft-cluster-quorum",
        title: "Raft Cluster Quorum",
        value: `${systemState.raftNodes.length} Nodes`,
        badgeText: "In-Sync",
        badgeVariant: "success",
        subtext: "HA Leader Election (Quorum 3/5)",
        icon: Server,
      },
      {
        id: "shamir-key-threshold",
        title: "Shamir Key Threshold",
        value: systemState.shamirShares,
        badgeText: "AWS-KMS",
        badgeVariant: "success",
        subtext: "Auto-Unseal via Cloud KMS & HSM Envelope",
        icon: KeyRound,
      },
    ];
  }, [systemState]);

  // Columns: Raft Nodes
  const raftColumns = useMemo(
    () => [
      {
        accessorKey: "nodeId",
        header: "Node ID",
        cell: ({ row }) => (
          <div className="overview-table-secret-cell">
            <Server className="overview-table-secret-icon" />
            <span className="overview-table-secret-name">
              {row.original.nodeId}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role / State",
        cell: ({ row }) => {
          const { roleType, role } = row.original;
          let RoleIcon = Vote;
          let roleColor = "text-text-main";

          if (roleType === "leader") {
            RoleIcon = Crown;
            roleColor = "text-status-warning font-bold";
          } else if (roleType === "non-voter") {
            RoleIcon = Archive;
            roleColor = "text-text-subtle";
          }

          return (
            <div
              className={`flex items-center gap-1.5 font-mono text-xs ${roleColor}`}
            >
              <RoleIcon className="h-3.5 w-3.5" />
              <span>{role}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "clusterAddress",
        header: "Cluster Address",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-text-subtle">
            {row.original.clusterAddress}
          </span>
        ),
      },
      {
        accessorKey: "commitIndex",
        header: "Commit Index / Term",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-text-main">
            {row.original.commitIndex}
          </span>
        ),
      },
      {
        accessorKey: "latency",
        header: "Latency",
        cell: ({ row }) => {
          const isWarn = row.original.latencyLevel === "warn";
          const badgeStyle = isWarn
            ? "overview-table-status-warning"
            : "overview-table-status-success";
          const Icon = isWarn ? AlertTriangle : CheckCircle2;

          return (
            <span className={`overview-table-status-badge ${badgeStyle}`}>
              <Icon className="overview-table-status-icon" />
              {row.original.latency}
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
              {item.roleType === "leader" && (
                <button
                  type="button"
                  title="Step Down Leader"
                  onClick={handleStepDownLeader}
                  className="overview-action-btn-warning"
                >
                  <ArrowDownCircle className="overview-action-btn-icon" />
                </button>
              )}

              {item.roleType === "follower" && (
                <button
                  type="button"
                  title="Promote to Candidate"
                  onClick={() => handlePromoteCandidate(item)}
                  className="overview-action-btn-standard"
                >
                  <ArrowUpCircle className="overview-action-btn-icon" />
                </button>
              )}

              {item.roleType === "non-voter" && (
                <button
                  type="button"
                  title="Force Sync DR Node"
                  onClick={() => handleSyncDrNode(item)}
                  className="overview-action-btn-warning"
                >
                  <RefreshCw className="overview-action-btn-icon" />
                </button>
              )}

              <button
                type="button"
                title="More Options"
                onClick={() =>
                  dispatch(
                    triggerToast({
                      message: "Node Details",
                      description: `Address: ${item.clusterAddress}`,
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
    [dispatch, handlePromoteCandidate, handleStepDownLeader, handleSyncDrNode],
  );

  // Columns: Crypto Engines
  const cryptoColumns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Subsystem / Engine",
        cell: ({ row }) => {
          const { engineType, name } = row.original;
          let EngineIcon = Shield;
          if (engineType === "shamir") EngineIcon = Lock;
          if (engineType === "transit") EngineIcon = Zap;

          return (
            <div className="overview-table-secret-cell">
              <EngineIcon className="overview-table-secret-icon" />
              <span className="overview-table-secret-name">{name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "algorithm",
        header: "Algorithm / Standard",
        cell: ({ row }) => (
          <span className="vault-text-cell-bold">{row.original.algorithm}</span>
        ),
      },
      {
        accessorKey: "version",
        header: "Version",
        cell: ({ row }) => (
          <span className="vault-text-cell-muted">{row.original.version}</span>
        ),
      },
      {
        accessorKey: "hardware",
        header: "Hardware Acceleration",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-text-main">
            <Cpu className="h-3.5 w-3.5 text-brand-primary shrink-0" />
            <span>{row.original.hardware}</span>
          </div>
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
              title="Configure Engine Parameters"
              onClick={() =>
                dispatch(
                  triggerToast({
                    message: "Hardware Engine",
                    description: `Accelerated via ${row.original.hardware}`,
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
            <h1 className="vault-title">System Engine</h1>
            <span className="vault-namespace">
              ── Core Barrier & Raft Consensus
            </span>
          </div>
          <p className="vault-subtitle">
            Manage vault barrier state, Shamir secret threshold, Raft storage
            consensus, and hardware cryptographic master keys.
          </p>
        </div>

        <div className="vault-header-badges">
          <button
            type="button"
            onClick={handleToggleSeal}
            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-all ${
              systemState.isSealed
                ? "border-status-danger/40 bg-status-danger/10 text-status-danger hover:bg-status-danger/20"
                : "border-surface-border bg-surface-card text-text-subtle hover:text-brand-primary"
            }`}
          >
            {systemState.isSealed ? (
              <Lock className="w-3.5 h-3.5 text-status-danger animate-pulse" />
            ) : (
              <LockOpen className="w-3.5 h-3.5 text-status-success animate-pulse" />
            )}
            <span>
              {systemState.isSealed ? "Vault: Sealed" : "Vault: Unsealed"}
            </span>
          </button>
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

      {/* Section 1: Raft Storage Nodes Table */}
      <DataTable
        title="Raft Storage Nodes & Consensus Mesh"
        data={systemState.raftNodes}
        columns={raftColumns}
        showActionButton
        actionButtonLabel="Step Down Leader"
        actionButtonIcon={RotateCcw}
        onAction={handleStepDownLeader}
      />

      {/* Section 2: Cryptographic Barrier Matrix Table */}
      <DataTable
        title="Cryptographic Barrier & Master Encryption Keys"
        data={systemState.cryptoEngines}
        columns={cryptoColumns}
        showActionButton
        actionButtonLabel="Rotate Master Key"
        actionButtonIcon={KeyRound}
        onAction={() => setIsRotateModalOpen(true)}
      />

      {/* Modals */}
      <RotateMasterKeyModal
        isOpen={isRotateModalOpen}
        onClose={() => setIsRotateModalOpen(false)}
        onRotate={handleRotatedKey}
      />
    </div>
  );
}
