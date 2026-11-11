// apps/nexus-ats/frontend/src/pages/admin/JobManagerPage.jsx

import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  Briefcase,
  Plus,
  Search,
  X,
  Users,
  ExternalLink,
  Kanban,
  CheckCircle,
  PauseCircle,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
import {
  selectAllJobs,
  updateJobStatus,
  setSelectedJobId,
} from "@/redux/slices/jobSlice";
import { selectAllCandidates } from "@/redux/slices/candidateSlice";
import { setCreateJobModalOpen } from "@/redux/slices/uiSlice";
import { DEPARTMENTS } from "@/config/constants";
import CreateJobModal from "@/components/admin/jobs/CreateJobModal";
import styles from "./JobManagerPage.module.css";

const STATUS_OPTIONS = ["All Statuses", "Active", "Paused", "Archived"];

export default function JobManagerPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const jobs = useSelector(selectAllJobs);
  const candidates = useSelector(selectAllCandidates);

  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  // Dynamically compute real-time candidate tallies per job
  const candidateCountsByJob = useMemo(() => {
    const counts = {};
    candidates.forEach((c) => {
      counts[c.jobId] = (counts[c.jobId] || 0) + 1;
    });
    return counts;
  }, [candidates]);

  // Overall KPI metrics
  const activeCount = jobs.filter(
    (j) => j.status?.toLowerCase() === "active",
  ).length;
  const pausedCount = jobs.filter(
    (j) => j.status?.toLowerCase() === "paused",
  ).length;

  // Filtered requisitions list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        job.title?.toLowerCase().includes(query) ||
        job.department?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query);

      const matchesDept =
        departmentFilter === "All Departments" ||
        job.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All Statuses" ||
        job.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [jobs, searchQuery, departmentFilter, statusFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    departmentFilter !== "All Departments" ||
    statusFilter !== "All Statuses";

  const handleResetFilters = () => {
    setSearchQuery("");
    setDepartmentFilter("All Departments");
    setStatusFilter("All Statuses");
  };

  const handleStatusChange = (jobId, jobTitle, newStatus) => {
    dispatch(updateJobStatus({ jobId, status: newStatus }));
    toast.success(`"${jobTitle}" status changed to ${newStatus}`);
  };

  const handleNavigateToPipeline = (jobId) => {
    dispatch(setSelectedJobId(jobId));
    navigate("/admin/pipeline");
  };

  const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === "active") return styles.statusActive;
    if (s === "paused") return styles.statusPaused;
    return styles.statusArchived;
  };

  return (
    <div className={styles.pageContainer}>
      {/* 1. Header & Actions */}
      <div className={styles.headerSection}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Job Requisitions</h1>
          <p className={styles.subtitle}>
            Publish and manage active job openings across the organization.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.createButton}
            onClick={() => dispatch(setCreateJobModalOpen(true))}
          >
            <Plus size={15} />
            <span>New Requisition</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div
            className={`${styles.statIconWrapper} ${styles.statIconPrimary}`}
          >
            <Briefcase size={18} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{jobs.length}</span>
            <span className={styles.statLabel}>Total Openings</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={`${styles.statIconWrapper} ${styles.statIconSuccess}`}
          >
            <CheckCircle size={18} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{activeCount}</span>
            <span className={styles.statLabel}>Active Roles</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={`${styles.statIconWrapper} ${styles.statIconWarning}`}
          >
            <PauseCircle size={18} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{pausedCount}</span>
            <span className={styles.statLabel}>Paused</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconWrapper} ${styles.statIconInfo}`}>
            <Users size={18} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{candidates.length}</span>
            <span className={styles.statLabel}>Total Applicants</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by role, department, or location..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <select
            className={styles.filterSelect}
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleResetFilters}
          >
            <X size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 4. Desktop Requisitions Table (> 768px) */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Requisition Details</th>
              <th className={styles.th}>Department & Location</th>
              <th className={styles.th}>Type & Level</th>
              <th className={styles.th}>Applicants</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const applicantCount =
                  candidateCountsByJob[job.id] ??
                  job.applicantCount ??
                  job.applicantsCount ??
                  0;
                const statusClass = getStatusClass(job.status);

                return (
                  <tr key={job.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.roleCol}>
                        <button
                          type="button"
                          className={styles.roleTitleLink}
                          onClick={() => handleNavigateToPipeline(job.id)}
                        >
                          {job.title}
                        </button>
                        <span className={styles.roleMeta}>
                          Posted {job.postedDate || "Recently"} •{" "}
                          {job.salaryRange || "Competitive"}
                        </span>
                      </div>
                    </td>

                    <td className={styles.td}>
                      <div className={styles.roleCol}>
                        <span className={styles.roleTitleLink}>
                          {job.department}
                        </span>
                        <span className={styles.roleMeta}>
                          {job.location || job.workplaceType}
                        </span>
                      </div>
                    </td>

                    <td className={styles.td}>
                      <div className={styles.roleCol}>
                        <span>{job.employmentType}</span>
                        <span className={styles.roleMeta}>
                          {job.experienceLevel}
                        </span>
                      </div>
                    </td>

                    <td className={styles.td}>
                      <button
                        type="button"
                        className={styles.applicantPill}
                        onClick={() => handleNavigateToPipeline(job.id)}
                        title="Filter Kanban board by this requisition"
                      >
                        <Users size={12} />
                        <span>{applicantCount} candidates</span>
                      </button>
                    </td>

                    <td className={styles.td}>
                      <select
                        className={`${styles.statusSelect} ${statusClass}`}
                        value={job.status || "Active"}
                        onChange={(e) =>
                          handleStatusChange(job.id, job.title, e.target.value)
                        }
                        aria-label={`Change status for ${job.title}`}
                      >
                        <option value="Active">Active</option>
                        <option value="Paused">Paused</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </td>

                    <td className={styles.td}>
                      <div className={styles.actionsCell}>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => handleNavigateToPipeline(job.id)}
                          title="Open talent pipeline for this role"
                        >
                          <Kanban size={13} />
                          <span>Pipeline</span>
                        </button>

                        {job.slug && (
                          <Link
                            to={`/jobs/${job.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.actionBtn}
                            title="Open public job application view"
                          >
                            <ExternalLink size={13} />
                            <span>Public</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className={styles.emptyState}>
                    <Archive size={32} />
                    <span className={styles.emptyTitle}>
                      No matching requisitions found
                    </span>
                    <p className={styles.emptyText}>
                      Try adjusting your keywords or clearing the active
                      filters.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Mobile Cards View (<= 768px down to 320px) */}
      <div className={styles.mobileCardsGrid}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const applicantCount =
              candidateCountsByJob[job.id] ??
              job.applicantCount ??
              job.applicantsCount ??
              0;
            const statusClass = getStatusClass(job.status);

            return (
              <div key={job.id} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <div>
                    <h3 className={styles.mobileCardTitle}>{job.title}</h3>
                    <div className={styles.mobileChipsRow}>
                      <span className={styles.miniChip}>{job.department}</span>
                      <span className={styles.miniChip}>
                        {job.workplaceType}
                      </span>
                      <span className={styles.miniChip}>
                        {job.experienceLevel}
                      </span>
                    </div>
                  </div>

                  <select
                    className={`${styles.statusSelect} ${statusClass}`}
                    value={job.status || "Active"}
                    onChange={(e) =>
                      handleStatusChange(job.id, job.title, e.target.value)
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className={styles.mobileMetaRow}>
                  <span>{job.location}</span>
                  <button
                    type="button"
                    className={styles.applicantPill}
                    onClick={() => handleNavigateToPipeline(job.id)}
                  >
                    <Users size={12} />
                    <span>{applicantCount} candidates</span>
                  </button>
                </div>

                <div className={styles.mobileActionsRow}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => handleNavigateToPipeline(job.id)}
                  >
                    <Kanban size={13} />
                    <span>Pipeline</span>
                  </button>

                  {job.slug && (
                    <Link
                      to={`/jobs/${job.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.actionBtn}
                    >
                      <ExternalLink size={13} />
                      <span>Live Post</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <Archive size={32} />
            <span className={styles.emptyTitle}>
              No requisitions match your criteria
            </span>
            <p className={styles.emptyText}>
              Try clearing your search query or reset filters.
            </p>
          </div>
        )}
      </div>

      {/* Creation Modal Trigger */}
      <CreateJobModal />
    </div>
  );
}
