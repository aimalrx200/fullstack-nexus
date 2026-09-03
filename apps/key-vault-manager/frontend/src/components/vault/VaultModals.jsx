// src/components/vault/VaultModals.jsx

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Copy,
  Check,
  Terminal,
  KeyRound,
  Zap,
  Plug,
  FolderPlus,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
  Lock,
  Cpu,
  Server,
  Layers,
  FileCode2,
  GitBranch,
  ShieldAlert,
} from "lucide-react";
import { triggerToast } from "../../redux/slices/notificationSlice";
import { useDispatch } from "react-redux";

function ModalShell({ title, icon: Icon, onClose, children }) {
  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 font-mono">
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface-card border border-surface-border rounded-xl shadow-2xl p-6 space-y-5 text-text-main animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            {Icon && <Icon className="w-4 h-4 text-brand-primary" />}
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-main">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-subtle hover:text-text-main hover:bg-surface-hover cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

// 1. Issue Secret Modal with Inline Error Handling & Async Submit
export function IssueSecretModal({ isOpen, onClose, namespace, onCreated }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [engine, setEngine] = useState("KV v2");
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError("");

    // Client-side quick guard
    const trimmedName = name.trim().toUpperCase();
    if (!trimmedName || !value.trim()) {
      setFieldErrors({
        name: !trimmedName ? ["Secret identifier is required."] : undefined,
        value: !value.trim() ? ["Plaintext value cannot be empty."] : undefined,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreated({
        name: trimmedName,
        engine,
        type: "Static",
        value: value.trim(),
        ttl: "Infinite",
      });

      // Reset on success & close
      setName("");
      setValue("");
      setEngine("KV v2");
      onClose();
    } catch (err) {
      const serverData = err?.response?.data;
      if (serverData?.validationErrors) {
        setFieldErrors(serverData.validationErrors);
      } else if (serverData?.errors) {
        setFieldErrors(serverData.errors);
      } else {
        setGeneralError(
          serverData?.message ||
            "Failed to encrypt and store secret. Please check input parameters.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      title={`Issue Secret // ${namespace}`}
      icon={KeyRound}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {generalError && (
          <div className="p-2.5 rounded border border-status-danger/40 bg-status-danger/10 text-status-danger text-[11px] font-mono">
            ! {generalError}
          </div>
        )}

        <div>
          <label className="text-text-subtle block mb-1">
            Secret Identifier <span className="text-brand-primary">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFieldErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="e.g. AWS_SECRET_ACCESS_KEY"
            className={`w-full bg-surface-app border rounded px-3 py-2 text-text-main focus:outline-none font-mono ${
              fieldErrors.name
                ? "border-status-danger focus:border-status-danger"
                : "border-surface-border focus:border-brand-primary"
            }`}
            disabled={isSubmitting}
            required
          />
          {fieldErrors.name && (
            <p className="text-status-danger text-[11px] font-mono mt-1">
              ! {fieldErrors.name[0]}
            </p>
          )}
        </div>

        <div>
          <label className="text-text-subtle block mb-1">Engine Type</label>
          <select
            value={engine}
            onChange={(e) => {
              setEngine(e.target.value);
              setFieldErrors((prev) => ({ ...prev, engine: undefined }));
            }}
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none cursor-pointer font-mono"
            disabled={isSubmitting}
          >
            <option value="KV v2">KV v2 (Key-Value Engine)</option>
            <option value="PKI Certs">PKI Certs (Certificates Engine)</option>
            <option value="Transit">Transit (Encryption Engine)</option>
            <option value="AWS STS">AWS STS (Cloud Identity)</option>
          </select>
          {fieldErrors.engine && (
            <p className="text-status-danger text-[11px] font-mono mt-1">
              ! {fieldErrors.engine[0]}
            </p>
          )}
        </div>

        <div>
          <label className="text-text-subtle block mb-1">
            Secret Plaintext Value <span className="text-brand-primary">*</span>
          </label>
          <textarea
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setFieldErrors((prev) => ({ ...prev, value: undefined }));
            }}
            placeholder="Enter unencrypted plaintext payload..."
            rows={3}
            className={`w-full bg-surface-app border rounded px-3 py-2 text-text-main focus:outline-none resize-none font-mono ${
              fieldErrors.value
                ? "border-status-danger focus:border-status-danger"
                : "border-surface-border focus:border-brand-primary"
            }`}
            disabled={isSubmitting}
            required
          />
          {fieldErrors.value && (
            <p className="text-status-danger text-[11px] font-mono mt-1">
              ! {fieldErrors.value[0]}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2 rounded bg-surface-hover text-text-subtle hover:text-text-main cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2 rounded bg-brand-primary text-white font-semibold hover:bg-brand-primary-hover cyber-button-glow cursor-pointer disabled:opacity-50 uppercase tracking-wider text-xs"
          >
            {isSubmitting ? "Encrypting & Storing..." : "Encrypt & Store"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// 2. Dynamic Credential Generator Modal with Async Validation
export function DynamicCredModal({ isOpen, onClose, namespace, onCreated }) {
  const [dbTarget, setDbTarget] = useState("PostgreSQL");
  const [ttlMinutes, setTtlMinutes] = useState("60");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const mockUser = `v_${dbTarget.toLowerCase()}_${randomId.toLowerCase()}`;
    const generatedPass = `psk_${Math.random().toString(36).substring(2, 10)}!`;

    try {
      await onCreated({
        name: `${dbTarget.toUpperCase()}_LEASE_${randomId}`,
        engine: dbTarget,
        type: "Dynamic",
        value: `usr:${mockUser} | psk:${generatedPass}`,
        ttl: `${ttlMinutes}m remaining`,
      });
      onClose();
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message || "Failed to provision dynamic lease.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      title={`Generate Dynamic Credential // ${namespace}`}
      icon={Zap}
      onClose={onClose}
    >
      <div className="space-y-4 text-xs">
        {errorMessage && (
          <div className="p-2.5 rounded border border-status-danger/40 bg-status-danger/10 text-status-danger text-[11px] font-mono">
            ! {errorMessage}
          </div>
        )}

        <div>
          <label className="text-text-subtle block mb-1">
            Target Engine Backend
          </label>
          <select
            value={dbTarget}
            onChange={(e) => setDbTarget(e.target.value)}
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:outline-none cursor-pointer font-mono"
            disabled={isSubmitting}
          >
            <option value="PostgreSQL">PostgreSQL Production Pool</option>
            <option value="MongoDB">MongoDB Cluster Node</option>
            <option value="Redis DB">Redis Cluster Engine</option>
          </select>
        </div>

        <div>
          <label className="text-text-subtle block mb-1">
            Lease Lifespan (TTL)
          </label>
          <select
            value={ttlMinutes}
            onChange={(e) => setTtlMinutes(e.target.value)}
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:outline-none cursor-pointer font-mono"
            disabled={isSubmitting}
          >
            <option value="15">15 Minutes</option>
            <option value="60">1 Hour (Standard)</option>
            <option value="240">4 Hours</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isSubmitting}
          className="w-full py-2.5 rounded bg-brand-primary text-white font-semibold hover:bg-brand-primary-hover cyber-button-glow cursor-pointer uppercase tracking-wider text-xs disabled:opacity-50"
        >
          {isSubmitting
            ? "⚡ Provisioning Lease..."
            : "⚡ Provision Ephemeral Lease"}
        </button>
      </div>
    </ModalShell>
  );
}

// 3. Multi-Language SDK Snippets Modal
export function SdkSnippetModal({ isOpen, onClose, secret }) {
  const dispatch = useDispatch();
  const [lang, setLang] = useState("curl");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !secret) return null;

  const secretName = secret.name || "API_KEY";
  const secretId = secret.id || "sec_id";
  const namespace = secret.namespace || "Production";

  const snippets = {
    curl: `# 1. Authenticate and retrieve on-the-fly decrypted payload\ncurl -X GET "https://api.vault.internal/api/v1/vault/secrets/${secretId}/reveal" \\\n  -H "Authorization: Bearer $VAULT_ACCESS_TOKEN" \\\n  -H "Content-Type: application/json"`,
    node: `import { KeyVaultClient } from "@key-vault/sdk";\n\nconst vault = new KeyVaultClient({\n  endpoint: process.env.VAULT_ADDR || "https://api.vault.internal",\n  namespace: "${namespace}",\n});\n\n// Fetches and decrypts via AES-256-GCM\nconst secret = await vault.secrets.reveal("${secretId}");\nconsole.log("${secretName} value:", secret.value);`,
    python: `import os\nfrom key_vault_sdk import VaultClient\n\nclient = VaultClient(\n    endpoint=os.getenv("VAULT_ADDR", "https://api.vault.internal"),\n    namespace="${namespace}"\n)\n\nsecret = client.reveal_secret("${secretId}")\nprint(f"${secretName}: {secret['value']}")`,
    go: `package main\n\nimport (\n\t"context"\n\t"fmt"\n\t"os"\n\t"github.com/key-vault/sdk-go"\n)\n\nfunc main() {\n\tclient := vault.NewClient(os.Getenv("VAULT_ADDR"), "${namespace}")\n\tsecret, err := client.Reveal(context.Background(), "${secretId}")\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tfmt.Printf("${secretName}: %s\\n", secret.Value)\n}`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    dispatch(
      triggerToast({
        message: "Snippet Copied",
        description: `Copied ${lang.toUpperCase()} integration snippet to clipboard.`,
        type: "success",
      }),
    );
  };

  return (
    <ModalShell
      title={`SDK Integration // ${secretName}`}
      icon={Terminal}
      onClose={onClose}
    >
      <div className="space-y-3 text-xs font-mono">
        <div className="flex gap-1 bg-surface-app p-1 rounded border border-surface-border">
          {[
            { id: "curl", label: "cURL" },
            { id: "node", label: "Node.js" },
            { id: "python", label: "Python" },
            { id: "go", label: "Go" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLang(tab.id)}
              className={`flex-1 py-1 rounded text-10px font-bold uppercase transition-all cursor-pointer ${
                lang === tab.id
                  ? "bg-brand-primary text-white shadow-xs"
                  : "text-text-subtle hover:text-text-main hover:bg-surface-hover"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative bg-surface-app p-3.5 rounded-lg border border-surface-border font-mono text-[11px] overflow-x-auto text-brand-secondary leading-relaxed">
          <pre>{snippets[lang]}</pre>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy snippet"
            className="absolute top-2.5 right-2.5 p-1.5 rounded bg-surface-card border border-surface-border text-text-subtle hover:text-text-main hover:border-brand-primary transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-status-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <p className="text-10px text-text-subtle/80">
          All client SDK calls require an active Zero-Trust Identity Grant or
          Workload AppRole.
        </p>
      </div>
    </ModalShell>
  );
}

// 4. Mount New Engine Modal
export function MountEngineModal({ isOpen, onClose, namespace, onMounted }) {
  const dispatch = useDispatch();
  const [engineType, setEngineType] = useState("KV v2");
  const [mountPath, setMountPath] = useState("kv-custom/");
  const [leasePolicy, setLeasePolicy] = useState("30d Max TTL");
  const [version, setVersion] = useState("v2.1");

  if (!isOpen) return null;

  const handleTypeChange = (type) => {
    setEngineType(type);
    const prefixMap = {
      "KV v2": "kv-custom/",
      PostgreSQL: "postgres-custom/",
      Transit: "transit-custom/",
      "PKI Certs": "pki-custom/",
      "Redis DB": "redis-custom/",
      "AWS STS": "aws-custom/",
    };
    setMountPath(prefixMap[type] || "custom-engine/");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mountPath.trim()) return;

    onMounted({
      path: mountPath.trim(),
      type: engineType,
      version,
      leasePolicy,
    });

    dispatch(
      triggerToast({
        message: "Secret Engine Mounted",
        description: `Mounted ${engineType} at '${mountPath}' in ${namespace}.`,
        type: "success",
      }),
    );
    onClose();
  };

  return (
    <ModalShell
      title={`Mount Secret Engine // ${namespace}`}
      icon={Plug}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-text-subtle block mb-1">Engine Backend</label>
          <select
            value={engineType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none cursor-pointer"
          >
            <option value="KV v2">KV v2 (Key-Value Engine)</option>
            <option value="PostgreSQL">PostgreSQL Dynamic Database</option>
            <option value="Transit">Transit Cryptography Engine</option>
            <option value="PKI Certs">PKI Certificate Authority</option>
            <option value="Redis DB">Redis Cluster Engine</option>
            <option value="AWS STS">AWS IAM / STS AssumeRole</option>
          </select>
        </div>
        <div>
          <label className="text-text-subtle block mb-1">Mount Path</label>
          <input
            value={mountPath}
            onChange={(e) => setMountPath(e.target.value)}
            placeholder="e.g. kv-custom/"
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-text-subtle block mb-1">Version</label>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-text-subtle block mb-1">Lease Policy</label>
            <select
              value={leasePolicy}
              onChange={(e) => setLeasePolicy(e.target.value)}
              className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:outline-none cursor-pointer"
            >
              <option value="1h Max TTL">1h Max TTL</option>
              <option value="24h Max TTL">24h Max TTL</option>
              <option value="7d Max TTL">7d Max TTL</option>
              <option value="30d Max TTL">30d Max TTL</option>
              <option value="365d Max TTL">365d Max TTL</option>
              <option value="Infinite">Infinite</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded bg-surface-hover text-text-subtle hover:text-text-main cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded bg-brand-primary text-white font-semibold hover:bg-brand-primary-hover cyber-button-glow cursor-pointer"
          >
            Mount Engine
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// 5. Add Secret Path Modal (Tree Explorer)
export function AddSecretPathModal({
  isOpen,
  onClose,
  namespace,
  currentPath = [],
  onCreated,
}) {
  const dispatch = useDispatch();
  const [isFolder, setIsFolder] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  if (!isOpen) return null;
  const currentPathString = currentPath.length
    ? `${currentPath.join("/")}/`
    : "";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreated({
      isFolder,
      name: name.trim(),
      value: isFolder ? undefined : value.trim(),
      engineMode: isFolder ? "Static KV" : "v1 (Secret)",
    });

    dispatch(
      triggerToast({
        message: isFolder ? "Sub-Directory Created" : "Secret Path Stored",
        description: `Mounted ${name} under '${currentPathString}' in ${namespace}.`,
        type: "success",
      }),
    );
    onClose();
  };

  return (
    <ModalShell
      title={`Add Path // ${currentPathString || namespace}`}
      icon={FolderPlus}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsFolder(false)}
            className={`flex-1 py-2 rounded border font-semibold transition-all cursor-pointer ${
              !isFolder
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-surface-border text-text-subtle hover:bg-surface-hover"
            }`}
          >
            🔑 Secret Key
          </button>
          <button
            type="button"
            onClick={() => setIsFolder(true)}
            className={`flex-1 py-2 rounded border font-semibold transition-all cursor-pointer ${
              isFolder
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-surface-border text-text-subtle hover:bg-surface-hover"
            }`}
          >
            📁 Folder Path
          </button>
        </div>
        <div>
          <label className="text-text-subtle block mb-1">
            {isFolder ? "Folder Name" : "Secret Key Name"}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              isFolder ? "e.g. database-creds" : "e.g. API_SECRET_TOKEN"
            }
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
            required
          />
        </div>
        {!isFolder && (
          <div>
            <label className="text-text-subtle block mb-1">
              Plaintext Value
            </label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter secure value payload..."
              rows={3}
              className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none resize-none"
              required
            />
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded bg-surface-hover text-text-subtle hover:text-text-main cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded bg-brand-primary text-white font-semibold hover:bg-brand-primary-hover cyber-button-glow cursor-pointer"
          >
            {isFolder ? "Create Folder" : "Encrypt & Store"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// 6. View Secret Modal
export function ViewSecretModal({ isOpen, onClose, secret, onRotate }) {
  const dispatch = useDispatch();
  const [decryptedValue, setDecryptedValue] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !secret) return null;

  const fetchPlaintext = async () => {
    if (decryptedValue) return decryptedValue;
    if (secret.value && secret.value !== "••••••••••••••••••••••••") {
      return secret.value;
    }

    try {
      setIsDecrypting(true);
      const { vaultApi } = await import("../../lib/api/vaultApi");
      const res = await vaultApi.revealSecret(secret.id);
      setDecryptedValue(res.value);
      return res.value;
    } catch (err) {
      dispatch(
        triggerToast({
          message: "Decryption Failed",
          description:
            err?.response?.data?.message || "Failed to decrypt secret payload.",
          type: "error",
        }),
      );
      return null;
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleToggleReveal = async () => {
    if (isRevealed) {
      setIsRevealed(false);
    } else {
      const val = await fetchPlaintext();
      if (val !== null) {
        setIsRevealed(true);
      }
    }
  };

  const handleCopy = async () => {
    const val = await fetchPlaintext();
    if (!val) return;

    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    dispatch(
      triggerToast({
        message: "Secret Copied",
        description: `Copied ${secret.name} plaintext to clipboard.`,
        type: "success",
      }),
    );
  };

  return (
    <ModalShell
      title={`Secret Inspection // ${secret.name}`}
      icon={KeyRound}
      onClose={onClose}
    >
      <div className="space-y-4 text-xs font-mono">
        <div className="bg-surface-app border border-surface-border rounded p-3 space-y-2">
          <div className="flex justify-between items-center text-text-subtle">
            <span>Identifier:</span>
            <span className="text-text-main font-bold">{secret.name}</span>
          </div>
          <div className="flex justify-between items-center text-text-subtle">
            <span>Engine Backend:</span>
            <span className="text-brand-primary">
              {secret.engine || secret.engineMode || "KV v2"}
            </span>
          </div>
          <div className="flex justify-between items-center text-text-subtle">
            <span>Lease Type:</span>
            <span className="text-text-main">{secret.type || "Static"}</span>
          </div>
          {secret.version && (
            <div className="flex justify-between items-center text-text-subtle">
              <span>Version:</span>
              <span className="text-text-main">v{secret.version}</span>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-text-subtle">Encrypted AEAD Payload</label>
            <button
              type="button"
              onClick={handleToggleReveal}
              disabled={isDecrypting}
              className="text-text-subtle hover:text-brand-primary flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isDecrypting ? (
                <span className="w-3 h-3 block border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              ) : isRevealed ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> Mask
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" /> Decrypt & Reveal
                </>
              )}
            </button>
          </div>
          <div className="relative bg-surface-app border border-surface-border rounded p-3 font-mono text-[11px] break-all text-brand-secondary min-h-16 flex items-center">
            <span>
              {isRevealed
                ? decryptedValue || secret.value || "No plaintext payload."
                : "••••••••••••••••••••••••••••••••••••••••"}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={isDecrypting}
            className="flex-1 py-2 rounded bg-surface-hover text-text-subtle hover:text-text-main flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-status-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>Copy Value</span>
          </button>
          {onRotate && (
            <button
              type="button"
              onClick={() => {
                onRotate(secret);
                onClose();
              }}
              className="flex-1 py-2 rounded bg-brand-primary text-white font-semibold hover:bg-brand-primary-hover cyber-button-glow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rotate Version</span>
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

// 7. Issue Zero-Trust Grant Modal (Fixed: Wired setLeaseDuration form control)
export function IssueGrantModal({ isOpen, onClose, onCreated }) {
  const [principal, setPrincipal] = useState("");
  const [principalType, setPrincipalType] = useState("machine");
  const [role, setRole] = useState("Vault-Admin");
  const [authMethod, setAuthMethod] = useState("mTLS Cert");
  const [boundCidr, setBoundCidr] = useState("10.240.0.0/16");
  const [leaseDuration, setLeaseDuration] = useState("2h 00m left");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!principal.trim()) return;

    onCreated({
      principal: principal.trim(),
      principalType,
      role,
      authMethod,
      boundCidr: boundCidr.trim(),
      leaseDuration,
    });
    onClose();
  };

  return (
    <ModalShell
      title="Issue Identity Grant // Zero-Trust"
      icon={ShieldCheck}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-text-subtle block mb-1">
            Principal Identifier
          </label>
          <input
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g. srv-k8s-payment or dev-sec@org.io"
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-text-subtle block mb-1">
              Principal Type
            </label>
            <select
              value={principalType}
              onChange={(e) => setPrincipalType(e.target.value)}
              className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:outline-none cursor-pointer"
            >
              <option value="machine">Machine / Service</option>
              <option value="user">Human Operator</option>
            </select>
          </div>
          <div>
            <label className="text-text-subtle block mb-1">Role / Scope</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:outline-none cursor-pointer"
            >
              <option value="Vault-Admin">Vault-Admin</option>
              <option value="Secret-Write">Secret-Write</option>
              <option value="Dynamic-DB-RO">Dynamic-DB-RO</option>
              <option value="KV-ReadOnly">KV-ReadOnly</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-text-subtle block mb-1">Auth Proof</label>
            <select
              value={authMethod}
              onChange={(e) => setAuthMethod(e.target.value)}
              className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:outline-none cursor-pointer"
            >
              <option value="mTLS Cert">mTLS Cert</option>
              <option value="WebAuthn / FIDO2">WebAuthn / FIDO2</option>
              <option value="OIDC Token">OIDC Token</option>
            </select>
          </div>
          <div>
            <label className="text-text-subtle block mb-1">
              Lease Lifespan
            </label>
            <select
              value={leaseDuration}
              onChange={(e) => setLeaseDuration(e.target.value)}
              className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:outline-none cursor-pointer"
            >
              <option value="45m left">45 Minutes</option>
              <option value="2h 00m left">2 Hours (Standard)</option>
              <option value="4h 00m left">4 Hours</option>
              <option value="8h 00m left">8 Hours</option>
              <option value="24h 00m left">24 Hours</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-text-subtle block mb-1">Bound CIDR</label>
          <input
            value={boundCidr}
            onChange={(e) => setBoundCidr(e.target.value)}
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded bg-surface-hover text-text-subtle hover:text-text-main cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded bg-brand-primary text-white font-semibold hover:bg-brand-primary-hover cyber-button-glow cursor-pointer"
          >
            Grant Ephemeral Pass
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// 8. Create Policy Modal
export function CreatePolicyModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [pathPattern, setPathPattern] = useState("");
  const [mfaGate, setMfaGate] = useState("mTLS + Step-Up");
  const [riskLevel, setRiskLevel] = useState("low");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !pathPattern.trim()) return;

    const riskScoreMap = {
      low: "Low (0.1)",
      medium: "Med (0.6)",
      high: "High (0.9)",
    };
    onCreated({
      name: name.trim(),
      pathPattern: pathPattern.trim(),
      mfaGate,
      riskScore: riskScoreMap[riskLevel] || "Low (0.1)",
      riskLevel,
    });
    onClose();
  };

  return (
    <ModalShell
      title="Create Access Policy // Boundary"
      icon={Lock}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-text-subtle block mb-1">
            Policy Identifier
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. k8s-db-ephemeral"
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="text-text-subtle block mb-1">
            Path Boundary Pattern
          </label>
          <input
            value={pathPattern}
            onChange={(e) => setPathPattern(e.target.value)}
            placeholder="e.g. postgres-prod/creds/*"
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-text-subtle block mb-1">
              MFA Gate / Proof
            </label>
            <select
              value={mfaGate}
              onChange={(e) => setMfaGate(e.target.value)}
              className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:outline-none cursor-pointer"
            >
              <option value="mTLS + Step-Up">mTLS + Step-Up</option>
              <option value="FIDO2 / Hardware">FIDO2 / Hardware</option>
              <option value="Geo-Fence Bound">Geo-Fence Bound</option>
            </select>
          </div>
          <div>
            <label className="text-text-subtle block mb-1">Risk Profile</label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:outline-none cursor-pointer"
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded bg-surface-hover text-text-subtle hover:text-text-main cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded bg-brand-primary text-white font-semibold hover:bg-brand-primary-hover cyber-button-glow cursor-pointer"
          >
            Enforce Policy
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// 9. Register Workload Identity Modal
export function RegisterIdentityModal({ isOpen, onClose, onCreated }) {
  const [workloadId, setWorkloadId] = useState("");
  const [backendType, setBackendType] = useState("k8s");
  const [spiffeId, setSpiffeId] = useState("spiffe://prod/api");
  const [boundScope, setBoundScope] = useState("kv-prod/*");

  if (!isOpen) return null;

  const backendNameMap = {
    k8s: "K8s SA Auth",
    approle: "Vault AppRole",
    aws: "AWS IAM STS",
    static: "Static Token",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!workloadId.trim()) return;

    onCreated({
      workloadId: workloadId.trim(),
      authBackend: backendNameMap[backendType],
      backendType,
      spiffeId: spiffeId.trim(),
      boundScope: boundScope.trim(),
    });
    onClose();
  };

  return (
    <ModalShell
      title="Register Workload Identity // NHI"
      icon={Cpu}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-text-subtle block mb-1">
            Workload Identifier
          </label>
          <input
            value={workloadId}
            onChange={(e) => setWorkloadId(e.target.value)}
            placeholder="e.g. srv-payment-worker"
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="text-text-subtle block mb-1">
            Auth Backend Provider
          </label>
          <select
            value={backendType}
            onChange={(e) => setBackendType(e.target.value)}
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:outline-none cursor-pointer"
          >
            <option value="k8s">K8s Service Account Auth</option>
            <option value="approle">Vault AppRole</option>
            <option value="aws">AWS IAM STS AssumeRole</option>
            <option value="static">Static Service Token</option>
          </select>
        </div>
        <div>
          <label className="text-text-subtle block mb-1">
            SPIFFE / Attestation ID
          </label>
          <input
            value={spiffeId}
            onChange={(e) => setSpiffeId(e.target.value)}
            placeholder="spiffe://prod/worker"
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-text-subtle block mb-1">
            Bound Scope / Vault Path
          </label>
          <input
            value={boundScope}
            onChange={(e) => setBoundScope(e.target.value)}
            placeholder="e.g. kv-prod/payments/*"
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded bg-surface-hover text-text-subtle hover:text-text-main cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded bg-brand-primary text-white font-semibold hover:bg-brand-primary-hover cyber-button-glow cursor-pointer"
          >
            Register NHI
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// 10. Add WIF Gateway Modal
export function AddWifGatewayModal({ isOpen, onClose, onCreated }) {
  const [providerName, setProviderName] = useState("");
  const [providerType, setProviderType] = useState("k8s");
  const [tokenType, setTokenType] = useState("OIDC JWT (v1.30)");
  const [attestationEngine, setAttestationEngine] =
    useState("TPM 2.0 / Pod Spec");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!providerName.trim()) return;

    onCreated({
      providerName: providerName.trim(),
      providerType,
      tokenType,
      attestationEngine,
    });
    onClose();
  };

  return (
    <ModalShell
      title="Add WIF Gateway // Federation"
      icon={Layers}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-text-subtle block mb-1">
            Gateway / Cluster Name
          </label>
          <input
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            placeholder="e.g. EKS EU-Central-1 Node"
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-text-subtle block mb-1">Provider Type</label>
            <select
              value={providerType}
              onChange={(e) => setProviderType(e.target.value)}
              className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:outline-none cursor-pointer"
            >
              <option value="k8s">Kubernetes OIDC</option>
              <option value="spire">SPIRE Server</option>
              <option value="aws">AWS IAM OIDC</option>
            </select>
          </div>
          <div>
            <label className="text-text-subtle block mb-1">
              Token Standard
            </label>
            <input
              value={tokenType}
              onChange={(e) => setTokenType(e.target.value)}
              className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-text-subtle block mb-1">
            Attestation Engine
          </label>
          <input
            value={attestationEngine}
            onChange={(e) => setAttestationEngine(e.target.value)}
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded bg-surface-hover text-text-subtle hover:text-text-main cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded bg-brand-primary text-white font-semibold hover:bg-brand-primary-hover cyber-button-glow cursor-pointer"
          >
            Mount Federation Gateway
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// 11. Rotate Master Key Modal
export function RotateMasterKeyModal({ isOpen, onClose, onRotate }) {
  const [algorithm, setAlgorithm] = useState("AES-256-GCM (AEAD)");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onRotate({ algorithm });
    onClose();
  };

  return (
    <ModalShell
      title="Rotate Master Key // Barrier"
      icon={KeyRound}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="bg-surface-app border border-status-warning/40 rounded p-3 text-status-warning space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Cryptographic Barrier Key
            Re-encryption
          </p>
          <p className="text-[11px] text-text-subtle">
            Rotating the master key re-wraps the Shamir key quorum and initiates
            atomic memory cipher rotation.
          </p>
        </div>
        <div>
          <label className="text-text-subtle block mb-1">
            Target Encryption Standard
          </label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:outline-none cursor-pointer"
          >
            <option value="AES-256-GCM (AEAD)">
              AES-256-GCM (AEAD - Hardware)
            </option>
            <option value="ChaCha20-Poly1305">
              ChaCha20-Poly1305 (AVX-512 Vector)
            </option>
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded bg-surface-hover text-text-subtle hover:text-text-main cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded bg-brand-primary text-white font-semibold hover:bg-brand-primary-hover cyber-button-glow cursor-pointer"
          >
            Rotate Master Barrier Key
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// 12. Inspect Audit Event Modal
export function InspectAuditEventModal({ isOpen, onClose, event }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !event) return null;

  const rawJson = JSON.stringify(event, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalShell
      title={`Audit Telemetry // ${event.requestId}`}
      icon={FileCode2}
      onClose={onClose}
    >
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between text-text-subtle">
          <span>Timestamp: {event.timestamp}</span>
          <span
            className={
              event.status === "PASS"
                ? "text-status-success font-bold"
                : "text-status-danger font-bold"
            }
          >
            STATUS: {event.status}
          </span>
        </div>
        <div className="relative bg-surface-app p-3 rounded border border-surface-border font-mono text-[11px] overflow-x-auto text-brand-secondary">
          <pre>{rawJson}</pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded bg-surface-card border border-surface-border text-text-subtle hover:text-text-main cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-status-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// 13. Trace Request Lineage Modal
export function TraceLineageModal({ isOpen, onClose, event }) {
  if (!isOpen || !event) return null;

  return (
    <ModalShell
      title={`Merkle Lineage // ${event.requestId}`}
      icon={GitBranch}
      onClose={onClose}
    >
      <div className="space-y-3 text-xs">
        <div className="bg-surface-app border border-surface-border rounded p-3 space-y-2">
          <div className="flex justify-between items-center text-text-subtle">
            <span>Root Merkle Block:</span>
            <span className="text-brand-primary font-bold">
              {event.merkleRoot || "0x7a80b19..."}
            </span>
          </div>
          <div className="flex justify-between items-center text-text-subtle">
            <span>Principal Source:</span>
            <span className="text-text-main">{event.principal}</span>
          </div>
          <div className="flex justify-between items-center text-text-subtle">
            <span>Resource Target:</span>
            <span className="text-text-main">{event.targetPath}</span>
          </div>
        </div>
        <div className="p-3 border border-brand-primary/30 bg-brand-primary/10 rounded text-brand-primary font-mono text-[11px]">
          ✔ Cryptographic proof sealed via SHA-256 HMAC WORM signature.
        </div>
      </div>
    </ModalShell>
  );
}

// 14. Add SIEM Sink Modal
export function AddSiemSinkModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [sinkType, setSinkType] = useState("splunk");
  const [protocol, setProtocol] = useState("HTTPS / JSON (mTLS)");
  const [compliance, setCompliance] = useState("SOC2 Type II (WORM)");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreated({
      name: name.trim(),
      sinkType,
      protocol,
      compliance,
    });
    onClose();
  };

  return (
    <ModalShell title="Add SIEM Forwarder Sink" icon={Server} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-text-subtle block mb-1">
            Destination Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Splunk EU Ingestion Node"
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="text-text-subtle block mb-1">
            Sink Backend Type
          </label>
          <select
            value={sinkType}
            onChange={(e) => setSinkType(e.target.value)}
            className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:outline-none cursor-pointer"
          >
            <option value="splunk">Splunk Cloud HEC</option>
            <option value="s3">AWS S3 ObjectLock</option>
            <option value="datadog">Datadog SIEM Syslog</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-text-subtle block mb-1">
              Transport Protocol
            </label>
            <input
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-text-subtle block mb-1">
              Compliance Standard
            </label>
            <input
              value={compliance}
              onChange={(e) => setCompliance(e.target.value)}
              className="w-full bg-surface-app border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded bg-surface-hover text-text-subtle hover:text-text-main cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded bg-brand-primary text-white font-semibold hover:bg-brand-primary-hover cyber-button-glow cursor-pointer"
          >
            Provision Sink Forwarder
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
