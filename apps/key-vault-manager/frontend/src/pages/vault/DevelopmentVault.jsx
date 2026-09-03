// src/pages/vault/DevelopmentVault.jsx

import { useState, useMemo, useCallback } from "react";
import {
  Plug,
  Zap,
  Folder,
  FolderOpen,
  Database,
  HardDrive,
  Cpu,
  ShieldCheck,
  Server,
  Code,
  Plus,
  ExternalLink,
  MoreHorizontal,
  AlertCircle,
  KeyRound,
  Eye,
  RefreshCw,
  Cloud,
  Lock,
  Terminal,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { triggerToast } from "../../redux/slices/notificationSlice";
import { StatsCard } from "../../components/dashboard/common/StatsCard";
import { DataTable } from "../../components/common/DataTable";
import { vaultApi } from "../../lib/api/vaultApi";
import { vaultMockService } from "../../lib/vault/vaultMockService";
import {
  MountEngineModal,
  AddSecretPathModal,
  ViewSecretModal,
  SdkSnippetModal,
} from "../../components/vault/VaultModals";

const NAMESPACE = "Development";
const ROOT_ENGINE_PREFIX = "kv-dev";

const ENGINE_ICON_MAP = {
  "KV v2": Folder,
  PostgreSQL: Database,
  "Redis DB": HardDrive,
  Transit: Cpu,
  "PKI Certs": ShieldCheck,
  "AWS STS": Cloud,
};

export function DevelopmentVault() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // 1. Live Backend Query for Development Secrets from MongoDB
  const { data: vaultData } = useQuery({
    queryKey: ["vaultSecrets", NAMESPACE],
    queryFn: () => vaultApi.getSecrets(NAMESPACE),
  });

  const secrets = useMemo(() => vaultData?.secrets || [], [vaultData]);

  // Engines state backed by vaultMockService
  const [engines, setEngines] = useState(() =>
    vaultMockService.getEngines(NAMESPACE),
  );
  const [currentPath, setCurrentPath] = useState([]);

  // Modals state
  const [isMountModalOpen, setIsMountModalOpen] = useState(false);
  const [isAddPathModalOpen, setIsAddPathModalOpen] = useState(false);
  const [selectedSecretForView, setSelectedSecretForView] = useState(null);
  const [selectedSecretForSdk, setSelectedSecretForSdk] = useState(null);

  // 2. Live Rotation Mutation
  const { mutate: runRotate } = useMutation({
    mutationFn: (id) => vaultApi.rotateSecret({ id }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vaultSecrets"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
      dispatch(
        triggerToast({
          message: "Secret Rotated",
          description: data.message || "Updated to a new version hash.",
          type: "success",
        }),
      );
    },
    onError: (err) => {
      dispatch(
        triggerToast({
          message: "Rotation Failed",
          description:
            err.response?.data?.message || "Failed to rotate secret.",
          type: "error",
        }),
      );
    },
  });

  // 3. Live Secret Creation Mutation (Stores encrypted in MongoDB)
  const { mutateAsync: runCreateSecret } = useMutation({
    mutationFn: (payload) => vaultApi.createSecret(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaultSecrets"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
    },
  });

  // Navigation handlers
  const handleOpenFolder = useCallback((folder) => {
    setCurrentPath((prev) => [...prev, folder.name.replace(/\/$/, "")]);
  }, []);

  const handleNavigateBreadcrumb = useCallback((targetIndex) => {
    setCurrentPath((prev) =>
      targetIndex === -1 ? [] : prev.slice(0, targetIndex + 1),
    );
  }, []);

  // Engine mount handler
  const handleMountedEngine = (newEngine) => {
    vaultMockService.mountEngine(NAMESPACE, newEngine);
    setEngines(vaultMockService.getEngines(NAMESPACE));
  };

  // Add path handler: persists secret to DB if key, or keeps in tree if folder
  const handleAddedPath = async (item) => {
    if (item.isFolder) {
      vaultMockService.addTreeItem(NAMESPACE, currentPath, item);
    } else {
      await runCreateSecret({
        name: item.name,
        namespace: NAMESPACE,
        engine: "Transit",
        type: "Static",
        value: item.value,
        ttl: "Infinite",
      });
    }
  };

  // Convert live secrets + mock folders into explorer tree items
  const treeItems = useMemo(() => {
    return secrets.map((s) => ({
      id: s.id,
      isFolder: false,
      name: s.name,
      engineMode: `${s.engine} (v${s.version})`,
      lastUpdated: new Date(s.updatedAt || s.createdAt).toLocaleTimeString(),
      original: s,
    }));
  }, [secrets]);

  // Dynamic Metrics derived from live MongoDB data
  const dynamicLeasesCount = useMemo(
    () => secrets.filter((s) => s.type === "Dynamic").length,
    [secrets],
  );

  // Column Definitions: Mounted Secret Engines
  const engineColumns = useMemo(
    () => [
      {
        accessorKey: "path",
        header: "Engine Path",
        cell: ({ row }) => {
          const Icon = ENGINE_ICON_MAP[row.original.type] || Folder;
          return (
            <div className="vault-engine-cell">
              <Icon className="vault-engine-icon" />
              <span
                onClick={() => setCurrentPath([])}
                className="vault-engine-path"
              >
                {row.original.path}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Engine Type",
        cell: ({ row }) => (
          <span className="vault-text-cell-bold">{row.original.type}</span>
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
        accessorKey: "leasePolicy",
        header: "Lease Policy",
        cell: ({ row }) => (
          <span className="vault-text-cell-muted">
            {row.original.leasePolicy}
          </span>
        ),
      },
      {
        accessorKey: "activeSecrets",
        header: "Active Secrets",
        cell: ({ row }) => (
          <span className="vault-text-cell-medium">
            {row.original.activeSecrets}
          </span>
        ),
      },
      {
        accessorKey: "health",
        header: "Health",
        cell: ({ row }) => {
          const isWarn = row.original.health === "Warn";
          const badgeStyle = isWarn
            ? "vault-health-warning"
            : "vault-health-success";
          const Icon = isWarn ? AlertCircle : ShieldCheck;

          return (
            <span className={`vault-health-badge ${badgeStyle}`}>
              <Icon className="vault-health-icon" />
              {row.original.health}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="vault-actions-header">Actions</span>,
        cell: ({ row }) => (
          <div className="vault-actions-group">
            <button
              type="button"
              title="Browse Engine"
              aria-label="Browse Engine"
              onClick={() => setCurrentPath([])}
              className="vault-action-btn"
            >
              <ExternalLink className="vault-action-icon" />
            </button>
            <button
              type="button"
              title="More Options"
              aria-label="More Options"
              onClick={() =>
                dispatch(
                  triggerToast({
                    message: "Engine Options",
                    description: `Viewing parameters for ${row.original.path}`,
                    type: "info",
                  }),
                )
              }
              className="vault-action-btn"
            >
              <MoreHorizontal className="vault-action-icon" />
            </button>
          </div>
        ),
      },
    ],
    [dispatch],
  );

  // Column Definitions: Secret Explorer / Tree
  const treeColumns = useMemo(
    () => [
      {
        id: "type",
        header: "Type",
        cell: ({ row }) =>
          row.original.isFolder ? (
            <Folder className="vault-tree-icon" />
          ) : (
            <KeyRound className="vault-tree-icon" />
          ),
      },
      {
        accessorKey: "name",
        header: "Name / Path",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <span
              onClick={() =>
                item.isFolder
                  ? handleOpenFolder(item)
                  : setSelectedSecretForView(item.original || item)
              }
              className="vault-tree-name"
            >
              {item.name}
              {item.isFolder ? "/" : ""}
            </span>
          );
        },
      },
      {
        accessorKey: "engineMode",
        header: "Engine Mode",
        cell: ({ row }) => (
          <span className="vault-text-cell-muted">
            {row.original.engineMode}
          </span>
        ),
      },
      {
        accessorKey: "lastUpdated",
        header: "Last Updated",
        cell: ({ row }) => (
          <span className="vault-text-cell-muted">
            {row.original.lastUpdated}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="vault-actions-header">Actions</span>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="vault-actions-group">
              {item.isFolder ? (
                <button
                  type="button"
                  title="Open Folder"
                  aria-label="Open Folder"
                  onClick={() => handleOpenFolder(item)}
                  className="vault-action-btn"
                >
                  <FolderOpen className="vault-action-icon" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    title="View Secret"
                    aria-label="View Secret"
                    onClick={() =>
                      setSelectedSecretForView(item.original || item)
                    }
                    className="vault-action-btn"
                  >
                    <Eye className="vault-action-icon" />
                  </button>
                  <button
                    type="button"
                    title="Rotate Secret"
                    aria-label="Rotate Secret"
                    onClick={() => runRotate(item.id)}
                    className="vault-action-btn"
                  >
                    <RefreshCw className="vault-action-icon" />
                  </button>
                  <button
                    type="button"
                    title="View SDK Snippet"
                    aria-label="View SDK Snippet"
                    onClick={() =>
                      setSelectedSecretForSdk(item.original || item)
                    }
                    className="vault-action-btn text-brand-secondary hover:text-brand-secondary hover:border-brand-secondary/50"
                  >
                    <Terminal className="vault-action-icon" />
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [handleOpenFolder, runRotate],
  );

  return (
    <div className="vault-container font-mono">
      {/* Header Banner */}
      <div className="vault-header">
        <div>
          <div className="vault-header-titles">
            <h1 className="vault-title">Vault Engine</h1>
            <span className="vault-namespace">── Development Namespace</span>
          </div>
          <p className="vault-subtitle">
            Manage local development engines, AES-256 encrypted sandbox keys,
            transit engines, and dynamic leases.
          </p>
        </div>

        <div className="vault-header-badges">
          <span className="vault-cluster-badge">
            <Server className="vault-cluster-icon" />
            <span>Cluster: Local-Dev</span>
          </span>
          <span className="vault-env-sandbox-badge">
            <Code className="vault-badge-icon" />
            <span>Sandbox Mode</span>
          </span>
        </div>
      </div>

      {/* Development Stat Metrics */}
      <div className="vault-metrics-grid">
        <StatsCard
          icon={Plug}
          title="Active Mounts"
          value={`${engines.length} Engines`}
          badgeText="Healthy"
          badgeVariant="success"
        />
        <StatsCard
          icon={Zap}
          title="Live Secrets"
          value={`${secrets.length} Keys`}
          badgeText="Encrypted"
          badgeVariant="success"
        />
        <StatsCard
          icon={Lock}
          title="Dynamic Leases"
          value={`${dynamicLeasesCount} Active`}
          badgeText="Local"
          badgeVariant="muted"
        />
      </div>

      {/* Mounted Secret Engines Table */}
      <DataTable
        title="Mounted Secret Engines"
        data={engines}
        columns={engineColumns}
        showActionButton
        actionButtonLabel="Mount New Engine"
        actionButtonIcon={Plus}
        onAction={() => setIsMountModalOpen(true)}
      />

      {/* Secret Explorer Section */}
      <div className="vault-explorer-section">
        {/* Dynamic Breadcrumb Navigation Header */}
        <div className="vault-breadcrumb-bar">
          <span className="vault-breadcrumb-icon">📍</span>
          <span
            onClick={() => handleNavigateBreadcrumb(-1)}
            className="vault-breadcrumb-active"
          >
            {ROOT_ENGINE_PREFIX}
          </span>
          <span>/</span>

          {currentPath.map((seg, idx) => (
            <span key={idx} className="flex items-center gap-1">
              <span
                onClick={() => handleNavigateBreadcrumb(idx)}
                className={
                  idx === currentPath.length - 1
                    ? "vault-breadcrumb-item text-brand-primary"
                    : "vault-breadcrumb-active"
                }
              >
                {seg}
              </span>
              <span>/</span>
            </span>
          ))}
        </div>

        {/* Secret Tree Table */}
        <DataTable
          title={`Engine Explorer & Secret Tree ── ${ROOT_ENGINE_PREFIX}/${
            currentPath.length ? currentPath.join("/") + "/" : ""
          }`}
          data={treeItems}
          columns={treeColumns}
          showActionButton
          actionButtonLabel="Add Secret Path"
          actionButtonIcon={Plus}
          onAction={() => setIsAddPathModalOpen(true)}
        />
      </div>

      {/* Modals */}
      <MountEngineModal
        isOpen={isMountModalOpen}
        onClose={() => setIsMountModalOpen(false)}
        namespace={NAMESPACE}
        onMounted={handleMountedEngine}
      />

      <AddSecretPathModal
        isOpen={isAddPathModalOpen}
        onClose={() => setIsAddPathModalOpen(false)}
        namespace={NAMESPACE}
        currentPath={currentPath}
        onCreated={handleAddedPath}
      />

      <ViewSecretModal
        isOpen={Boolean(selectedSecretForView)}
        onClose={() => setSelectedSecretForView(null)}
        secret={selectedSecretForView}
        onRotate={(s) => runRotate(s.id)}
      />

      <SdkSnippetModal
        isOpen={Boolean(selectedSecretForSdk)}
        onClose={() => setSelectedSecretForSdk(null)}
        secret={selectedSecretForSdk}
      />
    </div>
  );
}
