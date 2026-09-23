// apps/nexus-commerce/frontend/src/layouts/StorefrontLayout.jsx

import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Navbar } from "../components/common/Navbar";
import { Footer } from "../components/common/Footer";
import { VerifyEmailBanner } from "../components/auth/VerifyEmailBanner";
import { CartDrawer } from "../components/storefront/cart/CartDrawer";
import { SupportChatWidget } from "../components/storefront/support/SupportChatWidget";
import { Modal } from "../components/common/Modal";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";
import { ForgotPasswordForm } from "../components/auth/ForgotPasswordForm";
import { PageTransition } from "../components/common/PageTransition";

export function StorefrontLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authModal, setAuthModal] = useState({ isOpen: false, view: "login" });

  const handleModalAuthSuccess = () => {
    setAuthModal({ isOpen: false, view: "login" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-app text-text-main transition-colors selection:bg-brand-primary selection:text-white relative">
      <VerifyEmailBanner />
      <Navbar
        onOpenAuthModal={() => setAuthModal({ isOpen: true, view: "login" })}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>

      <Footer />

      <CartDrawer
        onProceedToCheckout={() => navigate("/checkout")}
        onOpenAuth={() => setAuthModal({ isOpen: true, view: "login" })}
      />

      <SupportChatWidget />

      <Modal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, view: "login" })}
        maxWidth="max-w-md"
      >
        {authModal.view === "login" && (
          <LoginForm
            isModal={true}
            onSuccess={handleModalAuthSuccess}
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
            isModal={true}
            onSuccess={handleModalAuthSuccess}
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
