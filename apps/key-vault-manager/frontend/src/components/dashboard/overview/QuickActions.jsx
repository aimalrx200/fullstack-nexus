// src/components/dashboard/overview/QuickActions.jsx

import { Plus, Zap, ScrollText, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { ROUTES } from "../../../routes/routes";

export function QuickActions({ onIssueSecret, onDynamicCred }) {
  const navigate = useNavigate();

  const actions = [
    {
      id: "issue-secret",
      label: "Issue Secret",
      icon: Plus,
      onClick: onIssueSecret,
      variant: "primary",
    },
    {
      id: "dynamic-cred",
      label: "Dynamic Credential",
      icon: Zap,
      onClick: onDynamicCred,
      variant: "default",
    },
    {
      id: "view-audit",
      label: "View Audit Trail",
      icon: ScrollText,
      onClick: () => navigate(ROUTES.AUDIT_LOGS),
      variant: "default",
    },
    {
      id: "manage-policy",
      label: "Manage Policy",
      icon: Shield,
      onClick: () => navigate(ROUTES.ACCESS),
      variant: "default",
    },
  ];

  return (
    <section className="quick-actions-container">
      <h3 className="quick-actions-title">
        Core Open Operations & Quick Actions
      </h3>
      <div className="quick-actions-grid">
        {actions.map((action) => {
          const Icon = action.icon;
          const isPrimary = action.variant === "primary";

          return (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              className={`quick-actions-btn ${
                isPrimary
                  ? "quick-actions-btn-primary"
                  : "quick-actions-btn-default"
              }`}
            >
              <Icon className="quick-actions-icon" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
