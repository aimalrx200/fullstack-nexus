// apps/nexus-ats/frontend/src/pages/admin/PipelinePage.jsx

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Users, Briefcase } from "lucide-react";
import { selectAllCandidates } from "@/redux/slices/candidateSlice";
import { selectAllJobs } from "@/redux/slices/jobSlice";
import PipelineFilterBar from "@/components/admin/pipeline/PipelineFilterBar";
import KanbanBoard from "@/components/admin/pipeline/KanbanBoard";
import BoardSkeleton from "@/components/admin/pipeline/BoardSkeleton";
import CandidateDrawer from "@/components/admin/candidate-drawer/CandidateDrawer";
import styles from "./PipelinePage.module.css";

const SKELETON_GRACE_PERIOD_MS = 250;

export default function PipelinePage() {
  const candidates = useSelector(selectAllCandidates);
  const jobs = useSelector(selectAllJobs);

  // Micro-skeleton debounce to guarantee 0.00 CLS during code-split route resolution
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounting(false);
    }, SKELETON_GRACE_PERIOD_MS);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.pageContainer}>
      {/* Page Header */}
      <div className={styles.headerSection}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Talent Pipeline</h1>
          <p className={styles.subtitle}>
            Screen applicants, conduct scorecard evaluations, and manage stage
            progression.
          </p>
        </div>

        {/* Live Requisition & Candidate Tallies */}
        <div className={styles.statsGroup}>
          <div className={styles.statPill}>
            <Users size={14} color="var(--primary)" />
            <span className={styles.statPillStrong}>{candidates.length}</span>
            <span>Applicants</span>
          </div>

          <div className={styles.statPill}>
            <Briefcase size={14} color="var(--success)" />
            <span className={styles.statPillStrong}>{jobs.length}</span>
            <span>Active Roles</span>
          </div>
        </div>
      </div>

      {/* Filter Suite */}
      <PipelineFilterBar />

      {/* Interactive Board Area */}
      <div className={styles.boardArea}>
        {isMounting ? <BoardSkeleton /> : <KanbanBoard />}
      </div>

      {/* Sliding Candidate Inspection Drawer (Portal) */}
      <CandidateDrawer />
    </div>
  );
}
