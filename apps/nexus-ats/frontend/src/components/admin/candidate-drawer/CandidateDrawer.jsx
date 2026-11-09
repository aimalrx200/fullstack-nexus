// apps/nexus-ats/frontend/src/components/admin/candidate-drawer/CandidateDrawer.jsx

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { X, FileText, Star, MessageSquare, Clock } from "lucide-react";
import {
  selectActiveCandidate,
  clearSelectedCandidate,
} from "@/redux/slices/candidateSlice";
import { closeCandidateDrawer } from "@/redux/slices/uiSlice";
import CandidateHeader from "./CandidateHeader";
import ResumeViewer from "./ResumeViewer";
import ScorecardWidget from "./ScorecardWidget";
import NotesTimeline from "./NotesTimeline";
import ActivityLogTimeline from "./ActivityLogTimeline";
import styles from "./CandidateDrawer.module.css";

const TABS = {
  OVERVIEW: "overview",
  SCORECARD: "scorecard",
  NOTES: "notes",
  TIMELINE: "timeline",
};

export default function CandidateDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.candidateDrawerOpen);
  const candidate = useSelector(selectActiveCandidate);
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);

  const handleClose = useCallback(() => {
    dispatch(closeCandidateDrawer());
    dispatch(clearSelectedCandidate());
  }, [dispatch]);

  // Escape key closes drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Lock background scroll safely
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !candidate) return null;

  const notesCount = candidate.notes?.length || 0;

  const content = (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      aria-hidden="true"
    >
      <div
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={`Candidate Profile: ${candidate.name}`}
      >
        {/* Pinned Top Bar */}
        <div className={styles.drawerTopBar}>
          <span className={styles.drawerBadge}>Candidate Dossier</span>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close candidate drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Pinned Candidate Header + Dossier Tabs (Never Shrinks / Never Scrolls Out) */}
        <div className={styles.pinnedHeaderArea}>
          <CandidateHeader candidate={candidate} />

          <div className={styles.tabsBar}>
            <button
              type="button"
              className={`${styles.tabBtn} ${
                activeTab === TABS.OVERVIEW ? styles.tabBtnActive : ""
              }`}
              onClick={() => setActiveTab(TABS.OVERVIEW)}
            >
              <FileText size={14} />
              <span>Resume & Profile</span>
            </button>

            <button
              type="button"
              className={`${styles.tabBtn} ${
                activeTab === TABS.SCORECARD ? styles.tabBtnActive : ""
              }`}
              onClick={() => setActiveTab(TABS.SCORECARD)}
            >
              <Star size={14} />
              <span>Scorecard</span>
            </button>

            <button
              type="button"
              className={`${styles.tabBtn} ${
                activeTab === TABS.NOTES ? styles.tabBtnActive : ""
              }`}
              onClick={() => setActiveTab(TABS.NOTES)}
            >
              <MessageSquare size={14} />
              <span>Recruiter Notes</span>
              {notesCount > 0 && (
                <span className={styles.tabBadge}>{notesCount}</span>
              )}
            </button>

            <button
              type="button"
              className={`${styles.tabBtn} ${
                activeTab === TABS.TIMELINE ? styles.tabBtnActive : ""
              }`}
              onClick={() => setActiveTab(TABS.TIMELINE)}
            >
              <Clock size={14} />
              <span>Activity Log</span>
            </button>
          </div>
        </div>

        {/* Dedicated Scrollable Content Area */}
        <div className={styles.scrollableContent}>
          {activeTab === TABS.OVERVIEW && (
            <ResumeViewer candidate={candidate} />
          )}
          {activeTab === TABS.SCORECARD && (
            <ScorecardWidget candidate={candidate} />
          )}
          {activeTab === TABS.NOTES && <NotesTimeline candidate={candidate} />}
          {activeTab === TABS.TIMELINE && (
            <ActivityLogTimeline candidate={candidate} />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
