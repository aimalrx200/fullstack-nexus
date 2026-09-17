import React from "react";
import { useNavigate } from "react-router";
import { LoginForm } from "../../components/auth/LoginForm";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <LoginForm
      onSuccess={() => navigate("/")}
      onSwitchToRegister={() => navigate("/register")}
      onSwitchToForgot={() => navigate("/forgot-password")}
    />
  );
}
