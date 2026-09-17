import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { Navbar } from "../components/common/Navbar";
import { Footer } from "../components/common/Footer";
import { VerifyEmailBanner } from "../components/auth/VerifyEmailBanner";
import { CartDrawer } from "../components/storefront/cart/CartDrawer";
import { SupportChatWidget } from "../components/storefront/support/SupportChatWidget";
import { Modal } from "../components/common/Modal";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";
import { ForgotPasswordForm } from "../components/auth/ForgotPasswordForm";

export function StorefrontLayout() {
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState({ isOpen: false, view: "login" });

  return (
    <div className="min-h-screen flex flex-col bg-surface-app text-text-main transition-colors selection:bg-brand-primary selection:text-white">
      <VerifyEmailBanner />
      <Navbar
        onOpenAuthModal={() => setAuthModal({ isOpen: true, view: "login" })}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <Footer />

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => navigate("/checkout")}
        onOpenAuth={() => setAuthModal({ isOpen: true, view: "login" })}
      />

      {/* Global Floating Live Support Chat Widget */}
      <SupportChatWidget />

      {/* Fast Global Authentication Modal */}
      <Modal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, view: "login" })}
        maxWidth="max-w-md"
      >
        {authModal.view === "login" && (
          <LoginForm
            onSuccess={() => setAuthModal({ isOpen: false, view: "login" })}
            onSwitchToRegister={() =>
              setAuthModal({ isOpen: true, view: "register" })
            }
            onSwitchToForgot={() =>
              setAuthModal({ isOpen: true, view: "forgot" })
            }
          />
        )}
        {authModal.view === "register" && (
          <RegisterForm
            onSuccess={() => setAuthModal({ isOpen: false, view: "login" })}
            onSwitchToLogin={() =>
              setAuthModal({ isOpen: true, view: "login" })
            }
          />
        )}
        {authModal.view === "forgot" && (
          <ForgotPasswordForm
            onBackToLogin={() => setAuthModal({ isOpen: true, view: "login" })}
          />
        )}
      </Modal>
    </div>
  );
}
