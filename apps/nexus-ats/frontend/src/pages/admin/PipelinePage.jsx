// apps/nexus-ats/frontend/src/pages/admin/PipelinePage.jsx

import { useSelector } from "react-redux";
import { selectAllCandidates } from "@/redux/slices/candidateSlice";
import styles from "./AdminPlaceholder.module.css";

export default function PipelinePage() {
  const candidates = useSelector(selectAllCandidates);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Candidate Pipeline</h2>
      <p className={styles.subtitle}>
        Kanban board canvas ready. {candidates.length} active applicant profiles
        loaded.
      </p>
    </div>
  );
}
