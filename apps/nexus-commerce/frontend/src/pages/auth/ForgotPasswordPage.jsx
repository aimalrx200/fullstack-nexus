import React from "react";
import { useNavigate } from "react-router";
import { ForgotPasswordForm } from "../../components/auth/ForgotPasswordForm";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  return <ForgotPasswordForm onBackToLogin={() => navigate("/login")} />;
}
