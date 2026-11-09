// apps/nexus-ats/frontend/src/components/admin/pipeline/PipelineFilterBar.jsx

import { useDispatch, useSelector } from "react-redux";
import { Search, Briefcase, X, ChevronDown, Filter } from "lucide-react";
import {
  selectAllJobs,
  selectSelectedJobId,
  setSelectedJobId,
} from "@/redux/slices/jobSlice";
import {
  setPipelineSearchQuery,
  setSelectedStageFilter,
  selectAllCandidates,
} from "@/redux/slices/candidateSlice";
import styles from "./PipelineFilterBar.module.css";

export default function PipelineFilterBar() {
  const dispatch = useDispatch();

  const jobs = useSelector(selectAllJobs);
  const selectedJobId = useSelector(selectSelectedJobId);
  const searchQuery = useSelector(
    (state) => state.candidates.pipelineSearchQuery || "",
  );
  const candidates = useSelector(selectAllCandidates);

  const hasActiveFilters = selectedJobId !== "all" || searchQuery.trim() !== "";

  // Compute matching candidate count
  const filteredCandidatesCount = candidates.filter((cand) => {
    const matchesJob = selectedJobId === "all" || cand.jobId === selectedJobId;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      cand.name.toLowerCase().includes(query) ||
      cand.jobTitle?.toLowerCase().includes(query) ||
      cand.email?.toLowerCase().includes(query) ||
      cand.tags?.some((tag) => tag.toLowerCase().includes(query));

    return matchesJob && matchesSearch;
  }).length;

  const handleClearAll = () => {
    dispatch(setSelectedJobId("all"));
    dispatch(setPipelineSearchQuery(""));
    dispatch(setSelectedStageFilter("all"));
  };

  return (
    <div className={styles.container}>
      <div className={styles.controlsRow}>
        <div className={styles.leftControls}>
          {/* Job Requisition Filter Dropdown */}
          <div className={styles.selectWrapper}>
            <Briefcase size={15} className={styles.selectIcon} />
            <select
              id="pipeline-job-filter"
              className={styles.requisitionSelect}
              value={selectedJobId}
              onChange={(e) => dispatch(setSelectedJobId(e.target.value))}
              aria-label="Filter pipeline by job requisition"
            >
              <option value="all">All Requisitions ({jobs.length})</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.selectChevron} />
          </div>

          {/* Applicant & Skill Search Input */}
          <div className={styles.searchWrapper}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search candidate, skill, or email..."
              value={searchQuery}
              onChange={(e) => dispatch(setPipelineSearchQuery(e.target.value))}
              aria-label="Search candidates by name, email, or skill"
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => dispatch(setPipelineSearchQuery(""))}
                aria-label="Clear search input"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Right Info & Reset Action */}
        <div className={styles.rightControls}>
          <div className={styles.activeCountBadge}>
            <Filter size={13} />
            <span>Showing</span>
            <span className={styles.activeCountNumber}>
              {filteredCandidatesCount}
            </span>
            <span>of {candidates.length}</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleClearAll}
              aria-label="Reset all pipeline filters"
            >
              <X size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
