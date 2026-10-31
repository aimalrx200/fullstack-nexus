import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router";
import { Briefcase, Sun, Moon, ShieldCheck } from "lucide-react";
import { APP_CONFIG } from "@/config/constants";
import styles from "./PublicLayout.module.css";

export default function PublicLayout() {
  // 1. Lazy state initialization eliminates the ESLint cascading render error
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("nexus_ats_theme") || "dark";
  });

  // 2. Synchronize DOM whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("nexus_ats_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className={styles.layoutWrapper}>
      {/* Top Navbar */}
      <header className={styles.header}>
        <div className={styles.navContainer}>
          {/* Brand Logo */}
          <Link to="/" className={styles.brandLink}>
            <div className={styles.brandIcon}>
              <Briefcase size={18} />
            </div>
            <div className={styles.brandText}>
              <div className={styles.appName}>{APP_CONFIG.appName}</div>
              <div className={styles.companyName}>
                {APP_CONFIG.companyName} Careers
              </div>
            </div>
          </Link>

          {/* Right Controls */}
          <div className={styles.controls}>
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              className={styles.themeToggle}
            >
              {theme === "dark" ? (
                <Sun size={15} color="#f59e0b" />
              ) : (
                <Moon size={15} color="#6366f1" />
              )}
            </button>

            {/* Recruiter Portal Link */}
            <Link to="/login" className={styles.portalBtn}>
              <ShieldCheck size={14} color="var(--primary)" />
              <span>Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} {APP_CONFIG.companyName}.
          </div>
          <div className={styles.footerLinks}>
            <Link to="/">Open Roles</Link>
            <Link to="/login">Recruiter Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
