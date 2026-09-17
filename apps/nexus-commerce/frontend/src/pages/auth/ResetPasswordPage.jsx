import React from "react";
import { useSearchParams, useNavigate } from "react-router";
import { ResetPasswordForm } from "../../components/auth/ResetPasswordForm";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  return (
    <ResetPasswordForm token={token} onSuccess={() => navigate("/login")} />
  );
}
