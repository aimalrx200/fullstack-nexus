// src/pages/overview/OverviewPage.jsx

import { useState, useMemo, useCallback } from "react";
import {
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Lock,
  RefreshCw,
  Clock,
  Ban,
  ScrollText,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Terminal,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { triggerToast } from "../../redux/slices/notificationSlice";
import { StatsCard } from "../../components/dashboard/common/StatsCard";
import { DataTable } from "../../components/common/DataTable";
import { QuickActions } from "../../components/dashboard/overview/QuickActions";
import { vaultApi } from "../../lib/api/vaultApi";
import {
  IssueSecretModal,
  DynamicCredModal,
  SdkSnippetModal,
} from "../../components/vault/VaultModals";

export function OverviewPage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [selectedNamespace, setSelectedNamespace] = useState(
    () => localStorage.getItem("kv_default_namespace") || "Production",
  );

  const [revealedValues, setRevealedValues] = useState({});
  const [revealingIds, setRevealingIds] = useState({});
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isDynamicModalOpen, setIsDynamicModalOpen] = useState(false);
  const [selectedSecretForSdk, setSelectedSecretForSdk] = useState(null);

  const namespaces = ["Production", "Staging", "Development"];

  // 1. Real Backend Query for Secrets in Selected Namespace
  const { data: vaultData } = useQuery({
    queryKey: ["vaultSecrets", selectedNamespace],
    queryFn: () => vaultApi.getSecrets(selectedNamespace),
  });

  const secretsData = useMemo(() => vaultData?.secrets || [], [vaultData]);

  // 2. Real Backend Mutation: Decrypt & Reveal
  const { mutate: runReveal } = useMutation({
    mutationFn: (id) => vaultApi.revealSecret(id),
    onMutate: (id) => {
      setRevealingIds((prev) => ({ ...prev, [id]: true }));
    },
    onSuccess: (data, id) => {
      setRevealedValues((prev) => ({ ...prev, [id]: data.value }));
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
    },
    onError: (err) => {
      dispatch(
        triggerToast({
          message: "Decryption Failed",
          description:
            err.response?.data?.message || "Failed to decrypt secret.",
          type: "error",
        }),
      );
    },
    onSettled: (data, error, id) => {
      setRevealingIds((prev) => ({ ...prev, [id]: false }));
    },
  });

  // 3. Real Backend Mutations: Rotate, Renew, Revoke, Delete, Create
  const { mutate: runRotate } = useMutation({
    mutationFn: (id) => vaultApi.rotateSecret({ id }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vaultSecrets"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
      dispatch(
        triggerToast({
          message: "Key Rotated",
          description: data.message || "Updated to a new version hash.",
          type: "success",
        }),
      );
    },
  });

  const { mutate: runRenew } = useMutation({
    mutationFn: (id) => vaultApi.renewLease(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vaultSecrets"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
      dispatch(
        triggerToast({
          message: "Lease Renewed",
          description: data.message || "Lease extended.",
          type: "success",
        }),
      );
    },
  });

  const { mutate: runRevoke } = useMutation({
    mutationFn: (id) => vaultApi.revokeLease(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vaultSecrets"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
      dispatch(
        triggerToast({
          message: "Lease Revoked",
          description: data.message || "Lease revoked.",
          type: "warning",
        }),
      );
    },
  });

  const { mutate: runDelete } = useMutation({
    mutationFn: (id) => vaultApi.deleteSecret(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vaultSecrets"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
      dispatch(
        triggerToast({
          message: "Secret Removed",
          description: data.message || "Secret deleted permanently.",
          type: "info",
        }),
      );
    },
  });

  const { mutateAsync: runCreateAsync } = useMutation({
    mutationFn: (payload) => vaultApi.createSecret(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vaultSecrets"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
      dispatch(
        triggerToast({
          message: "Secret Created",
          description: data.message || "Encrypted and stored in vault.",
          type: "success",
        }),
      );
    },
  });

  const toggleReveal = useCallback(
    (id) => {
      if (revealedValues[id]) {
        setRevealedValues((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      } else {
        runReveal(id);
      }
    },
    [revealedValues, runReveal],
  );

  const handleCopySecret = useCallback(
    async (secret) => {
      let textToCopy = revealedValues[secret.id];

      if (!textToCopy) {
        try {
          const res = await vaultApi.revealSecret(secret.id);
          textToCopy = res.value;
          queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
        } catch {
          dispatch(
            triggerToast({
              message: "Copy Failed",
              description: "Could not decrypt secret to copy.",
              type: "error",
            }),
          );
          return;
        }
      }

      navigator.clipboard.writeText(textToCopy);
      const ttl = parseInt(
        localStorage.getItem("kv_clipboard_ttl") || "30",
        10,
      );

      dispatch(
        triggerToast({
          message: "Secret Copied",
          description:
            ttl > 0 ? `Auto-clearing in ${ttl}s.` : "Copied to clipboard.",
          type: "success",
        }),
      );

      if (ttl > 0) {
        setTimeout(() => {
          navigator.clipboard.writeText("");
        }, ttl * 1000);
      }
    },
    [revealedValues, queryClient, dispatch],
  );

  const overviewMetrics = useMemo(() => {
    const totalCount = secretsData.length;
    const expiringCount = secretsData.filter(
      (s) => s.status === "Expiring",
    ).length;

    return [
      {
        id: "active-secrets",
        title: "Active Secrets",
        value: `${totalCount} Keys`,
        badgeText: "Online",
        badgeVariant: "success",
        subtext: `${selectedNamespace} Namespace`,
        icon: KeyRound,
      },
      {
        id: "expiring-leases",
        title: "Expiring Leases",
        value: `${expiringCount} Leases`,
        badgeText: expiringCount > 0 ? "Action Req" : "Healthy",
        badgeVariant: expiringCount > 0 ? "warning" : "success",
        subtext: "Dynamic DB & Zero Trust keys",
        icon: AlertCircle,
      },
      {
        id: "audit-trail",
        title: "Audit Trail (24H)",
        value: "Active",
        badgeText: "Encrypted",
        badgeVariant: "muted",
        subtext: "AES-256-GCM sealed",
        icon: ScrollText,
      },
    ];
  }, [secretsData, selectedNamespace]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Secret Identifier",
        cell: ({ row }) => {
          const item = row.original;
          const isRevealed = Boolean(revealedValues[item.id]);
          const isDecrypting = Boolean(revealingIds[item.id]);

          return (
            <div className="flex flex-col gap-1">
              <div className="overview-table-secret-cell">
                <KeyRound className="overview-table-secret-icon" />
                <span
                  onClick={() => handleCopySecret(item)}
                  title="Click to decrypt and copy value"
                  className="overview-table-secret-name hover:underline"
                >
                  {item.name}
                </span>
                <button
                  type="button"
                  onClick={() => toggleReveal(item.id)}
                  disabled={isDecrypting}
                  className="text-text-subtle hover:text-brand-primary p-0.5 cursor-pointer disabled:opacity-50"
                  title={isRevealed ? "Mask Secret" : "Decrypt & Reveal"}
                >
                  {isDecrypting ? (
                    <span className="w-3 h-3 block border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  ) : isRevealed ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </button>
              </div>
              <span className="font-mono text-10px text-text-subtle/80 pl-5">
                {isRevealed ? revealedValues[item.id] : item.value}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "engine",
        header: "Engine",
        cell: ({ row }) => (
          <span className="overview-table-engine-cell">
            {row.original.engine}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className="overview-table-type-cell">{row.original.type}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const isExpiring = status === "Expiring";
          const isRevoked = status === "Revoked";
          const badgeStyle = isRevoked
            ? "overview-table-status-danger"
            : isExpiring
              ? "overview-table-status-warning"
              : "overview-table-status-success";
          const Icon = isRevoked
            ? AlertCircle
            : isExpiring
              ? AlertCircle
              : ShieldCheck;

          return (
            <span className={`overview-table-status-badge ${badgeStyle}`}>
              <Icon className="overview-table-status-icon" />
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "ttl",
        header: "TTL Lease",
        cell: ({ row }) => (
          <span className="overview-table-ttl-cell">{row.original.ttl}</span>
        ),
      },
      {
        id: "actions",
        header: () => (
          <span className="overview-table-actions-header">Actions</span>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const actions = item.allowedActions || [];

          return (
            <div className="overview-table-actions-group">
              {/* SDK Snippet Trigger */}
              <button
                type="button"
                title="View SDK Integration Snippet"
                onClick={() => setSelectedSecretForSdk(item)}
                className="overview-action-btn-standard text-brand-secondary hover:text-brand-secondary hover:border-brand-secondary/50"
              >
                <Terminal className="overview-action-btn-icon" />
              </button>

              {actions.includes("rotate") && (
                <button
                  type="button"
                  title="Rotate Secret Version"
                  onClick={() => runRotate(item.id)}
                  className="overview-action-btn-standard"
                >
                  <RefreshCw className="overview-action-btn-icon" />
                </button>
              )}

              {actions.includes("renew") && (
                <button
                  type="button"
                  title="Renew Lease"
                  onClick={() => runRenew(item.id)}
                  className="overview-action-btn-warning"
                >
                  <Clock className="overview-action-btn-icon" />
                </button>
              )}

              {actions.includes("revoke") && item.status !== "Revoked" && (
                <button
                  type="button"
                  title="Revoke Lease"
                  onClick={() => runRevoke(item.id)}
                  className="overview-action-btn-danger"
                >
                  <Ban className="overview-action-btn-icon" />
                </button>
              )}

              <button
                type="button"
                title="Copy Decrypted Value"
                onClick={() => handleCopySecret(item)}
                className="overview-action-btn-standard"
              >
                <Copy className="overview-action-btn-icon" />
              </button>

              <button
                type="button"
                title="Delete Secret"
                onClick={() => runDelete(item.id)}
                className="overview-action-btn-danger"
              >
                <Trash2 className="overview-action-btn-icon" />
              </button>
            </div>
          );
        },
      },
    ],
    [
      revealedValues,
      revealingIds,
      handleCopySecret,
      toggleReveal,
      runRotate,
      runRenew,
      runRevoke,
      runDelete,
    ],
  );

  return (
    <div className="overview-page-container font-mono">
      {/* Header & Metrics */}
      <section className="overview-header-section">
        <div className="overview-header-bar">
          <div className="overview-header-title-group">
            <h1 className="overview-header-title">Environment Overview</h1>
            <span className="overview-header-namespace-label">
              ── {selectedNamespace} Namespace
            </span>
          </div>

          <div className="overview-namespace-wrapper">
            <div className="overview-namespace-selector-box">
              <Lock className="overview-namespace-icon" />
              <select
                value={selectedNamespace}
                onChange={(e) => setSelectedNamespace(e.target.value)}
                className="overview-namespace-select"
              >
                {namespaces.map((ns) => (
                  <option
                    key={ns}
                    value={ns}
                    className="overview-namespace-option"
                  >
                    {ns}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="overview-metrics-grid">
          {overviewMetrics.map((metric) => (
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
      </section>

      {/* Secret Leases Table */}
      <DataTable
        title={`Encrypted Secret Leases // ${selectedNamespace}`}
        data={secretsData}
        columns={columns}
        showActionButton
        actionButtonLabel="Issue Secret"
        onAction={() => setIsIssueModalOpen(true)}
      />

      {/* Quick Actions */}
      <QuickActions
        onIssueSecret={() => setIsIssueModalOpen(true)}
        onDynamicCred={() => setIsDynamicModalOpen(true)}
      />

      {/* Modals with Async Handlers */}
      <IssueSecretModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        namespace={selectedNamespace}
        onCreated={(payload) =>
          runCreateAsync({ ...payload, namespace: selectedNamespace })
        }
      />

      <DynamicCredModal
        isOpen={isDynamicModalOpen}
        onClose={() => setIsDynamicModalOpen(false)}
        namespace={selectedNamespace}
        onCreated={(payload) =>
          runCreateAsync({ ...payload, namespace: selectedNamespace })
        }
      />

      {/* SDK Snippet Modal */}
      <SdkSnippetModal
        isOpen={Boolean(selectedSecretForSdk)}
        onClose={() => setSelectedSecretForSdk(null)}
        secret={selectedSecretForSdk}
      />
    </div>
  );
}
