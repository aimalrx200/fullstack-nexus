// apps/nexus-commerce/frontend/src/pages/auth/LoginPage.jsx

import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { LoginForm } from "../../components/auth/LoginForm";
import { LoginFormSkeleton } from "../../components/feedback/LoginFormSkeleton";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";

export function LoginPage() {
  const navigate = useNavigate();

  // 1. Selector for auth initialization
  const isInitializing = useSelector((state) => !state.auth.isInitialized);

  // 2. Delayed loading state
  const showSkeleton = useDelayedLoading(isInitializing, {
    delay: 150,
    minDuration: 800, // Balanced hold time for smooth visual transition
  });

  // 3. Render Skeleton during initialization or delay hold period
  if (isInitializing || showSkeleton) {
    return <LoginFormSkeleton />;
  }

  return (
    <LoginForm
      onSwitchToRegister={() => navigate("/register")}
      onSwitchToForgot={() => navigate("/forgot-password")}
    />
  );
}

export default LoginPage;
