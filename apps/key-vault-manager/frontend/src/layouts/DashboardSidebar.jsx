// src/layouts/DashboardSidebar.jsx

import { useState } from "react";
import { NavLink } from "react-router";
import {
  Vault,
  ShieldCheck,
  FileCheck2,
  Cpu,
  Settings2,
  ChevronDown,
  ChevronRight,
  Shield,
  LayoutGrid,
} from "lucide-react";
import { ROUTES } from "../routes/routes";

export function DashboardSidebar({ isOpen, onClose }) {
  const [vaultsOpen, setVaultsOpen] = useState(true);

  const vaultSubItems = [
    { label: "Production", path: ROUTES.VAULT.PRODUCTION },
    { label: "Staging", path: ROUTES.VAULT.STAGING },
    { label: "Development", path: ROUTES.VAULT.DEVELOPMENT },
  ];

  return (
    <>
      {isOpen && (
        <div onClick={onClose} className="dashboard-sidebar-overlay" />
      )}

      <aside
        className={`dashboard-sidebar ${
          isOpen ? "dashboard-sidebar-open" : "dashboard-sidebar-closed"
        }`}
      >
        <div className="dashboard-sidebar-header">
          <span className="dashboard-sidebar-brand">
            <span className="dashboard-sidebar-badge-dot" />
            <Shield className="dashboard-sidebar-brand-icon" />
            KEY VAULT
          </span>
        </div>

        <nav className="dashboard-sidebar-nav">
          <div className="dashboard-sidebar-section-title">Navigation</div>

          <NavLink
            to={ROUTES.HOME}
            end
            className={({ isActive }) =>
              `dashboard-sidebar-nav-item ${
                isActive
                  ? "dashboard-sidebar-nav-item-active"
                  : "dashboard-sidebar-nav-item-inactive"
              }`
            }
          >
            <LayoutGrid className="dashboard-sidebar-nav-icon" />
            <span className="dashboard-sidebar-nav-label">Overview</span>
          </NavLink>

          <div>
            <button
              type="button"
              onClick={() => setVaultsOpen((prev) => !prev)}
              className="dashboard-sidebar-accordion-btn"
            >
              <div className="dashboard-sidebar-accordion-content">
                <Vault className="dashboard-sidebar-accordion-icon" />
                <span className="dashboard-sidebar-nav-label">
                  Vault Engine
                </span>
              </div>
              {vaultsOpen ? (
                <ChevronDown className="dashboard-sidebar-chevron" />
              ) : (
                <ChevronRight className="dashboard-sidebar-chevron" />
              )}
            </button>

            {vaultsOpen && (
              <div className="dashboard-sidebar-subitems">
                {vaultSubItems.map((subItem) => (
                  <NavLink
                    key={subItem.path}
                    to={subItem.path}
                    className={({ isActive }) =>
                      `dashboard-sidebar-subitem ${
                        isActive
                          ? "dashboard-sidebar-subitem-active"
                          : "dashboard-sidebar-subitem-inactive"
                      }`
                    }
                  >
                    <span className="dashboard-sidebar-subitem-prefix">├─</span>
                    <span>{subItem.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <NavLink
            to={ROUTES.ACCESS}
            className={({ isActive }) =>
              `dashboard-sidebar-nav-item ${
                isActive
                  ? "dashboard-sidebar-nav-item-active"
                  : "dashboard-sidebar-nav-item-inactive"
              }`
            }
          >
            <ShieldCheck className="dashboard-sidebar-nav-icon" />
            <span className="dashboard-sidebar-nav-label">
              Zero-Trust Access
            </span>
          </NavLink>

          <NavLink
            to={ROUTES.AUDIT_LOGS}
            className={({ isActive }) =>
              `dashboard-sidebar-nav-item ${
                isActive
                  ? "dashboard-sidebar-nav-item-active"
                  : "dashboard-sidebar-nav-item-inactive"
              }`
            }
          >
            <FileCheck2 className="dashboard-sidebar-nav-icon" />
            <span className="dashboard-sidebar-nav-label">
              Compliance Audit Logs
            </span>
          </NavLink>

          <NavLink
            to={ROUTES.MACHINE_IDENTITIES}
            className={({ isActive }) =>
              `dashboard-sidebar-nav-item ${
                isActive
                  ? "dashboard-sidebar-nav-item-active"
                  : "dashboard-sidebar-nav-item-inactive"
              }`
            }
          >
            <Cpu className="dashboard-sidebar-nav-icon" />
            <span className="dashboard-sidebar-nav-label">
              Machine Identities
            </span>
          </NavLink>

          <NavLink
            to={ROUTES.SYSTEM_ENGINE}
            className={({ isActive }) =>
              `dashboard-sidebar-nav-item ${
                isActive
                  ? "dashboard-sidebar-nav-item-active"
                  : "dashboard-sidebar-nav-item-inactive"
              }`
            }
          >
            <Settings2 className="dashboard-sidebar-nav-icon" />
            <span className="dashboard-sidebar-nav-label">System Engine</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
