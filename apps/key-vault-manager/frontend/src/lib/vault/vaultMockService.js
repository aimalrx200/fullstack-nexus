// src/lib/vault/vaultMockService.js

const STORAGE_KEY_SECRETS = "kv_mock_secrets_store";
const STORAGE_KEY_ENGINES = "kv_mock_engines_store";
const STORAGE_KEY_TREES = "kv_mock_trees_store";
const STORAGE_KEY_GRANTS = "kv_mock_grants_store";
const STORAGE_KEY_POLICIES = "kv_mock_policies_store";
const STORAGE_KEY_NHIS = "kv_mock_nhis_store";
const STORAGE_KEY_WIFS = "kv_mock_wifs_store";
const STORAGE_KEY_SYSTEM = "kv_mock_system_store";
const STORAGE_KEY_AUDIT_LOGS = "kv_mock_audit_logs_store";
const STORAGE_KEY_SIEM_SINKS = "kv_mock_siem_sinks_store";

// ============================================================================
// 1. DEFAULT MOCK DATASETS
// ============================================================================

const DEFAULT_SECRETS = {
  Production: [
    {
      id: "sec-prod-1",
      name: "DATABASE_PRODUCTION_URL",
      engine: "KV v2",
      type: "Static",
      value:
        "postgres://vault_admin:k8s_pr0d_99a!@db.internal.net:5432/primary",
      status: "Active",
      ttl: "Infinite",
      allowedActions: ["rotate", "sdk"],
    },
    {
      id: "sec-prod-2",
      name: "POSTGRES_EPHEMERAL_POOL",
      engine: "PostgreSQL",
      type: "Dynamic",
      value: "usr:v_app_8f102 | psk:pass_c98f12a0e719",
      status: "Expiring",
      ttl: "45m remaining",
      allowedActions: ["renew", "revoke", "sdk"],
    },
    {
      id: "sec-prod-3",
      name: "PKI_ROOT_CA_CERTIFICATE",
      engine: "PKI",
      type: "Certificate",
      value:
        "-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAL9F...\n-----END CERTIFICATE-----",
      status: "Active",
      ttl: "364d remaining",
      allowedActions: ["download", "sdk"],
    },
    {
      id: "sec-prod-4",
      name: "STRIPE_PRODUCTION_SECRET_KEY",
      engine: "KV v2",
      type: "Static",
      value: "mock_stripe_secret_key_sample_9842048fj",
      status: "Active",
      ttl: "Infinite",
      allowedActions: ["rotate", "sdk"],
    },
  ],
  Staging: [
    {
      id: "sec-stg-1",
      name: "STAGING_DATABASE_URL",
      engine: "KV v2",
      type: "Static",
      value:
        "postgres://stage_usr:stg_p@ss_123@stg-db.internal:5432/staging_db",
      status: "Active",
      ttl: "Infinite",
      allowedActions: ["rotate", "sdk"],
    },
    {
      id: "sec-stg-2",
      name: "POSTGRES_STAGE_LEASE",
      engine: "PostgreSQL",
      type: "Dynamic",
      value: "usr:v_stage_4a2 | psk:stg_dyn_9901ba",
      status: "Active",
      ttl: "1h 45m remaining",
      allowedActions: ["renew", "revoke", "sdk"],
    },
  ],
  Development: [
    {
      id: "sec-dev-1",
      name: "DEV_LOCAL_POSTGRES_URL",
      engine: "KV v2",
      type: "Static",
      value: "postgres://postgres:postgres@localhost:5432/vault_dev",
      status: "Active",
      ttl: "Infinite",
      allowedActions: ["rotate", "sdk"],
    },
  ],
};

const DEFAULT_ENGINES = {
  Production: [
    {
      id: "eng-prod-1",
      path: "kv-prod/",
      type: "KV v2",
      version: "v2.1",
      leasePolicy: "30d Max TTL",
      activeSecrets: "142 Secrets",
      health: "OK",
    },
    {
      id: "eng-prod-2",
      path: "postgres-prod/",
      type: "PostgreSQL",
      version: "v1.4",
      leasePolicy: "1h Max TTL",
      activeSecrets: "12 Leases",
      health: "OK",
    },
    {
      id: "eng-prod-3",
      path: "pki-root/",
      type: "PKI Certs",
      version: "v1.0",
      leasePolicy: "365d Max TTL",
      activeSecrets: "8 Certs",
      health: "Warn",
    },
    {
      id: "eng-prod-4",
      path: "aws-iam-prod/",
      type: "AWS STS",
      version: "v2.0",
      leasePolicy: "12h Max TTL",
      activeSecrets: "3 Active STS",
      health: "OK",
    },
  ],
  Staging: [
    {
      id: "eng-stg-1",
      path: "kv-stage/",
      type: "KV v2",
      version: "v2.1",
      leasePolicy: "7d Max TTL",
      activeSecrets: "64 Secrets",
      health: "OK",
    },
    {
      id: "eng-stg-2",
      path: "postgres-stg/",
      type: "PostgreSQL",
      version: "v1.4",
      leasePolicy: "2h Max TTL",
      activeSecrets: "8 Leases",
      health: "OK",
    },
  ],
  Development: [
    {
      id: "eng-dev-1",
      path: "kv-dev/",
      type: "KV v2",
      version: "v2.1",
      leasePolicy: "24h Max TTL",
      activeSecrets: "42 Secrets",
      health: "OK",
    },
  ],
};

const DEFAULT_TREES = {
  Production: {
    items: [
      {
        id: "prod-tree-1",
        isFolder: true,
        name: "database",
        engineMode: "Static KV",
        lastUpdated: "2 hours ago",
        items: [
          {
            id: "prod-tree-1-1",
            isFolder: false,
            name: "DB_PRIMARY_PASSWORD",
            engineMode: "v4 (Secret)",
            value: "super_secret_pg_master_pass_9901!",
            lastUpdated: "10 mins ago",
          },
        ],
      },
      {
        id: "prod-tree-3",
        isFolder: false,
        name: "API_ENCRYPTION_KEY",
        engineMode: "v3 (Secret)",
        value: "0x8f10289ab7492c810d7a049102cba09e7",
        lastUpdated: "3 mins ago",
      },
    ],
  },
  Staging: { items: [] },
  Development: { items: [] },
};

const DEFAULT_GRANTS = [
  {
    id: "grant-001",
    principal: "srv-k8s-ingress",
    principalType: "machine",
    role: "Vault-Admin",
    authMethod: "mTLS Cert",
    boundCidr: "10.240.0.0/16",
    leaseRemaining: "2h 15m left",
    status: "Active",
  },
  {
    id: "grant-002",
    principal: "dev-lead@org.io",
    principalType: "user",
    role: "Secret-Write",
    authMethod: "WebAuthn / FIDO2",
    boundCidr: "192.168.1.45",
    leaseRemaining: "45m left",
    status: "Active",
  },
  {
    id: "grant-003",
    principal: "ci-cd-runner-04",
    principalType: "machine",
    role: "Dynamic-DB-RO",
    authMethod: "OIDC Token",
    boundCidr: "172.16.12.8",
    leaseRemaining: "12m left",
    status: "Expiring",
  },
  {
    id: "grant-004",
    principal: "sec-auditor@org",
    principalType: "user",
    role: "KV-ReadOnly",
    authMethod: "mTLS Cert",
    boundCidr: "10.0.4.120",
    leaseRemaining: "Expired",
    status: "Blocked",
  },
];

const DEFAULT_POLICIES = [
  {
    id: "pol-001",
    name: "pki-admin-strict",
    pathPattern: "sys/pki/issue/root-ca",
    mfaGate: "FIDO2 / Hardware",
    riskScore: "Low (0.0)",
    riskLevel: "low",
  },
  {
    id: "pol-002",
    name: "prod-db-ephemeral",
    pathPattern: "postgres-prod/creds/*",
    mfaGate: "mTLS + Step-Up",
    riskScore: "Low (0.1)",
    riskLevel: "low",
  },
  {
    id: "pol-003",
    name: "transit-decrypt",
    pathPattern: "transit-prod/decrypt/*",
    mfaGate: "Geo-Fence Bound",
    riskScore: "Med (0.6)",
    riskLevel: "medium",
  },
];

const DEFAULT_NHIS = [
  {
    id: "nhi-001",
    workloadId: "srv-auth-api",
    authBackend: "K8s SA Auth",
    backendType: "k8s",
    spiffeId: "spiffe://prod/api",
    boundScope: "kv-prod/auth-api/*",
    status: "PASS",
  },
  {
    id: "nhi-002",
    workloadId: "db-migrator",
    authBackend: "Vault AppRole",
    backendType: "approle",
    spiffeId: "spiffe://prod/db",
    boundScope: "postgres-prod/creds/*",
    status: "PASS",
  },
  {
    id: "nhi-003",
    workloadId: "telemetry-01",
    authBackend: "AWS IAM STS",
    backendType: "aws",
    spiffeId: "role/telemetry-sa",
    boundScope: "transit-prod/encrypt/*",
    status: "EXP",
  },
  {
    id: "nhi-004",
    workloadId: "legacy-batch",
    authBackend: "Static Token",
    backendType: "static",
    spiffeId: "legacy/batch-node",
    boundScope: "kv-stage/legacy/*",
    status: "REV",
  },
];

const DEFAULT_WIFS = [
  {
    id: "wif-001",
    providerName: "K8s Cluster (EKS)",
    providerType: "k8s",
    tokenType: "OIDC JWT (v1.30)",
    activeNhis: "64 Active",
    attestationEngine: "TPM 2.0 / Pod Spec",
    health: "SYNC",
  },
  {
    id: "wif-002",
    providerName: "SPIRE Server Node",
    providerType: "spire",
    tokenType: "X.509 SVID (mTLS)",
    activeNhis: "42 Active",
    attestationEngine: "Node Attestor (x509)",
    health: "SYNC",
  },
  {
    id: "wif-003",
    providerName: "AWS IAM OIDC WIF",
    providerType: "aws",
    tokenType: "AWS STS AssumeRole",
    activeNhis: "22 Active",
    attestationEngine: "AWS CloudTrail Trust",
    health: "SYNC",
  },
];

const DEFAULT_SYSTEM = {
  isSealed: false,
  shamirShares: "3 / 5 Shares",
  raftNodes: [
    {
      id: "node-01",
      nodeId: "node-east-01",
      role: "Leader",
      roleType: "leader",
      clusterAddress: "10.240.0.1:8201",
      commitIndex: "Term 14 (Idx: 82,109)",
      latency: "<0.4ms",
      latencyLevel: "low",
    },
    {
      id: "node-02",
      nodeId: "node-east-02",
      role: "Follower",
      roleType: "follower",
      clusterAddress: "10.240.0.2:8201",
      commitIndex: "Term 14 (Idx: 82,109)",
      latency: "1.1ms",
      latencyLevel: "low",
    },
    {
      id: "node-03",
      nodeId: "node-west-01",
      role: "Follower",
      roleType: "follower",
      clusterAddress: "10.240.1.1:8201",
      commitIndex: "Term 14 (Idx: 82,108)",
      latency: "1.8ms",
      latencyLevel: "low",
    },
    {
      id: "node-04",
      nodeId: "node-dr-01",
      role: "Non-Voter",
      roleType: "non-voter",
      clusterAddress: "10.240.9.1:8201",
      commitIndex: "Term 14 (Idx: 82,094)",
      latency: "14ms",
      latencyLevel: "warn",
    },
  ],
  cryptoEngines: [
    {
      id: "eng-001",
      name: "Barrier Encryption",
      engineType: "barrier",
      algorithm: "AES-256-GCM (AEAD)",
      version: "v4 Active",
      hardware: "Intel AES-NI (HW)",
      health: "PASS",
    },
    {
      id: "eng-002",
      name: "Shamir Unseal Mesh",
      engineType: "shamir",
      algorithm: "PKCS#11 / AWS-KMS",
      version: "3/5 Quorum",
      hardware: "CloudHSM (FIPS140-3)",
      health: "PASS",
    },
    {
      id: "eng-003",
      name: "Transit Crypt Engine",
      engineType: "transit",
      algorithm: "ChaCha20-Poly1305",
      version: "v2 Active",
      hardware: "AVX-512 SIMD Vector",
      health: "PASS",
    },
  ],
};

const DEFAULT_AUDIT_LOGS = [
  {
    id: "evt-001",
    timestamp: "12:44:02.109",
    event: "READ_SECRET",
    eventType: "read",
    principal: "srv-k8s-ingress",
    principalType: "machine",
    targetPath: "kv-prod/database/url",
    clientIp: "10.240.0.12",
    status: "PASS",
    requestId: "req_8f1a20c9",
    merkleRoot: "0x7f20a918e9a2b841...",
  },
  {
    id: "evt-002",
    timestamp: "12:43:55.882",
    event: "ROTATE_KEY",
    eventType: "rotate",
    principal: "dev-lead@org.io",
    principalType: "user",
    targetPath: "postgres-prod/creds/*",
    clientIp: "192.168.1.45",
    status: "PASS",
    requestId: "req_3d99b2e1",
    merkleRoot: "0x12c98bfa78092a11...",
  },
  {
    id: "evt-003",
    timestamp: "12:41:10.404",
    event: "ACL_DENIAL",
    eventType: "deny",
    principal: "sec-auditor@org",
    principalType: "user",
    targetPath: "sys/pki/issue/root-ca",
    clientIp: "10.0.4.120",
    status: "DROP",
    requestId: "req_7c00e118",
    merkleRoot: "0x98bb77a11029e843...",
  },
  {
    id: "evt-004",
    timestamp: "12:38:22.915",
    event: "TOKEN_REFRESH",
    eventType: "refresh",
    principal: "ci-cd-runner-04",
    principalType: "machine",
    targetPath: "auth/token/family_8b2f",
    clientIp: "172.16.12.8",
    status: "PASS",
    requestId: "req_99a341dc",
    merkleRoot: "0x44fa90b2289c0919...",
  },
];

const DEFAULT_SIEM_SINKS = [
  {
    id: "sink-001",
    name: "Splunk Cloud HEC",
    sinkType: "splunk",
    protocol: "HTTPS / JSON (mTLS)",
    rate: "1,420 eps",
    compliance: "SOC2 Type II (WORM)",
    status: "SYNC",
  },
  {
    id: "sink-002",
    name: "AWS S3 ObjectLock",
    sinkType: "s3",
    protocol: "Parquet / Batch (5m)",
    rate: "480 eps",
    compliance: "ISO 27001 / HIPAA",
    status: "SEAL",
  },
  {
    id: "sink-003",
    name: "Datadog SIEM Sink",
    sinkType: "datadog",
    protocol: "Syslog TLS (RFC5424)",
    rate: "850 eps",
    compliance: "FedRAMP Moderate",
    status: "SYNC",
  },
];

// ============================================================================
// 2. STORAGE HELPERS
// ============================================================================

function loadStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to persist ${key} in localStorage:`, err);
  }
}

// ============================================================================
// 3. UNIFIED VAULT MOCK SERVICE SINGLETON
// ============================================================================

class VaultMockService {
  constructor() {
    this.secretsStore = loadStorage(STORAGE_KEY_SECRETS, DEFAULT_SECRETS);
    this.enginesStore = loadStorage(STORAGE_KEY_ENGINES, DEFAULT_ENGINES);
    this.treesStore = loadStorage(STORAGE_KEY_TREES, DEFAULT_TREES);
    this.grantsStore = loadStorage(STORAGE_KEY_GRANTS, DEFAULT_GRANTS);
    this.policiesStore = loadStorage(STORAGE_KEY_POLICIES, DEFAULT_POLICIES);
    this.nhisStore = loadStorage(STORAGE_KEY_NHIS, DEFAULT_NHIS);
    this.wifsStore = loadStorage(STORAGE_KEY_WIFS, DEFAULT_WIFS);
    this.systemStore = loadStorage(STORAGE_KEY_SYSTEM, DEFAULT_SYSTEM);
    this.auditLogsStore = loadStorage(
      STORAGE_KEY_AUDIT_LOGS,
      DEFAULT_AUDIT_LOGS,
    );
    this.siemSinksStore = loadStorage(
      STORAGE_KEY_SIEM_SINKS,
      DEFAULT_SIEM_SINKS,
    );

    this.listeners = new Set();
  }

  // Event Subscription
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- AUTOMATED AUDIT TRAIL LOGGING ---

  logAuditEvent({
    event,
    eventType = "write",
    principal = "operator@vault.io",
    principalType = "user",
    targetPath = "sys/vault",
    status = "PASS",
  }) {
    const d = new Date();
    const timestamp = `${d.toTimeString().split(" ")[0]}.${String(d.getMilliseconds()).padStart(3, "0")}`;
    const requestId = `req_${Math.random().toString(36).substring(2, 10)}`;
    const merkleRoot = `0x${Math.random().toString(16).substring(2, 18)}...`;

    const newLog = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp,
      event,
      eventType,
      principal,
      principalType,
      targetPath,
      clientIp: "10.240.0." + Math.floor(Math.random() * 250 + 2),
      status,
      requestId,
      merkleRoot,
    };

    this.auditLogsStore = [newLog, ...this.auditLogsStore.slice(0, 199)]; // Cap at 200 logs
    saveStorage(STORAGE_KEY_AUDIT_LOGS, this.auditLogsStore);
    this.notify();
    return newLog;
  }

  // --- SECRETS & ENGINES ---

  getSecrets(namespace = "Production") {
    return this.secretsStore[namespace] || [];
  }

  createSecret(namespace = "Production", newSecret) {
    const list = this.getSecrets(namespace);
    const item = {
      id: `sec-${Date.now()}`,
      allowedActions: ["rotate", "sdk"],
      status: "Active",
      ...newSecret,
    };
    this.secretsStore[namespace] = [item, ...list];
    saveStorage(STORAGE_KEY_SECRETS, this.secretsStore);

    this.logAuditEvent({
      event: "CREATE_SECRET",
      eventType: "write",
      targetPath: `${namespace.toLowerCase()}/${newSecret.name}`,
    });

    this.notify();
    return item;
  }

  rotateSecret(namespace = "Production", id) {
    const list = this.getSecrets(namespace);
    let targetName = "secret";
    this.secretsStore[namespace] = list.map((s) => {
      if (s.id === id) {
        targetName = s.name;
        return {
          ...s,
          value: `rot_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`,
          ttl: s.ttl === "Infinite" ? "Infinite" : "Extended (24h)",
          status: "Active",
        };
      }
      return s;
    });
    saveStorage(STORAGE_KEY_SECRETS, this.secretsStore);

    this.logAuditEvent({
      event: "ROTATE_KEY",
      eventType: "rotate",
      targetPath: `${namespace.toLowerCase()}/${targetName}`,
    });

    this.notify();
  }

  renewLease(namespace = "Production", id) {
    const list = this.getSecrets(namespace);
    let targetName = "lease";
    this.secretsStore[namespace] = list.map((s) => {
      if (s.id === id) {
        targetName = s.name;
        return { ...s, ttl: "24h remaining", status: "Active" };
      }
      return s;
    });
    saveStorage(STORAGE_KEY_SECRETS, this.secretsStore);

    this.logAuditEvent({
      event: "RENEW_LEASE",
      eventType: "refresh",
      targetPath: `${namespace.toLowerCase()}/${targetName}`,
    });

    this.notify();
  }

  revokeLease(namespace = "Production", id) {
    const list = this.getSecrets(namespace);
    const target = list.find((s) => s.id === id);
    this.secretsStore[namespace] = list.filter((s) => s.id !== id);
    saveStorage(STORAGE_KEY_SECRETS, this.secretsStore);

    this.logAuditEvent({
      event: "REVOKE_LEASE",
      eventType: "deny",
      targetPath: `${namespace.toLowerCase()}/${target?.name || id}`,
      status: "DROP",
    });

    this.notify();
  }

  getEngines(namespace = "Production") {
    return this.enginesStore[namespace] || [];
  }

  mountEngine(namespace = "Production", engineData) {
    const list = this.getEngines(namespace);
    let path = engineData.path.trim();
    if (!path.endsWith("/")) path += "/";

    const newEngine = {
      id: `eng-${Date.now()}`,
      path,
      type: engineData.type || "KV v2",
      version: engineData.version || "v2.1",
      leasePolicy: engineData.leasePolicy || "30d Max TTL",
      activeSecrets: "0 Secrets",
      health: "OK",
    };

    this.enginesStore[namespace] = [newEngine, ...list];
    saveStorage(STORAGE_KEY_ENGINES, this.enginesStore);

    this.logAuditEvent({
      event: "MOUNT_ENGINE",
      eventType: "write",
      targetPath: `sys/mounts/${namespace.toLowerCase()}/${path}`,
    });

    this.notify();
    return newEngine;
  }

  // --- SECRET TREE EXPLORER ---

  _getTreeRoot(namespace) {
    if (!this.treesStore[namespace]) {
      this.treesStore[namespace] = { items: [] };
    }
    return this.treesStore[namespace];
  }

  _resolveNode(namespace, pathSegments = []) {
    let current = this._getTreeRoot(namespace);
    for (const segment of pathSegments) {
      if (!current.items) current.items = [];
      const found = current.items.find(
        (it) => it.isFolder && it.name.replace(/\/$/, "") === segment,
      );
      if (!found) return null;
      current = found;
    }
    return current;
  }

  getTreeItems(namespace = "Production", pathSegments = []) {
    const node = this._resolveNode(namespace, pathSegments);
    return node && node.items ? [...node.items] : [];
  }

  addTreeItem(namespace = "Production", pathSegments = [], itemData) {
    const node = this._resolveNode(namespace, pathSegments);
    if (!node) return null;
    if (!node.items) node.items = [];

    const isFolder = Boolean(itemData.isFolder);
    const cleanName = isFolder
      ? itemData.name.replace(/\/$/, "")
      : itemData.name.trim();

    const newItem = {
      id: `tree-${Date.now()}`,
      isFolder,
      name: cleanName,
      engineMode:
        itemData.engineMode || (isFolder ? "Static KV" : "v1 (Secret)"),
      value: itemData.value || (isFolder ? undefined : `val_${Date.now()}`),
      lastUpdated: "Just now",
      ...(isFolder && { items: [] }),
    };

    node.items = [newItem, ...node.items];
    saveStorage(STORAGE_KEY_TREES, this.treesStore);

    this.logAuditEvent({
      event: isFolder ? "CREATE_FOLDER" : "STORE_SECRET_PATH",
      eventType: "write",
      targetPath: `${namespace.toLowerCase()}/${pathSegments.join("/")}/${cleanName}`,
    });

    this.notify();
    return newItem;
  }

  rotateTreeSecret(namespace = "Production", pathSegments = [], secretId) {
    const node = this._resolveNode(namespace, pathSegments);
    if (!node || !node.items) return null;

    let target = null;
    node.items = node.items.map((item) => {
      if (item.id === secretId) {
        target = {
          ...item,
          value: `rot_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`,
          lastUpdated: "Just now",
        };
        return target;
      }
      return item;
    });

    saveStorage(STORAGE_KEY_TREES, this.treesStore);

    if (target) {
      this.logAuditEvent({
        event: "ROTATE_TREE_SECRET",
        eventType: "rotate",
        targetPath: `${namespace.toLowerCase()}/${pathSegments.join("/")}/${target.name}`,
      });
    }

    this.notify();
    return target;
  }

  // --- ZERO-TRUST ACCESS ---

  getGrants() {
    return [...this.grantsStore];
  }

  issueGrant(grantData) {
    const newGrant = {
      id: `grant-${Date.now()}`,
      principal: grantData.principal,
      principalType: grantData.principalType || "user",
      role: grantData.role || "Vault-Admin",
      authMethod: grantData.authMethod || "mTLS Cert",
      boundCidr: grantData.boundCidr || "0.0.0.0/0",
      leaseRemaining: grantData.leaseDuration || "2h 00m left",
      status: "Active",
    };

    this.grantsStore = [newGrant, ...this.grantsStore];
    saveStorage(STORAGE_KEY_GRANTS, this.grantsStore);

    this.logAuditEvent({
      event: "ISSUE_ZERO_TRUST_GRANT",
      eventType: "write",
      principal: grantData.principal,
      principalType: grantData.principalType,
      targetPath: `sys/auth/grants/${newGrant.id}`,
    });

    this.notify();
    return newGrant;
  }

  revokeGrant(id) {
    let targetPrincipal = "principal";
    this.grantsStore = this.grantsStore.map((g) => {
      if (g.id === id) {
        targetPrincipal = g.principal;
        return { ...g, status: "Blocked", leaseRemaining: "Revoked" };
      }
      return g;
    });
    saveStorage(STORAGE_KEY_GRANTS, this.grantsStore);

    this.logAuditEvent({
      event: "REVOKE_GRANT",
      eventType: "deny",
      principal: targetPrincipal,
      targetPath: `sys/auth/grants/${id}`,
      status: "DROP",
    });

    this.notify();
  }

  renewGrant(id) {
    this.grantsStore = this.grantsStore.map((g) => {
      if (g.id === id) {
        return { ...g, status: "Active", leaseRemaining: "4h 00m left" };
      }
      return g;
    });
    saveStorage(STORAGE_KEY_GRANTS, this.grantsStore);

    this.logAuditEvent({
      event: "RENEW_GRANT_LEASE",
      eventType: "refresh",
      targetPath: `sys/auth/grants/${id}`,
    });

    this.notify();
  }

  purgeGrant(id) {
    const target = this.grantsStore.find((g) => g.id === id);
    this.grantsStore = this.grantsStore.filter((g) => g.id !== id);
    saveStorage(STORAGE_KEY_GRANTS, this.grantsStore);

    this.logAuditEvent({
      event: "PURGE_BLOCKED_PRINCIPAL",
      eventType: "deny",
      targetPath: `sys/auth/grants/${id}`,
      principal: target?.principal,
    });

    this.notify();
  }

  getPolicies() {
    return [...this.policiesStore];
  }

  createPolicy(policyData) {
    const newPolicy = {
      id: `pol-${Date.now()}`,
      name: policyData.name,
      pathPattern: policyData.pathPattern,
      mfaGate: policyData.mfaGate || "mTLS + Step-Up",
      riskScore: policyData.riskScore || "Low (0.1)",
      riskLevel: policyData.riskLevel || "low",
    };

    this.policiesStore = [newPolicy, ...this.policiesStore];
    saveStorage(STORAGE_KEY_POLICIES, this.policiesStore);

    this.logAuditEvent({
      event: "CREATE_ACCESS_POLICY",
      eventType: "write",
      targetPath: `sys/policies/acl/${newPolicy.name}`,
    });

    this.notify();
    return newPolicy;
  }

  deletePolicy(id) {
    const target = this.policiesStore.find((p) => p.id === id);
    this.policiesStore = this.policiesStore.filter((p) => p.id !== id);
    saveStorage(STORAGE_KEY_POLICIES, this.policiesStore);

    this.logAuditEvent({
      event: "DELETE_ACCESS_POLICY",
      eventType: "deny",
      targetPath: `sys/policies/acl/${target?.name || id}`,
    });

    this.notify();
  }

  // --- MACHINE IDENTITIES ---

  getWorkloadIdentities() {
    return [...this.nhisStore];
  }

  registerWorkloadIdentity(nhiData) {
    const newNhi = {
      id: `nhi-${Date.now()}`,
      workloadId: nhiData.workloadId,
      authBackend: nhiData.authBackend || "K8s SA Auth",
      backendType: nhiData.backendType || "k8s",
      spiffeId: nhiData.spiffeId || `spiffe://prod/${nhiData.workloadId}`,
      boundScope: nhiData.boundScope || "kv-prod/*",
      status: "PASS",
    };

    this.nhisStore = [newNhi, ...this.nhisStore];
    saveStorage(STORAGE_KEY_NHIS, this.nhisStore);

    this.logAuditEvent({
      event: "REGISTER_WORKLOAD_IDENTITY",
      eventType: "write",
      principal: newNhi.workloadId,
      principalType: "machine",
      targetPath: newNhi.boundScope,
    });

    this.notify();
    return newNhi;
  }

  rotateWorkloadIdentity(id) {
    let targetWorkload = "workload";
    this.nhisStore = this.nhisStore.map((item) => {
      if (item.id === id) {
        targetWorkload = item.workloadId;
        return { ...item, status: "PASS" };
      }
      return item;
    });
    saveStorage(STORAGE_KEY_NHIS, this.nhisStore);

    this.logAuditEvent({
      event: "ROTATE_NHI_CREDENTIALS",
      eventType: "rotate",
      principal: targetWorkload,
      principalType: "machine",
      targetPath: `auth/approle/role/${targetWorkload}/secret-id`,
    });

    this.notify();
  }

  renewWorkloadIdentity(id) {
    this.nhisStore = this.nhisStore.map((item) => {
      if (item.id === id) return { ...item, status: "PASS" };
      return item;
    });
    saveStorage(STORAGE_KEY_NHIS, this.nhisStore);

    this.logAuditEvent({
      event: "RENEW_NHI_LEASE",
      eventType: "refresh",
      targetPath: `auth/token/lookup-self`,
    });

    this.notify();
  }

  purgeWorkloadIdentity(id) {
    const target = this.nhisStore.find((item) => item.id === id);
    this.nhisStore = this.nhisStore.filter((item) => item.id !== id);
    saveStorage(STORAGE_KEY_NHIS, this.nhisStore);

    this.logAuditEvent({
      event: "PURGE_WORKLOAD_IDENTITY",
      eventType: "deny",
      principal: target?.workloadId,
      principalType: "machine",
      targetPath: `sys/identities/${id}`,
    });

    this.notify();
  }

  getWifGateways() {
    return [...this.wifsStore];
  }

  addWifGateway(wifData) {
    const newWif = {
      id: `wif-${Date.now()}`,
      providerName: wifData.providerName,
      providerType: wifData.providerType || "k8s",
      tokenType: wifData.tokenType || "OIDC JWT (v1.30)",
      activeNhis: "1 Active",
      attestationEngine: wifData.attestationEngine || "TPM 2.0 / Pod Spec",
      health: "SYNC",
    };

    this.wifsStore = [newWif, ...this.wifsStore];
    saveStorage(STORAGE_KEY_WIFS, this.wifsStore);

    this.logAuditEvent({
      event: "ADD_WIF_AUTH_GATEWAY",
      eventType: "write",
      targetPath: `sys/auth/wif/${newWif.providerName}`,
    });

    this.notify();
    return newWif;
  }

  // --- SYSTEM ENGINE ---

  getSystemState() {
    return { ...this.systemStore };
  }

  toggleSealVault() {
    this.systemStore.isSealed = !this.systemStore.isSealed;
    saveStorage(STORAGE_KEY_SYSTEM, this.systemStore);

    this.logAuditEvent({
      event: this.systemStore.isSealed
        ? "SEAL_VAULT_BARRIER"
        : "UNSEAL_VAULT_BARRIER",
      eventType: this.systemStore.isSealed ? "deny" : "write",
      targetPath: "sys/seal-status",
      status: this.systemStore.isSealed ? "DROP" : "PASS",
    });

    this.notify();
    return this.systemStore.isSealed;
  }

  stepDownLeader() {
    const currentLeader = this.systemStore.raftNodes.find(
      (n) => n.roleType === "leader",
    );
    const nextLeader = this.systemStore.raftNodes.find(
      (n) => n.roleType === "follower",
    );

    if (currentLeader && nextLeader) {
      currentLeader.role = "Follower";
      currentLeader.roleType = "follower";
      nextLeader.role = "Leader";
      nextLeader.roleType = "leader";

      saveStorage(STORAGE_KEY_SYSTEM, this.systemStore);

      this.logAuditEvent({
        event: "STEP_DOWN_RAFT_LEADER",
        eventType: "rotate",
        targetPath: `sys/storage/raft/step-down`,
      });

      this.notify();
    }
  }

  promoteCandidate(nodeId) {
    this.systemStore.raftNodes = this.systemStore.raftNodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, role: "Leader", roleType: "leader" };
      }
      if (node.roleType === "leader") {
        return { ...node, role: "Follower", roleType: "follower" };
      }
      return node;
    });

    saveStorage(STORAGE_KEY_SYSTEM, this.systemStore);

    this.logAuditEvent({
      event: "PROMOTE_RAFT_LEADER",
      eventType: "write",
      targetPath: `sys/storage/raft/promote/${nodeId}`,
    });

    this.notify();
  }

  syncDrNode(nodeId) {
    this.systemStore.raftNodes = this.systemStore.raftNodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, latency: "1.2ms", latencyLevel: "low" };
      }
      return node;
    });

    saveStorage(STORAGE_KEY_SYSTEM, this.systemStore);

    this.logAuditEvent({
      event: "FORCE_SYNC_DR_REPLICATION",
      eventType: "refresh",
      targetPath: `sys/replication/dr/sync/${nodeId}`,
    });

    this.notify();
  }

  rotateMasterKey(keyData) {
    this.systemStore.cryptoEngines = this.systemStore.cryptoEngines.map(
      (eng) => {
        if (eng.engineType === "barrier") {
          return {
            ...eng,
            version: `v${parseInt(eng.version.replace(/[^\d]/g, "") || "4", 10) + 1} Active`,
            algorithm: keyData.algorithm || eng.algorithm,
          };
        }
        return eng;
      },
    );

    saveStorage(STORAGE_KEY_SYSTEM, this.systemStore);

    this.logAuditEvent({
      event: "ROTATE_MASTER_BARRIER_KEY",
      eventType: "rotate",
      targetPath: "sys/rotate/barrier-key",
    });

    this.notify();
  }

  // --- COMPLIANCE AUDIT LOGS ---

  getAuditLogs() {
    return [...this.auditLogsStore];
  }

  getSiemSinks() {
    return [...this.siemSinksStore];
  }

  addSiemSink(sinkData) {
    const newSink = {
      id: `sink-${Date.now()}`,
      name: sinkData.name,
      sinkType: sinkData.sinkType || "splunk",
      protocol: sinkData.protocol || "HTTPS / JSON (mTLS)",
      rate: "500 eps",
      compliance: sinkData.compliance || "SOC2 Type II (WORM)",
      status: "SYNC",
    };

    this.siemSinksStore = [newSink, ...this.siemSinksStore];
    saveStorage(STORAGE_KEY_SIEM_SINKS, this.siemSinksStore);

    this.logAuditEvent({
      event: "ADD_SIEM_AUDIT_SINK",
      eventType: "write",
      targetPath: `sys/audit/sinks/${newSink.name}`,
    });

    this.notify();
    return newSink;
  }
}

export const vaultMockService = new VaultMockService();
