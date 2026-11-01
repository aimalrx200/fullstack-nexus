// apps/nexus-ats/frontend/src/pages/admin/JobManagerPage.jsx

import { useSelector } from "react-redux";
import { selectAllJobs } from "@/redux/slices/jobSlice";
import styles from "./AdminPlaceholder.module.css";

export default function JobManagerPage() {
  const jobs = useSelector(selectAllJobs);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Job Requisitions</h2>
      <p className={styles.subtitle}>
        Requisitions table ready. {jobs.length} active job postings loaded.
      </p>
    </div>
  );
}
