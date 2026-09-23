// apps/nexus-commerce/frontend/src/pages/auth/RegisterPage.jsx

import { useNavigate } from "react-router";
import { RegisterForm } from "../../components/auth/RegisterForm";

export function RegisterPage() {
  const navigate = useNavigate();

  return <RegisterForm onSwitchToLogin={() => navigate("/login")} />;
}
