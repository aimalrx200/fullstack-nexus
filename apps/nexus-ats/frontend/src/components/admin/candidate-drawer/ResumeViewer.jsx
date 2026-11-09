// apps/nexus-ats/frontend/src/components/admin/candidate-drawer/ResumeViewer.jsx

import { FileText, ExternalLink, Briefcase, DollarSign } from "lucide-react";
import styles from "./ResumeViewer.module.css";

export default function ResumeViewer({ candidate }) {
  const tags = candidate.tags || [];

  return (
    <div className={styles.container}>
      {/* Resume Document Link Box */}
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <div className={styles.title}>
            <FileText size={15} />
            <span>Official Curriculum Vitae</span>
          </div>

          {candidate.resumeUrl && (
            <a
              href={candidate.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.downloadLink}
            >
              <ExternalLink size={13} />
              <span>Open PDF</span>
            </a>
          )}
        </div>

        {/* Experience & Salary Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Experience</span>
            <span className={styles.statValue}>
              {candidate.experienceYears
                ? `${candidate.experienceYears} Years`
                : "N/A"}
            </span>
          </div>

          <div className={styles.statBox}>
            <span className={styles.statLabel}>Target Salary</span>
            <span className={styles.statValue}>
              {candidate.expectedSalary || "Negotiable"}
            </span>
          </div>
        </div>
      </div>

      {/* Verified Skill Tags */}
      {tags.length > 0 && (
        <div className={styles.tagsBox}>
          <span className={styles.tagsTitle}>Evaluated Candidate Skills</span>
          <div className={styles.tagsRow}>
            {tags.map((tag, i) => (
              <span key={i} className={styles.tagPill}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
