// apps/nexus-commerce/frontend/src/pages/auth/LoginPage.jsx

import { useNavigate } from "react-router";
import { LoginForm } from "../../components/auth/LoginForm";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <LoginForm
      onSwitchToRegister={() => navigate("/register")}
      onSwitchToForgot={() => navigate("/forgot-password")}
    />
  );
}
