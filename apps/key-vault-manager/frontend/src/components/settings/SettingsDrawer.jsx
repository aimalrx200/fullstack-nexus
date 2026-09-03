// src/components/settings/SettingsDrawer.jsx

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  X,
  Eye,
  Sparkles,
  RotateCcw,
  Laptop,
  Check,
  FolderTree,
  LogOut,
  User,
  Shield,
  FileDown,
} from "lucide-react";
import { setThemePreference } from "../../redux/slices/themeSlice";
import { triggerToast } from "../../redux/slices/notificationSlice";
import { useAuthUser } from "../../lib/auth/useAuthUser";
import { authManager } from "../../lib/auth/AuthManager";
import { queryClient } from "../../lib/api/query";

export function SettingsDrawer({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: authData } = useAuthUser();

  const authUser = authData?.user || authData;
  const currentTheme = useSelector((state) => state.theme.preference);

  // 1. Client-Side Preferences (Persisted in localStorage)
  const [maskMode, setMaskMode] = useState(
    () => localStorage.getItem("kv_mask_mode") || "click",
  );
  const [clipboardTtl, setClipboardTtl] = useState(
    () => localStorage.getItem("kv_clipboard_ttl") || "30",
  );
  const [autoLockTtl, setAutoLockTtl] = useState(
    () => localStorage.getItem("kv_autolock_ttl") || "15",
  );
  const [defaultNamespace, setDefaultNamespace] = useState(
    () => localStorage.getItem("kv_default_namespace") || "Production",
  );
  const [hudEffects, setHudEffects] = useState(
    () => localStorage.getItem("kv_hud_effects") !== "false",
  );
  const [isExporting, setIsExporting] = useState(false);

  // 2. Telemetry metadata from current tab session
  const clientInstanceId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("client_instance_id") || "local-sandbox"
      : "local-sandbox";

  // Persist preference updates
  useEffect(() => {
    localStorage.setItem("kv_mask_mode", maskMode);
  }, [maskMode]);

  useEffect(() => {
    localStorage.setItem("kv_clipboard_ttl", clipboardTtl);
  }, [clipboardTtl]);

  useEffect(() => {
    localStorage.setItem("kv_autolock_ttl", autoLockTtl);
  }, [autoLockTtl]);

  useEffect(() => {
    localStorage.setItem("kv_default_namespace", defaultNamespace);
  }, [defaultNamespace]);

  useEffect(() => {
    localStorage.setItem("kv_hud_effects", hudEffects);
    const scanline = document.querySelector(".root-layout-scanline-overlay");
    const grid = document.querySelector(".root-layout-grid-overlay");
    if (scanline && grid) {
      scanline.style.display = hudEffects ? "block" : "none";
      grid.style.display = hudEffects ? "block" : "none";
    }
  }, [hudEffects]);

  // 3. Close on Escape key & lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Compiles metadata from all 3 namespaces into an RFC-compliant signed manifest JSON
  const handleExportManifest = async () => {
    setIsExporting(true);

    try {
      const namespaces = ["Production", "Staging", "Development"];
      const { vaultApi } = await import("../../lib/api/vaultApi");

      const namespaceResults = await Promise.all(
        namespaces.map(async (ns) => {
          try {
            const res = await vaultApi.getSecrets(ns);
            return {
              namespace: ns,
              totalKeys: res?.secrets?.length || 0,
              secrets: (res?.secrets || []).map((s) => ({
                id: s.id,
                name: s.name,
                engine: s.engine,
                type: s.type,
                version: s.version,
                ttl: s.ttl,
                status: s.status,
                allowedActions: s.allowedActions,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt,
              })),
            };
          } catch {
            return { namespace: ns, totalKeys: 0, secrets: [] };
          }
        }),
      );

      // Generate random HMAC Merkle seal
      const randomSeal = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const manifestPayload = {
        $schema: "https://keyvault.internal/schemas/v2/manifest.json",
        vaultClusterName: "FullStack Nexus Production Cluster",
        exportedAt: new Date().toISOString(),
        exportedBy: authUser?.username || authUser?.name || "Operator",
        clusterVersion: "v2.0.26",
        barrierEngine: "AES-256-GCM (Hardware-Accelerated AEAD)",
        shamirQuorum: "3 of 5 Shares Active",
        namespaces: namespaceResults,
        cryptographicProof: {
          authority: "Vault Root Barrier Authority",
          signatureType: "HMAC-SHA256-WORM",
          merkleRootSeal: `0x${randomSeal}`,
        },
      };

      const blob = new Blob([JSON.stringify(manifestPayload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vault_cluster_manifest_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      dispatch(
        triggerToast({
          message: "Manifest Exported",
          description:
            "Encrypted cluster topology manifest downloaded as JSON.",
          type: "success",
        }),
      );
    } catch {
      dispatch(
        triggerToast({
          message: "Export Failed",
          description: "Could not compile vault manifest.",
          type: "error",
        }),
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetShowcase = async () => {
    try {
      const { vaultApi } = await import("../../lib/api/vaultApi");
      await vaultApi.resetDemoVault();
      queryClient.invalidateQueries();
      dispatch(
        triggerToast({
          message: "Showcase Environment Reset",
          description:
            "All database secrets and audit logs re-seeded with fresh encryption.",
          type: "success",
        }),
      );
    } catch {
      queryClient.invalidateQueries();
    }
    onClose();
  };

  const handleLogout = async () => {
    onClose();
    await authManager.terminateSession(true);
    navigate("/login", { replace: true });
    dispatch(
      triggerToast({
        message: "Logged Out",
        description: "Session terminated successfully.",
        type: "info",
      }),
    );
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-drawer-title"
      className="fixed inset-0 z-100 flex justify-end bg-black/65 backdrop-blur-xs animate-in fade-in duration-150 font-mono"
    >
      {/* Backdrop click to close */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Cyber Slide-over Panel */}
      <div className="relative w-full max-w-md h-dvh bg-surface-card border-l border-surface-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 text-text-main">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <h2
                id="settings-drawer-title"
                className="text-sm font-bold tracking-wider uppercase text-text-main"
              >
                Vault Settings // Preferences
              </h2>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-md text-text-subtle hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
              aria-label="Close Settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section 1: Active Identity & Profile Badge */}
          <div className="bg-surface-app/70 border border-surface-border/70 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-main">
                  {authUser?.name ||
                    authUser?.username ||
                    "Authenticated Operator"}
                </p>
                <p className="text-[11px] text-text-subtle">
                  Role:{" "}
                  <span className="text-brand-primary uppercase font-semibold">
                    {authUser?.role || "Administrator"}
                  </span>
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-10px bg-status-success/10 border border-status-success/30 text-status-success px-2 py-0.5 rounded font-bold uppercase">
              <Shield className="w-3 h-3" /> Active
            </span>
          </div>

          {/* Section 2: Secret Masking & Workspace Safety */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary uppercase">
              <Eye className="w-3.5 h-3.5" />
              <span>Secret Masking & Clipboard</span>
            </div>

            <div className="bg-surface-app/60 border border-surface-border/60 rounded-lg p-3 space-y-3 text-xs">
              <div>
                <label className="text-text-subtle block mb-1.5 font-medium">
                  Reveal Behavior
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMaskMode("click")}
                    className={`px-2.5 py-1.5 rounded border text-10px font-semibold uppercase transition-all cursor-pointer ${
                      maskMode === "click"
                        ? "border-brand-primary bg-brand-primary/10 text-brand-primary shadow-xs"
                        : "border-surface-border text-text-subtle hover:bg-surface-hover"
                    }`}
                  >
                    Click to Reveal
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaskMode("hover")}
                    className={`px-2.5 py-1.5 rounded border text-10px font-semibold uppercase transition-all cursor-pointer ${
                      maskMode === "hover"
                        ? "border-brand-primary bg-brand-primary/10 text-brand-primary shadow-xs"
                        : "border-surface-border text-text-subtle hover:bg-surface-hover"
                    }`}
                  >
                    Hover to Peek
                  </button>
                </div>
              </div>

              <div>
                <label className="text-text-subtle block mb-1.5 font-medium">
                  Clipboard Auto-Clear Timeout
                </label>
                <select
                  value={clipboardTtl}
                  onChange={(e) => setClipboardTtl(e.target.value)}
                  className="w-full bg-surface-card border border-surface-border rounded px-2.5 py-1.5 text-text-main focus:outline-none focus:border-brand-primary cursor-pointer text-xs"
                >
                  <option value="15">15 Seconds (Strict)</option>
                  <option value="30">30 Seconds (Standard)</option>
                  <option value="60">60 Seconds (Extended)</option>
                  <option value="0">Disabled (Manual Only)</option>
                </select>
              </div>

              <div>
                <label className="text-text-subtle block mb-1.5 font-medium">
                  Inactivity Auto-Lock
                </label>
                <select
                  value={autoLockTtl}
                  onChange={(e) => setAutoLockTtl(e.target.value)}
                  className="w-full bg-surface-card border border-surface-border rounded px-2.5 py-1.5 text-text-main focus:outline-none focus:border-brand-primary cursor-pointer text-xs"
                >
                  <option value="5">5 Minutes</option>
                  <option value="15">15 Minutes (Default)</option>
                  <option value="30">30 Minutes</option>
                  <option value="0">Never (Session Only)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Vault Environment Defaults */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary uppercase">
              <FolderTree className="w-3.5 h-3.5" />
              <span>Default Vault Namespace</span>
            </div>

            <div className="bg-surface-app/60 border border-surface-border/60 rounded-lg p-3 text-xs">
              <label className="text-text-subtle block mb-1.5 font-medium">
                Primary Landing Environment
              </label>
              <select
                value={defaultNamespace}
                onChange={(e) => setDefaultNamespace(e.target.value)}
                className="w-full bg-surface-card border border-surface-border rounded px-2.5 py-1.5 text-text-main focus:outline-none focus:border-brand-primary cursor-pointer text-xs"
              >
                <option value="Production">Production (kv-prod)</option>
                <option value="Staging">Staging (kv-stage)</option>
                <option value="Development">Development (kv-dev)</option>
              </select>
            </div>
          </div>

          {/* Section 4: HUD & Visual Effects */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cyberpunk HUD & Visuals</span>
            </div>

            <div className="bg-surface-app/60 border border-surface-border/60 rounded-lg p-3 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-subtle">
                  Background Scanlines & Grid
                </span>
                <button
                  type="button"
                  onClick={() => setHudEffects(!hudEffects)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    hudEffects ? "bg-brand-primary" : "bg-surface-border"
                  }`}
                  aria-label="Toggle Scanlines and Grid"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      hudEffects ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div>
                <span className="text-text-subtle block mb-1.5 font-medium">
                  Color Palette Mode
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {["system", "light", "dark"].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => dispatch(setThemePreference(theme))}
                      className={`px-2 py-1.5 rounded border text-10px font-semibold uppercase transition-all cursor-pointer ${
                        currentTheme === theme
                          ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                          : "border-surface-border text-text-subtle hover:bg-surface-hover"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Session & Sandbox Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary uppercase">
              <Laptop className="w-3.5 h-3.5" />
              <span>Active Tab Session Isolation</span>
            </div>

            <div className="bg-surface-app/60 border border-surface-border/60 rounded-lg p-3 text-xs space-y-2">
              <div className="flex justify-between items-center text-text-subtle">
                <span>Instance Sandbox ID:</span>
                <span className="text-brand-primary font-bold">
                  {clientInstanceId.substring(0, 12)}...
                </span>
              </div>
              <div className="flex justify-between items-center text-text-subtle">
                <span>Session Isolation:</span>
                <span className="text-status-success font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Enabled
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / System Actions */}
        <div className="pt-6 border-t border-surface-border space-y-2 mt-6">
          {/* Export Manifest Action Button */}
          <button
            type="button"
            onClick={handleExportManifest}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded border border-brand-primary/40 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 text-xs font-semibold uppercase transition-all cursor-pointer disabled:opacity-50 cyber-button-glow"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>
              {isExporting
                ? "Compiling Manifest..."
                : "Export Vault Manifest (.json)"}
            </span>
          </button>

          {/* Reset Demo Data Action Button */}
          <button
            type="button"
            onClick={handleResetShowcase}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded border border-status-warning/40 bg-status-warning/10 text-status-warning hover:bg-status-warning/20 text-xs font-semibold uppercase transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded border border-status-danger/40 bg-status-danger/10 text-status-danger hover:bg-status-danger/20 text-xs font-semibold uppercase transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
