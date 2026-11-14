// apps/nexus-ats/frontend/src/pages/admin/PipelinePage.jsx

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, Briefcase } from "lucide-react";
import {
  fetchCandidates,
  selectAllCandidates,
} from "@/redux/slices/candidateSlice";
import { fetchJobs, selectAllJobs } from "@/redux/slices/jobSlice";
import PipelineFilterBar from "@/components/admin/pipeline/PipelineFilterBar";
import KanbanBoard from "@/components/admin/pipeline/KanbanBoard";
import BoardSkeleton from "@/components/admin/pipeline/BoardSkeleton";
import CandidateDrawer from "@/components/admin/candidate-drawer/CandidateDrawer";
import styles from "./PipelinePage.module.css";

export default function PipelinePage() {
  const dispatch = useDispatch();

  const candidates = useSelector(selectAllCandidates);
  const jobs = useSelector(selectAllJobs);
  const candidatesLoading = useSelector((state) => state.candidates.loading);

  // Fetch live pipeline data from Atlas
  useEffect(() => {
    dispatch(fetchCandidates());
    if (jobs.length === 0) {
      dispatch(fetchJobs());
    }
  }, [dispatch, jobs.length]);

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
        {candidatesLoading && candidates.length === 0 ? (
          <BoardSkeleton />
        ) : (
          <KanbanBoard />
        )}
      </div>

      {/* Sliding Candidate Inspection Drawer (Portal) */}
      <CandidateDrawer />
    </div>
  );
}
