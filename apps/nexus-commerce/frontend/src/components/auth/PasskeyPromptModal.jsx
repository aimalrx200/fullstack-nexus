import React from "react";
import { Fingerprint, Shield, Sparkles } from "lucide-react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { usePasskey } from "../../hooks/usePasskey";

export function PasskeyPromptModal({ isOpen, onClose, userEmail, userName }) {
  const { registerPasskey, isPasskeyLoading, isSupported } = usePasskey();

  const handleEnrollPasskey = async () => {
    const result = await registerPasskey({ email: userEmail, name: userName });
    if (result.success) {
      onClose();
    }
  };

  if (!isSupported) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enable Biometric Passkey"
      description="FIDO2 passwordless sign-in with Face ID, Touch ID, or Windows Hello."
      maxWidth="max-w-md"
    >
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-lg shadow-brand-primary/20 animate-pulse-slow">
          <Fingerprint className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-text-main font-medium">
            Fast, cryptographic sign-in for your account
          </p>
          <p className="text-xs text-text-muted leading-relaxed max-w-sm mx-auto">
            Passkeys replace passwords with biometric credentials bound directly
            to this hardware device. Immune to phishing and credential stuffing.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle text-left flex items-start gap-3">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-text-muted space-y-0.5">
            <span className="font-semibold text-text-main block">
              Hardware Encrypted
            </span>
            <span>
              Your biometric data stays in your device's Secure Enclave and is
              never transmitted over the network.
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            variant="luxury"
            size="lg"
            icon={Sparkles}
            isLoading={isPasskeyLoading}
            onClick={handleEnrollPasskey}
          >
            Activate Passkey on this Device
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isPasskeyLoading}
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </Modal>
  );
}
