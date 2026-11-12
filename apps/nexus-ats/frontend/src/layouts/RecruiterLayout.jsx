// apps/nexus-ats/frontend/src/layouts/RecruiterLayout.jsx

import { useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  Kanban,
  Briefcase,
  BarChart3,
  ExternalLink,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { selectThemeMode, toggleTheme } from "@/redux/slices/themeSlice";
import {
  toggleSidebar,
  toggleMobileSidebar,
  setMobileSidebarOpen,
} from "@/redux/slices/uiSlice";
import { setUnauthenticated } from "@/redux/slices/authSlice";
import { selectAllCandidates } from "@/redux/slices/candidateSlice";
import { selectAllJobs } from "@/redux/slices/jobSlice";
import { removeSession } from "@/lib/auth/sessionManager";
import { APP_CONFIG } from "@/config/constants";
import styles from "./RecruiterLayout.module.css";

export default function RecruiterLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useSelector(selectThemeMode);
  const user = useSelector((state) => state.auth.user);
  const sidebarCollapsed = useSelector((state) => state.ui.sidebarCollapsed);
  const mobileSidebarOpen = useSelector((state) => state.ui.mobileSidebarOpen);

  const candidates = useSelector(selectAllCandidates);
  const jobs = useSelector(selectAllJobs);

  // Auto-close mobile drawer whenever route changes
  useEffect(() => {
    dispatch(setMobileSidebarOpen(false));
  }, [location.pathname, dispatch]);

  // Escape key closes mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileSidebarOpen) {
        dispatch(setMobileSidebarOpen(false));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileSidebarOpen, dispatch]);

  // Graceful Informative Logout Flow
  const handleLogout = () => {
    removeSession("manual");
    dispatch(setUnauthenticated());
    toast.success("Signed out successfully");
    navigate("/login?reason=signout", { replace: true });
  };

  const navItems = [
    {
      to: "/admin/dashboard",
      label: "Overview & Analytics",
      icon: BarChart3,
    },
    {
      to: "/admin/pipeline",
      label: "Talent Pipeline",
      icon: Kanban,
      count: candidates.length,
    },
    {
      to: "/admin/jobs",
      label: "Job Requisitions",
      icon: Briefcase,
      count: jobs.length,
    },
  ];

  const currentRouteName =
    navItems.find((item) => location.pathname.startsWith(item.to))?.label ||
    "Recruiter Portal";

  const renderNavLinks = () => (
    <nav className={styles.nav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
            title={sidebarCollapsed ? item.label : undefined}
          >
            <Icon size={18} />
            {!sidebarCollapsed && <span>{item.label}</span>}
            {!sidebarCollapsed && item.count !== undefined && (
              <span className={styles.navBadge}>{item.count}</span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  const userAvatarUrl = user?.avatar || user?.avatarUrl;

  return (
    <div className={styles.shell}>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          sidebarCollapsed ? styles.sidebarCollapsed : ""
        }`}
      >
        <div className={styles.sidebarHeader}>
          <Link to="/admin/dashboard" className={styles.brand}>
            <div className={styles.brandIcon}>
              <ShieldCheck size={20} />
            </div>
            {!sidebarCollapsed && (
              <div className={styles.brandInfo}>
                <span className={styles.brandTitle}>{APP_CONFIG.appName}</span>
                <span className={styles.brandSubtitle}>Talent Suite</span>
              </div>
            )}
          </Link>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={() => dispatch(toggleSidebar())}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Sidebar"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={15} />
            ) : (
              <ChevronLeft size={15} />
            )}
          </button>
        </div>

        {renderNavLinks()}

        <div className={styles.sidebarFooter}>
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className={styles.publicPortalLink}
            title={`Open ${APP_CONFIG.companyName} Careers`}
          >
            <ExternalLink size={14} />
            {!sidebarCollapsed && <span>Live Careers Board</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile Slide-Out Drawer (320px responsive) */}
      <div
        className={`${styles.mobileOverlay} ${
          mobileSidebarOpen ? styles.mobileOverlayVisible : ""
        }`}
        onClick={() => dispatch(setMobileSidebarOpen(false))}
        aria-hidden="true"
      />
      <div
        className={`${styles.mobileDrawer} ${
          mobileSidebarOpen ? styles.mobileDrawerOpen : ""
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <ShieldCheck size={20} />
            </div>
            <div className={styles.brandInfo}>
              <span className={styles.brandTitle}>{APP_CONFIG.appName}</span>
              <span className={styles.brandSubtitle}>Talent Suite</span>
            </div>
          </div>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={() => dispatch(toggleMobileSidebar())}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>
        {renderNavLinks()}
      </div>

      {/* Main Content Area */}
      <div className={styles.mainContainer}>
        {/* Top Navigation Bar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.menuToggle}
              onClick={() => dispatch(toggleMobileSidebar())}
              aria-label="Open Navigation Menu"
            >
              <Menu size={18} />
            </button>
            <h1 className={styles.pageHeading}>{currentRouteName}</h1>
          </div>

          <div className={styles.topbarRight}>
            {/* Dark/Light Theme Toggle */}
            <button
              type="button"
              className={styles.themeToggle}
              onClick={() => dispatch(toggleTheme())}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun size={15} color="#f59e0b" />
              ) : (
                <Moon size={15} color="#6366f1" />
              )}
            </button>

            {/* Recruiter Profile Chip & Logout */}
            <div className={styles.userChip}>
              <div className={styles.avatar}>
                {userAvatarUrl ? (
                  <img
                    src={userAvatarUrl}
                    alt={user?.name || "Recruiter"}
                    className={styles.avatarImg}
                  />
                ) : (
                  user?.name?.charAt(0) || "R"
                )}
              </div>
              <span className={styles.userName}>
                {user?.name || "Recruiter"}
              </span>
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={handleLogout}
                title="Sign out of Recruiter Portal"
                aria-label="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* View Transition Canvas */}
        <main className={styles.contentCanvas}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
