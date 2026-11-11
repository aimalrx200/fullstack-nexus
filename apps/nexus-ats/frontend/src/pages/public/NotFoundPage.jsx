// apps/nexus-ats/frontend/src/pages/public/NotFoundPage.jsx

import { Link } from "react-router";
import { ArrowLeft, Kanban, Briefcase, ChevronRight } from "lucide-react";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.heroCode}>404</div>

      <div className={styles.titleGroup}>
        <h1 className={styles.title}>Position or View Not Found</h1>
        <p className={styles.subtitle}>
          The requisition, candidate dossier, or workspace view you requested
          does not exist or may have been relocated.
        </p>
      </div>

      <div className={styles.actions}>
        <Link to="/" className={styles.primaryBtn}>
          <ArrowLeft size={16} />
          <span>Back to Open Positions</span>
        </Link>
        <Link to="/admin/pipeline" className={styles.secondaryBtn}>
          <Kanban size={16} />
          <span>Recruiter Workspace</span>
        </Link>
      </div>

      <div className={styles.quickNavBox}>
        <span className={styles.quickNavTitle}>Direct Destinations</span>
        <div className={styles.quickLinksList}>
          <Link to="/" className={styles.quickLinkItem}>
            <span>Public Careers Board</span>
            <ChevronRight size={14} />
          </Link>
          <Link to="/admin/jobs" className={styles.quickLinkItem}>
            <span>Job Requisitions Manager</span>
            <ChevronRight size={14} />
          </Link>
          <Link to="/admin/dashboard" className={styles.quickLinkItem}>
            <span>Recruiting Analytics & Funnel</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
