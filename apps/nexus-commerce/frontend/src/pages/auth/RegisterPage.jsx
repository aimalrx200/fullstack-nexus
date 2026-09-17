import React from "react";
import { useNavigate } from "react-router";
import { RegisterForm } from "../../components/auth/RegisterForm";

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <RegisterForm
      onSuccess={() => navigate("/")}
      onSwitchToLogin={() => navigate("/login")}
    />
  );
}
