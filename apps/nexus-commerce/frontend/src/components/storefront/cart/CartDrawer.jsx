import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { useCart } from "../../../hooks/useCart";
import { CartItemRow } from "./CartItemRow";
import { CouponInputBox } from "./CouponInputBox";
import { CartSummary } from "./CartSummary";
import { GuestMergeBanner } from "./GuestMergeBanner";
import { Button } from "../../common/Button";
import { EmptyState } from "../../feedback/EmptyState";

export function CartDrawer({ onProceedToCheckout, onOpenAuth }) {
  const {
    items,
    itemCount,
    isCartDrawerOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const drawerRef = useRef(null);

  // Trap Escape key & disable background scrolling
  useEffect(() => {
    if (!isCartDrawerOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeCart();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartDrawerOpen, closeCart]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Bag Drawer"
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Slide-Over Drawer Container */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="relative w-full max-w-md bg-surface-card border-l border-border-main shadow-2xl h-full flex flex-col z-10"
          >
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-border-subtle bg-surface-card flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-primary" />
                <h3 className="text-base font-semibold text-text-main">
                  Shopping Bag
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-surface-elevated text-xs font-mono font-semibold text-text-muted">
                  {itemCount}
                </span>
              </div>

              <button
                onClick={closeCart}
                className="min-h-11 min-w-11 -mr-2 rounded-xl flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-elevated transition-colors cursor-pointer"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hold Guarantee Alert */}
            {items.length > 0 && (
              <div className="px-6 py-2 bg-blue-500/10 border-b border-blue-500/20 text-[11px] font-mono text-blue-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>
                  Stock locked for 10 minutes upon checkout initiation.
                </span>
              </div>
            )}

            {/* Scrollable Line Items */}
            <div className="flex-1 overflow-y-auto px-6 divide-y divide-border-subtle custom-scrollbar">
              {items.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="Your shopping bag is empty"
                  description="Explore our catalog to add flash-sale items and electronics."
                  actionLabel="Explore Catalog"
                  onAction={closeCart}
                />
              ) : (
                <div className="py-2 space-y-1">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.variantId?._id || item.variantId}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions & Checkout */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border-main bg-surface-app/50 space-y-4">
                <GuestMergeBanner onSignIn={onOpenAuth} />
                <CouponInputBox />
                <CartSummary />

                <Button
                  variant="luxury"
                  size="lg"
                  icon={ArrowRight}
                  onClick={() => {
                    closeCart();
                    onProceedToCheckout?.();
                  }}
                  className="w-full font-bold shadow-lg shadow-brand-primary/20"
                >
                  Proceed to Checkout
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-faint">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3D Secure 256-Bit Encrypted Checkout</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
