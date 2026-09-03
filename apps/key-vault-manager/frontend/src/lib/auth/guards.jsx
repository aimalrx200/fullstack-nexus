// src/lib/auth/guards.jsx

import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthUser } from "./useAuthUser";

export const FullPageSpinner = ({ label = "AUTHENTICATING..." }) => (
  <div className="cyber-viewport-center">
    {/* Background Grid & Scanline Overlays */}
    <div className="cyber-grid-overlay" />
    <div className="cyber-scanline-overlay" />

    {/* Corner HUD Bracket Framing */}
    <div className="cyber-hud-frame" />

    {/* Center Status Card */}
    <div className="cyber-spinner-card">
      <div className="relative flex items-center justify-center">
        <div className="cyber-spinner-ring" />
        <span className="cyber-spinner-ping-dot" />
      </div>

      <div className="cyber-spinner-text-group">
        <span className="cyber-spinner-label">{label}</span>
        <span className="cyber-spinner-subtitle">
          ESTABLISHING_ENCRYPTED_LINK
        </span>
      </div>
    </div>
  </div>
);

export const ProtectedRoute = ({ redirectPath = "/login" }) => {
  const { data: user, isPending } = useAuthUser();
  const location = useLocation();

  if (isPending) {
    return <FullPageSpinner label="DECRYPTING_TOKEN..." />;
  }

  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const GuestRoute = ({ redirectPath = "/" }) => {
  const { data: user, isPending } = useAuthUser();
  const location = useLocation();

  if (isPending) {
    return <FullPageSpinner label="CHECKING_CREDENTIALS..." />;
  }

  if (user) {
    const origin = location.state?.from?.pathname || redirectPath;
    return <Navigate to={origin} replace />;
  }

  return <Outlet />;
};
