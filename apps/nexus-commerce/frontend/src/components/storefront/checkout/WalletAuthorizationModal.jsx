import React, { useState, useEffect } from "react";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useCurrency } from "../../../hooks/useCurrency";

export function WalletAuthorizationModal({
  isOpen,
  onClose,
  order,
  paymentMethod = "jazzcash",
  mobileNumber = "",
  onAuthorize,
  isLoading = false,
}) {
  const { formatPrice } = useCurrency();
  const [mpin, setMpin] = useState("1234");
  const [countdown, setCountdown] = useState(120);
  const [isApproved, setIsApproved] = useState(false);

  const isJazzCash = paymentMethod === "jazzcash";
  const brandName = isJazzCash ? "JazzCash" : "Easypaisa";
  const brandColor = isJazzCash
    ? "bg-red-500/10 text-red-500 border-red-500/20"
    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";

  // Countdown timer effect (safe interval subscription without resetting state in effect body)
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Handle modal close with state reset triggered by user action or parent
  const handleModalClose = () => {
    setCountdown(120);
    setIsApproved(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mpin.length < 4 || !order?._id) return;

    await onAuthorize({
      orderId: order._id,
      paymentMethod,
      mobileNumber: mobileNumber || order.customerPhone,
      mpin,
    });

    setIsApproved(true);
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = String(countdown % 60).padStart(2, "0");

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={`${brandName} Direct Debit Authorization`}
      description={`Order #${order?.orderNumber || ""} • Total: ${formatPrice(
        order?.pricing?.totalUSD,
        order?.pricing?.totalPKR,
      )}`}
      maxWidth="max-w-md"
    >
      {isApproved ? (
        <div className="text-center py-6 space-y-4 animate-in fade-in">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-main">
              Payment Authorized & Confirmed!
            </h3>
            <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
              Your {brandName} account was debited successfully. The order is
              now confirmed and moving to the fulfillment packing radar.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Simulated In-App Push Prompt Card */}
          <div className="p-4 rounded-2xl bg-surface-elevated border border-border-main space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs font-mono ${brandColor}`}
                >
                  {isJazzCash ? "JC" : "EP"}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-main">
                    {brandName} App Notification
                  </h4>
                  <p className="text-[11px] font-mono text-text-muted">
                    {mobileNumber || order?.customerPhone || "0300 1234567"}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-surface-card border border-border-subtle text-amber-400">
                ⏱ {minutes}:{seconds}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-between text-xs font-mono">
              <span className="text-text-muted">Payable Total:</span>
              <span className="font-bold text-brand-primary text-sm">
                {formatPrice(
                  order?.pricing?.totalUSD,
                  order?.pricing?.totalPKR,
                )}
              </span>
            </div>
          </div>

          {/* MPIN Entry Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-muted">
              Enter 4-Digit {brandName} MPIN{" "}
              <span className="text-brand-primary">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={4}
                value={mpin}
                onChange={(e) => setMpin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full min-h-11 px-3.5 pl-10 rounded-xl bg-surface-elevated border border-border-main text-text-main text-sm font-mono tracking-widest text-center focus:outline-hidden focus:border-brand-primary transition-colors"
                required
              />
              <Lock className="w-4 h-4 text-text-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-text-faint font-mono flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-brand-primary shrink-0" />
              <span>Sandbox mode active: Pre-filled with test MPIN (1234)</span>
            </p>
          </div>

          {/* Action Bar */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={handleModalClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isJazzCash ? "primary" : "luxury"}
              size="md"
              icon={ArrowRight}
              isLoading={isLoading}
              className="flex-1 font-bold"
            >
              Authorize{" "}
              {formatPrice(order?.pricing?.totalUSD, order?.pricing?.totalPKR)}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-text-faint">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit Encrypted Mobile Direct Debit</span>
          </div>
        </form>
      )}
    </Modal>
  );
}
