// src/lib/vault/searchIndexService.js

import { queryClient } from "../api/query";
import { vaultMockService } from "./vaultMockService";
import { ROUTES } from "../../routes/routes";

export function getGlobalSearchItems() {
  const items = [];
  const namespaces = ["Production", "Staging", "Development"];

  // 1. Live Database Secrets per Namespace (from React Query cache if active, fallback to mock service)
  namespaces.forEach((ns) => {
    const route =
      ns === "Production"
        ? ROUTES.VAULT.PRODUCTION
        : ns === "Staging"
          ? ROUTES.VAULT.STAGING
          : ROUTES.VAULT.DEVELOPMENT;

    // Check React Query cache for live MongoDB secrets in this namespace
    const cachedData = queryClient.getQueryData(["vaultSecrets", ns]);
    const liveSecrets = cachedData?.secrets;

    const secrets =
      Array.isArray(liveSecrets) && liveSecrets.length > 0
        ? liveSecrets
        : vaultMockService.getSecrets(ns) || [];

    secrets.forEach((s) => {
      const secretId = s.id || s._id;
      items.push({
        id: `secret-${ns}-${secretId}`,
        title: s.name,
        subtitle: `${s.engine || "KV v2"} • ${s.type || "Static"} • v${s.version || 1} • ${s.ttl || "Infinite"}`,
        category: "Secrets",
        badge: ns,
        badgeVariant:
          ns === "Production"
            ? "danger"
            : ns === "Staging"
              ? "warning"
              : "muted",
        route,
        secretId,
        copyValue:
          s.value && s.value !== "••••••••••••••••••••••••"
            ? s.value
            : undefined,
        icon: "KeyRound",
      });
    });

    // Mounted engines for this namespace
    const engines = vaultMockService.getEngines(ns) || [];
    engines.forEach((e, idx) => {
      items.push({
        id: `engine-${ns}-${idx}`,
        title: e.path,
        subtitle: `${e.type} (${e.version}) • ${e.leasePolicy}`,
        category: "Engines",
        badge: ns,
        badgeVariant: "success",
        route,
        icon: "Folder",
      });
    });
  });

  // 2. Zero-Trust Access Grants & Policies
  const grants = vaultMockService.getGrants() || [];
  grants.forEach((g) => {
    items.push({
      id: `grant-${g.id}`,
      title: g.principal,
      subtitle: `${g.role} • ${g.authMethod} • CIDR: ${g.boundCidr}`,
      category: "Zero-Trust",
      badge: g.status,
      badgeVariant: g.status === "Active" ? "success" : "danger",
      route: ROUTES.ACCESS,
      icon: "ShieldCheck",
    });
  });

  const policies = vaultMockService.getPolicies() || [];
  policies.forEach((p) => {
    items.push({
      id: `policy-${p.id}`,
      title: p.name,
      subtitle: `Pattern: ${p.pathPattern} • MFA: ${p.mfaGate}`,
      category: "Zero-Trust",
      badge: p.riskScore,
      badgeVariant: p.riskLevel === "low" ? "success" : "warning",
      route: ROUTES.ACCESS,
      icon: "Lock",
    });
  });

  // 3. Machine Identities & WIF Gateways
  const workloads = vaultMockService.getWorkloadIdentities() || [];
  workloads.forEach((w) => {
    items.push({
      id: `workload-${w.id}`,
      title: w.workloadId,
      subtitle: `${w.authBackend} • ${w.spiffeId}`,
      category: "Identities",
      badge: w.status === "PASS" ? "Verified" : "Expiring",
      badgeVariant: w.status === "PASS" ? "success" : "warning",
      route: ROUTES.MACHINE_IDENTITIES,
      icon: "Cpu",
    });
  });

  const wifGateways = vaultMockService.getWifGateways() || [];
  wifGateways.forEach((gw) => {
    items.push({
      id: `wif-${gw.id}`,
      title: gw.providerName,
      subtitle: `${gw.tokenType} • ${gw.attestationEngine}`,
      category: "Identities",
      badge: `${gw.activeNhis} NHIs`,
      badgeVariant: "success",
      route: ROUTES.MACHINE_IDENTITIES,
      icon: "Layers",
    });
  });

  // 4. Compliance Audit Logs (Live Query Cache with fallback to mock store)
  const cachedAuditData = queryClient.getQueryData(["auditLogs"]);
  const liveAudit = cachedAuditData?.logs;
  const auditLogs =
    Array.isArray(liveAudit) && liveAudit.length > 0
      ? liveAudit
      : vaultMockService.getAuditLogs() || [];

  auditLogs.slice(0, 15).forEach((log) => {
    items.push({
      id: `audit-${log.id}`,
      title: `${log.event} (${log.targetPath})`,
      subtitle: `Principal: ${log.principal} • IP: ${log.clientIp} • ${log.timestamp}`,
      category: "Audit",
      badge: log.status,
      badgeVariant: log.status === "PASS" ? "success" : "danger",
      route: ROUTES.AUDIT_LOGS,
      icon: "FileCheck2",
    });
  });

  // 5. System Commands & Quick Navigation
  items.push(
    {
      id: "nav-overview",
      title: "Overview Dashboard",
      subtitle: "Global health telemetry, namespace selector, and metrics",
      category: "Actions",
      badge: "Nav",
      badgeVariant: "muted",
      route: ROUTES.HOME,
      icon: "LayoutGrid",
    },
    {
      id: "nav-prod-vault",
      title: "Production Vault",
      subtitle: "Jump to Production KV & Database engines",
      category: "Actions",
      badge: "Vault",
      badgeVariant: "danger",
      route: ROUTES.VAULT.PRODUCTION,
      icon: "KeyRound",
    },
    {
      id: "nav-stage-vault",
      title: "Staging Vault",
      subtitle: "Jump to Staging pre-production namespace",
      category: "Actions",
      badge: "Vault",
      badgeVariant: "warning",
      route: ROUTES.VAULT.STAGING,
      icon: "KeyRound",
    },
    {
      id: "nav-dev-vault",
      title: "Development Vault",
      subtitle: "Jump to Local development sandbox namespace",
      category: "Actions",
      badge: "Vault",
      badgeVariant: "muted",
      route: ROUTES.VAULT.DEVELOPMENT,
      icon: "KeyRound",
    },
    {
      id: "nav-access",
      title: "Zero-Trust Access Control",
      subtitle: "Manage identity grants, CIDR bounds, and ABAC policies",
      category: "Actions",
      badge: "Access",
      badgeVariant: "success",
      route: ROUTES.ACCESS,
      icon: "ShieldCheck",
    },
    {
      id: "nav-audit",
      title: "Compliance Audit Stream",
      subtitle: "View immutable SHA-256 HMAC cryptographic event ledger",
      category: "Actions",
      badge: "Compliance",
      badgeVariant: "success",
      route: ROUTES.AUDIT_LOGS,
      icon: "FileCheck2",
    },
    {
      id: "nav-identities",
      title: "Machine Identities & AppRoles",
      subtitle: "Manage SPIFFE/SPIRE workload attestations and WIF gateways",
      category: "Actions",
      badge: "IAM",
      badgeVariant: "success",
      route: ROUTES.MACHINE_IDENTITIES,
      icon: "Cpu",
    },
    {
      id: "nav-sys-engine",
      title: "System Engine & Cryptographic Barrier",
      subtitle: "Raft consensus, Shamir unseal threshold, master key rotation",
      category: "Actions",
      badge: "Core",
      badgeVariant: "muted",
      route: ROUTES.SYSTEM_ENGINE,
      icon: "Settings2",
    },
  );

  return items;
}
