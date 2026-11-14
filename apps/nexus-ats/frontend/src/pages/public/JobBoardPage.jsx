// apps/nexus-ats/frontend/src/pages/public/JobBoardPage.jsx

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sparkles, Compass } from "lucide-react";
import { APP_CONFIG } from "@/config/constants";
import { fetchJobs, selectAllJobs } from "@/redux/slices/jobSlice";
import JobCard from "@/components/public/job-board/JobCard";
import JobFilters from "@/components/public/job-board/JobFilters";
import ApplicationModal from "@/components/public/application/ApplicationModal";
import styles from "./JobBoardPage.module.css";

export default function JobBoardPage() {
  const dispatch = useDispatch();
  const jobs = useSelector(selectAllJobs);
  const loading = useSelector((state) => state.jobs.loading);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedWorkplace, setSelectedWorkplace] = useState("All Locations");
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);

  // Fetch live jobs on initial mount
  useEffect(() => {
    dispatch(fetchJobs({ status: "Active" }));
  }, [dispatch]);

  // Dynamic search and filter logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Only show Active jobs to candidates on public board
      if (job.status && job.status.toLowerCase() !== "active") return false;

      const matchesSearch =
        searchQuery === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.summary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept =
        selectedDepartment === "All Departments" ||
        job.department === selectedDepartment;

      const matchesWorkplace =
        selectedWorkplace === "All Locations" ||
        job.workplaceType === selectedWorkplace;

      return matchesSearch && matchesDept && matchesWorkplace;
    });
  }, [jobs, searchQuery, selectedDepartment, selectedWorkplace]);

  return (
    <div className={styles.pageContainer}>
      {/* Hero Header */}
      <section className={styles.heroSection}>
        <div className={`ats-badge ats-badge-primary ${styles.heroBadge}`}>
          <Sparkles size={13} className={styles.heroBadgeIcon} />
          <span>We are actively hiring world-class talent</span>
        </div>

        <h1 className={styles.heroTitle}>
          Build the next era of infrastructure at {APP_CONFIG.companyName}
        </h1>

        <p className={styles.heroSubtitle}>
          Join our distributed engineering, design, and product pods building
          resilient cloud software.
        </p>
      </section>

      {/* Interactive Search & Filter Suite */}
      <JobFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        selectedWorkplace={selectedWorkplace}
        onWorkplaceChange={setSelectedWorkplace}
        onClearFilters={() => {
          setSearchQuery("");
          setSelectedDepartment("All Departments");
          setSelectedWorkplace("All Locations");
        }}
      />

      {/* Results Header */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Available Openings</h2>
        <span className={styles.jobCount}>
          {loading
            ? "Loading positions..."
            : `${filteredJobs.length} ${filteredJobs.length === 1 ? "role" : "roles"} available`}
        </span>
      </div>

      {/* Positions Grid */}
      {filteredJobs.length > 0 ? (
        <div className={styles.jobsGrid}>
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApplyClick={(selected) => setSelectedJobToApply(selected)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className={`glass-panel ${styles.emptyState}`}>
          <Compass size={36} color="var(--text-muted)" />
          <h3 className={styles.emptyStateTitle}>
            {loading
              ? "Fetching opportunities..."
              : "No matching openings found"}
          </h3>
          <p className={styles.emptyStateText}>
            {loading
              ? "Connecting to the Nexus ATS talent engine..."
              : "Try clearing your search query or choosing another department to view other open roles."}
          </p>
        </div>
      )}

      {/* Application Intake Modal */}
      <ApplicationModal
        job={selectedJobToApply}
        isOpen={Boolean(selectedJobToApply)}
        onClose={() => setSelectedJobToApply(null)}
      />
    </div>
  );
}
