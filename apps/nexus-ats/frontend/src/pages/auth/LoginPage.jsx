// apps/nexus-ats/frontend/src/pages/auth/LoginPage.jsx

import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  Info,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { demoLoginUser, loginUser } from "@/redux/slices/authSlice";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const authLoading = useSelector((state) => state.auth.loading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const reason = searchParams.get("reason");

  // 1-Click Demo Recruiter Login (Alex Sterling)
  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      const user = await dispatch(demoLoginUser()).unwrap();
      toast.success(`Welcome back, ${user.name}`);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      toast.error(err || "Demo evaluator sign-in failed");
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Standard Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in both email and password");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await dispatch(
        loginUser({ email: email.trim(), password }),
      ).unwrap();
      toast.success(`Welcome back, ${user.name}`);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      toast.error(err || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isDemoLoading || authLoading;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginCard}>
        {/* Card Header */}
        <div className={styles.header}>
          <div className={styles.brandIcon}>
            <Briefcase size={22} />
          </div>
          <h1 className={styles.title}>Recruiter Portal</h1>
          <p className={styles.subtitle}>
            Sign in to manage talent pipelines and job requisitions
          </p>
        </div>

        {/* Contextual Status Banner */}
        {reason === "signout" && (
          <div className={styles.contextBanner} role="status">
            <Info size={16} />
            <span>You have been signed out</span>
          </div>
        )}

        {reason === "expired" && (
          <div
            className={`${styles.contextBanner} ${styles.bannerWarning}`}
            role="alert"
          >
            <AlertTriangle size={16} />
            <span>Session expired. Please sign in again</span>
          </div>
        )}

        {/* 1-Click Demo Section for Evaluators */}
        <div className={styles.demoSection}>
          <div className={styles.demoHeader}>
            <span>Quick Evaluation</span>
            <span className={styles.demoBadge}>1-Click</span>
          </div>
          <button
            type="button"
            className={styles.demoButton}
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            <Sparkles size={16} />
            <span>
              {isDemoLoading
                ? "Entering Portal..."
                : "Explore as Demo Recruiter"}
            </span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className={styles.divider}>or continue with email</div>

        {/* Standard Credentials Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label htmlFor="email" className={styles.label}>
              Work Email
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="recruiter@nexus-ats.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isSubmitting ? "Signing In..." : "Sign In with Password"}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className={styles.footer}>
          <span>Looking for open roles?</span>
          <Link to="/" className={styles.footerLink}>
            Back to Careers Board
          </Link>
        </div>
      </div>
    </div>
  );
}
