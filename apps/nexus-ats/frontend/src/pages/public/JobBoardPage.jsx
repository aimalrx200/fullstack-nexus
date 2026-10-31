import { useState, useMemo } from "react";
import { Sparkles, Compass } from "lucide-react";
import { MOCK_JOBS } from "@/lib/mockData/jobs.mock";
import { APP_CONFIG } from "@/config/constants";
import JobCard from "@/components/public/job-board/JobCard";
import JobFilters from "@/components/public/job-board/JobFilters";
import ApplicationModal from "@/components/public/application/ApplicationModal";
import styles from "./JobBoardPage.module.css";

export default function JobBoardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedWorkplace, setSelectedWorkplace] = useState("All Locations");
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);

  // Dynamic search and filter logic
  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter((job) => {
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
  }, [searchQuery, selectedDepartment, selectedWorkplace]);

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
          {filteredJobs.length} {filteredJobs.length === 1 ? "role" : "roles"}{" "}
          available
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
          <h3 className={styles.emptyStateTitle}>No matching openings found</h3>
          <p className={styles.emptyStateText}>
            Try clearing your search query or choosing another department to
            view other open roles.
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
