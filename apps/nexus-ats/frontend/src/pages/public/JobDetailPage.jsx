// apps/nexus-ats/frontend/src/pages/public/JobDetailPage.jsx

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { selectAllJobs } from "@/redux/slices/jobSlice";
import { jobApi } from "@/lib/api/jobApi";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import ApplicationModal from "@/components/public/application/ApplicationModal";
import styles from "./JobDetailPage.module.css";

export default function JobDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const storeJobs = useSelector(selectAllJobs);
  const [job, setJob] = useState(
    () => storeJobs.find((j) => j.slug === slug) || null,
  );
  const [loading, setLoading] = useState(!job);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadJob = async () => {
      // Check existing store job first
      const foundInStore = storeJobs.find((j) => j.slug === slug);
      if (foundInStore) {
        setJob(foundInStore);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await jobApi.getJobBySlugOrId(slug);
        if (isMounted && data.job) {
          setJob(data.job);
        }
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        if (isMounted) setJob(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadJob();
    return () => {
      isMounted = false;
    };
  }, [slug, storeJobs]);

  if (loading) {
    return (
      <div className={styles.notFoundContainer}>
        <h2 className={styles.notFoundTitle}>Loading Position...</h2>
        <p className={styles.notFoundSubtitle}>
          Retrieving job requisition specifications.
        </p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className={styles.notFoundContainer}>
        <h2 className={styles.notFoundTitle}>Position Not Found</h2>
        <p className={styles.notFoundSubtitle}>
          The position you are looking for may have been filled or archived.
        </p>
        <Button variant="primary" onClick={() => navigate("/")}>
          Return to Careers
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Back Link */}
      <Link to="/" className={styles.backLink}>
        <ArrowLeft size={16} />
        <span>Back to all open positions</span>
      </Link>

      <div className={styles.layoutGrid}>
        {/* Left Column: Full Job Details */}
        <div className={styles.mainContent}>
          <div className={styles.badgeRow}>
            <Badge variant="primary">{job.department}</Badge>
            <Badge variant="success">{job.workplaceType}</Badge>
          </div>

          <h1 className={styles.jobTitle}>{job.title}</h1>

          <p className={styles.jobSummary}>{job.summary}</p>

          {/* Responsibilities Section */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <section className={styles.specSection}>
              <h2 className={styles.sectionHeading}>Key Responsibilities</h2>
              <ul className={styles.itemList}>
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className={styles.item}>
                    <CheckCircle size={16} className={styles.checkIcon} />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Requirements Section */}
          {job.requirements && job.requirements.length > 0 && (
            <section className={styles.specSection}>
              <h2 className={styles.sectionHeading}>Required Qualifications</h2>
              <ul className={styles.itemList}>
                {job.requirements.map((req, i) => (
                  <li key={i} className={styles.item}>
                    <CheckCircle size={16} className={styles.checkIcon} />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Perks Section */}
          {job.benefits && job.benefits.length > 0 && (
            <section className={styles.specSection}>
              <h2 className={styles.sectionHeading}>Perks & Total Rewards</h2>
              <ul className={styles.itemList}>
                {job.benefits.map((benefit, i) => (
                  <li key={i} className={styles.item}>
                    <ShieldCheck size={16} className={styles.perkIcon} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right Column: Sticky Application Box */}
        <aside className={`glass-panel ${styles.sidebarCard}`}>
          <div className={styles.compensationBox}>
            <span className={styles.compensationLabel}>
              Target Compensation
            </span>
            <span className={styles.compensationValue}>{job.salaryRange}</span>
          </div>

          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <MapPin size={16} color="var(--primary)" />
              <span>{job.location}</span>
            </div>
            <div className={styles.metaItem}>
              <Clock size={16} color="var(--primary)" />
              <span>
                {job.employmentType} • {job.experienceLevel}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className={styles.applyBtn}
            onClick={() => setIsApplyModalOpen(true)}
          >
            Apply for this Role
          </Button>
        </aside>
      </div>

      {/* Application Intake Modal */}
      <ApplicationModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
}
