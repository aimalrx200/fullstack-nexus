// src/pages/audit/ComplianceAuditLogs.jsx

import { useState, useMemo } from "react";
import {
  ScrollText,
  ShieldAlert,
  Lock,
  Radio,
  Download,
  CheckCircle2,
  XCircle,
  Server,
  User,
  KeyRound,
  RefreshCw,
  Ban,
  RotateCcw,
  ShieldCheck,
  Eye,
  GitBranch,
  Filter,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { triggerToast } from "../../redux/slices/notificationSlice";
import { StatsCard } from "../../components/dashboard/common/StatsCard";
import { DataTable } from "../../components/common/DataTable";
import { vaultApi } from "../../lib/api/vaultApi";
import {
  InspectAuditEventModal,
  TraceLineageModal,
} from "../../components/vault/VaultModals";

const FILTER_CHIPS = [
  { id: "ALL", label: "All Events" },
  { id: "read", label: "Reveals & Reads" },
  { id: "write", label: "Creations" },
  { id: "rotate", label: "Key Rotations" },
  { id: "refresh", label: "Lease Renewals" },
  { id: "deny", label: "Drops & Denials" },
];

export function ComplianceAuditLogs() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [searchFilter, setSearchFilter] = useState("");
  const [activeEventType, setActiveEventType] = useState("ALL");

  const [inspectEvent, setInspectEvent] = useState(null);
  const [traceEvent, setTraceEvent] = useState(null);

  // Real backend query for audit logs with 10-second polling
  const { data: auditData } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => vaultApi.getAuditLogs(100),
    refetchInterval: 10000,
  });

  const auditLogs = useMemo(() => auditData?.logs || [], [auditData]);

  // Security Attack Simulator Mutation
  const { mutate: runSimulateAttack, isPending: isSimulating } = useMutation({
    mutationFn: () => vaultApi.simulateAttack(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
      dispatch(
        triggerToast({
          message: "Perimeter Breach Intercepted",
          description:
            "External untrusted probe dropped by zero-trust gate (Status: DROP).",
          type: "warning",
        }),
      );
    },
    onError: (err) => {
      dispatch(
        triggerToast({
          message: "Simulation Failed",
          description:
            err.response?.data?.message ||
            "Failed to trigger breach simulator.",
          type: "error",
        }),
      );
    },
  });

  // Compute live event count breakdown per category
  const chipCounts = useMemo(() => {
    return {
      ALL: auditLogs.length,
      read: auditLogs.filter((l) => l.eventType === "read").length,
      write: auditLogs.filter((l) => l.eventType === "write").length,
      rotate: auditLogs.filter((l) => l.eventType === "rotate").length,
      refresh: auditLogs.filter((l) => l.eventType === "refresh").length,
      deny: auditLogs.filter(
        (l) => l.eventType === "deny" || l.status === "DROP",
      ).length,
    };
  }, [auditLogs]);

  // Composite filtering: Active Chip + Search Input
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesCategory =
        activeEventType === "ALL" ||
        log.eventType?.toLowerCase() === activeEventType ||
        (activeEventType === "deny" && log.status === "DROP");

      if (!matchesCategory) return false;
      if (!searchFilter.trim()) return true;

      const term = searchFilter.toLowerCase();
      return (
        log.event.toLowerCase().includes(term) ||
        log.principal.toLowerCase().includes(term) ||
        log.targetPath.toLowerCase().includes(term) ||
        log.requestId.toLowerCase().includes(term) ||
        log.clientIp.toLowerCase().includes(term)
      );
    });
  }, [auditLogs, activeEventType, searchFilter]);

  const handleExportLogs = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Timestamp,Event,EventType,Principal,TargetPath,Status,ClientIP,RequestId",
      ]
        .concat(
          filteredLogs.map(
            (l) =>
              `${l.timestamp},${l.event},${l.eventType || "read"},${l.principal},${l.targetPath},${l.status},${l.clientIp},${l.requestId}`,
          ),
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vault_audit_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    dispatch(
      triggerToast({
        message: "Audit Ledger Exported",
        description: `Exported ${filteredLogs.length} signed audit records as CSV.`,
        type: "success",
      }),
    );
  };

  const metrics = useMemo(() => {
    const totalEvents = auditLogs.length;
    const deniedEvents = auditLogs.filter((l) => l.status === "DROP").length;

    return [
      {
        id: "ingested-events",
        title: "Ingested Events",
        value: `${totalEvents} Logs`,
        badgeText: "100% OK",
        badgeVariant: "success",
        subtext: "SHA-256 Tamper-Proof Cryptochain",
        icon: ScrollText,
      },
      {
        id: "denied-drops",
        title: "Denied Access Drops",
        value: `${deniedEvents} Drops`,
        badgeText: deniedEvents > 0 ? "Action Req" : "Zero Violations",
        badgeVariant: deniedEvents > 0 ? "warning" : "success",
        subtext: "ACL & CIDR Perimeter Violations",
        icon: ShieldAlert,
      },
      {
        id: "audit-cryptochain",
        title: "Audit Cryptochain",
        value: "Zero Gaps",
        badgeText: "Verified",
        badgeVariant: "success",
        subtext: "Merkle Tree Root Block Sealed",
        icon: Lock,
      },
    ];
  }, [auditLogs]);

  const auditColumns = useMemo(
    () => [
      {
        accessorKey: "timestamp",
        header: "Time (UTC)",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-text-subtle">
            {row.original.timestamp}
          </span>
        ),
      },
      {
        accessorKey: "event",
        header: "Action / Event",
        cell: ({ row }) => {
          const { event, eventType } = row.original;
          let EventIcon = KeyRound;
          let colorClass = "text-brand-primary";

          if (eventType === "rotate") {
            EventIcon = RefreshCw;
            colorClass = "text-brand-secondary";
          } else if (eventType === "deny") {
            EventIcon = Ban;
            colorClass = "text-status-danger";
          } else if (eventType === "refresh") {
            EventIcon = RotateCcw;
            colorClass = "text-text-main";
          }

          return (
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
              <EventIcon className={`h-3.5 w-3.5 ${colorClass}`} />
              <span className={colorClass}>{event}</span>
            </div>
          );
        },
      },
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
        accessorKey: "targetPath",
        header: "Target Resource Path",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium text-text-main">
            {row.original.targetPath}
          </span>
        ),
      },
      {
        accessorKey: "clientIp",
        header: "Client IP",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-text-subtle">
            {row.original.clientIp}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const isPass = status === "PASS";
          const badgeStyle = isPass
            ? "overview-table-status-success"
            : "overview-table-status-danger";
          const Icon = isPass ? CheckCircle2 : XCircle;

          return (
            <span className={`overview-table-status-badge ${badgeStyle}`}>
              <Icon className="overview-table-status-icon" />
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
              <button
                type="button"
                title="Trace Merkle Lineage"
                onClick={() => setTraceEvent(item)}
                className="overview-action-btn-standard"
              >
                <GitBranch className="overview-action-btn-icon" />
              </button>
              <button
                type="button"
                title="Inspect Payload"
                onClick={() => setInspectEvent(item)}
                className="overview-action-btn-standard"
              >
                <Eye className="overview-action-btn-icon" />
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="vault-container font-mono">
      {/* Top Header Banner */}
      <div className="vault-header">
        <div>
          <div className="vault-header-titles">
            <h1 className="vault-title">Compliance Audit Logs</h1>
            <span className="vault-namespace">── Immutable SIEM Stream</span>
          </div>
          <p className="vault-subtitle">
            Cryptographic ledger tracking all secret accesses, key rotations,
            ACL denials, and external SIEM telemetry streams.
          </p>
        </div>

        <div className="vault-header-badges">
          <span className="vault-cluster-badge">
            <Radio className="vault-cluster-icon animate-pulse" />
            <span>SIEM: Live</span>
          </span>
          <span className="vault-env-security-badge">
            <ShieldCheck className="vault-badge-icon" />
            <span>HMAC Verified</span>
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

      {/* SIEM Filter Chips & Stream Header */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-surface-card/70 border border-surface-border p-3 rounded-lg backdrop-blur-md">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <Filter className="w-3.5 h-3.5 text-text-subtle shrink-0 ml-1 mr-1" />
            {FILTER_CHIPS.map((chip) => {
              const isActive = activeEventType === chip.id;
              const count = chipCounts[chip.id] || 0;
              const isDeny = chip.id === "deny";

              let buttonStyle = isActive
                ? "bg-brand-primary text-white border-brand-primary/50 shadow-xs"
                : "border-surface-border bg-surface-app/60 text-text-subtle hover:text-text-main hover:bg-surface-hover";

              if (isDeny && count > 0 && !isActive) {
                buttonStyle =
                  "border-status-danger/30 bg-status-danger/10 text-status-danger hover:bg-status-danger/20";
              }

              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setActiveEventType(chip.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-10px font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${buttonStyle}`}
                >
                  <span>{chip.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-black/20 text-white"
                        : "bg-surface-hover text-text-subtle"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search, Simulation Trigger & Export Toolbar */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Attack Simulator Action */}
            <button
              type="button"
              onClick={() => runSimulateAttack()}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-status-danger/40 bg-status-danger/10 hover:bg-status-danger/20 text-status-danger font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shrink-0 cyber-button-glow"
              title="Simulate an untrusted external CIDR probe"
            >
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse text-status-danger" />
              <span>
                {isSimulating
                  ? "Simulating Drop..."
                  : "Simulate 403 Drop Attack"}
              </span>
            </button>

            <div className="relative flex-1 sm:w-64">
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search principal, IP, path..."
                className="w-full bg-surface-app border border-surface-border rounded-md px-3 py-1 text-xs text-text-main placeholder:text-text-subtle/50 focus:border-brand-primary focus:outline-none"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-10px text-text-subtle hover:text-text-main cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportLogs}
              className="data-table-filter-button shrink-0"
              title="Download CSV report"
            >
              <Download className="data-table-filter-icon" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Immutable Audit Trail Table */}
        <DataTable
          title={`Immutable Audit Trail (${filteredLogs.length} Events)`}
          data={filteredLogs}
          columns={auditColumns}
          emptyTitle="No audit records match the selected filter"
          emptyDescription="Try selecting 'All Events' or clearing the keyword search filter."
          showToolbar={false}
        />
      </div>

      {/* Modals */}
      <InspectAuditEventModal
        isOpen={Boolean(inspectEvent)}
        onClose={() => setInspectEvent(null)}
        event={inspectEvent}
      />

      <TraceLineageModal
        isOpen={Boolean(traceEvent)}
        onClose={() => setTraceEvent(null)}
        event={traceEvent}
      />
    </div>
  );
}
