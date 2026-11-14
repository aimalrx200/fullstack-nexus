// apps/nexus-ats/frontend/src/pages/admin/AdminDashboardPage.jsx

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Briefcase,
  TrendingUp,
  Award,
  Star,
  Kanban,
  FileCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  fetchCandidates,
  selectAllCandidates,
} from "@/redux/slices/candidateSlice";
import { fetchJobs, selectAllJobs } from "@/redux/slices/jobSlice";
import { analyticsApi } from "@/lib/api/analyticsApi";
import { DEPARTMENTS } from "@/config/constants";
import styles from "./AdminDashboardPage.module.css";

const STAGE_COLORS = {
  applied: "#3b82f6",
  screen: "#8b5cf6",
  interview: "#0ea5e9",
  offer: "#10b981",
  rejected: "#ef4444",
};

function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className={styles.customTooltip}>
        <span className={styles.tooltipLabel}>{label || item?.name}</span>
        <span className={styles.tooltipValue}>
          {item?.value} {item?.name === "jobs" ? "openings" : "candidates"}
        </span>
      </div>
    );
  }
  return null;
}

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const candidates = useSelector(selectAllCandidates);
  const jobs = useSelector(selectAllJobs);

  const [serverAnalytics, setServerAnalytics] = useState(null);

  useEffect(() => {
    dispatch(fetchCandidates());
    dispatch(fetchJobs());

    analyticsApi
      .getOverview()
      .then((data) => setServerAnalytics(data))
      .catch(() => {});
  }, [dispatch]);

  // Derived Real-Time KPI Metrics
  const metrics = useMemo(() => {
    const totalCandidates = candidates.length;
    const activeJobs = jobs.filter(
      (j) => j.status?.toLowerCase() === "active",
    ).length;

    const advancedCandidates = candidates.filter(
      (c) => c.stage === "interview" || c.stage === "offer",
    ).length;
    const interviewConversion = totalCandidates
      ? Math.round((advancedCandidates / totalCandidates) * 100)
      : 0;

    const offerCandidates = candidates.filter(
      (c) => c.stage === "offer",
    ).length;
    const offerRate = totalCandidates
      ? Math.round((offerCandidates / totalCandidates) * 100)
      : 0;

    const ratedCandidates = candidates.filter(
      (c) => (c.rating ?? c.score ?? 0) > 0,
    );
    const avgScore = ratedCandidates.length
      ? (
          ratedCandidates.reduce(
            (acc, c) => acc + (c.rating ?? c.score ?? 0),
            0,
          ) / ratedCandidates.length
        ).toFixed(1)
      : "0.0";

    return {
      totalCandidates,
      activeJobs,
      interviewConversion,
      offerRate,
      avgScore,
    };
  }, [candidates, jobs]);

  // Funnel Data
  const stageFunnelData = useMemo(() => {
    if (serverAnalytics?.stageFunnel && candidates.length === 0) {
      return serverAnalytics.stageFunnel;
    }

    const stageCounts = {
      applied: 0,
      screen: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };
    candidates.forEach((c) => {
      if (stageCounts[c.stage] !== undefined) stageCounts[c.stage] += 1;
      else stageCounts.applied += 1;
    });

    return [
      { name: "New Applied", key: "applied", count: stageCounts.applied },
      { name: "Phone Screen", key: "screen", count: stageCounts.screen },
      {
        name: "Technical Interview",
        key: "interview",
        count: stageCounts.interview,
      },
      { name: "Offer Extended", key: "offer", count: stageCounts.offer },
      { name: "Archived", key: "rejected", count: stageCounts.rejected },
    ];
  }, [candidates, serverAnalytics]);

  // Department Velocity Data
  const departmentBreakdownData = useMemo(() => {
    const activeDepts = DEPARTMENTS.filter((d) => d !== "All Departments");
    return activeDepts
      .map((dept) => {
        const deptJobs = jobs.filter((j) => j.department === dept);
        const deptJobIds = new Set(deptJobs.map((j) => j.id));
        const candidateCount = candidates.filter(
          (c) => deptJobIds.has(c.jobId) || c.tags?.includes(dept),
        ).length;

        return {
          name: dept,
          candidates: candidateCount,
          jobs: deptJobs.length,
        };
      })
      .filter((d) => d.candidates > 0 || d.jobs > 0);
  }, [candidates, jobs]);

  // Recommendation Sentiment
  const recommendations = useMemo(() => {
    const total = candidates.length || 1;
    const strongHire = candidates.filter(
      (c) => c.scorecard?.recommendation === "Strong Hire",
    ).length;
    const hire = candidates.filter(
      (c) => c.scorecard?.recommendation === "Hire",
    ).length;
    const review = candidates.filter(
      (c) =>
        c.scorecard?.recommendation === "Review Required" ||
        !c.scorecard?.recommendation,
    ).length;
    const doNotHire = candidates.filter(
      (c) => c.scorecard?.recommendation === "Do Not Hire",
    ).length;

    const toClass = (val) => {
      const pct = Math.round((val / total) * 10) * 10;
      return styles[`pct${Math.min(Math.max(pct, 0), 100)}`] || styles.pct10;
    };

    return [
      {
        label: "Strong Hire",
        count: strongHire,
        tagClass: styles.tagStrongHire,
        fillClass: styles.fillSuccess,
        pctClass: toClass(strongHire),
      },
      {
        label: "Hire",
        count: hire,
        tagClass: styles.tagHire,
        fillClass: styles.fillPrimary,
        pctClass: toClass(hire),
      },
      {
        label: "Review Required",
        count: review,
        tagClass: styles.tagReview,
        fillClass: styles.fillWarning,
        pctClass: toClass(review),
      },
      {
        label: "Do Not Hire",
        count: doNotHire,
        tagClass: styles.tagDoNotHire,
        fillClass: styles.fillDanger,
        pctClass: toClass(doNotHire),
      },
    ];
  }, [candidates]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerSection}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Recruitment Analytics</h1>
          <p className={styles.subtitle}>
            Executive metrics on hiring velocity, funnel throughput, and
            candidate quality.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link to="/admin/pipeline" className={styles.actionLink}>
            <Kanban size={14} />
            <span>Talent Pipeline</span>
          </Link>
          <Link
            to="/admin/jobs"
            className={`${styles.actionLink} ${styles.actionLinkPrimary}`}
          >
            <Briefcase size={14} />
            <span>Job Requisitions</span>
          </Link>
        </div>
      </div>

      {/* Top-Level KPI Metric Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={`${styles.kpiIconWrapper} ${styles.iconPrimary}`}>
              <Users size={17} />
            </div>
            <span className={styles.kpiTrendBadge}>+14% MoM</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{metrics.totalCandidates}</span>
            <span className={styles.kpiLabel}>Inbound Talent Pool</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={`${styles.kpiIconWrapper} ${styles.iconSuccess}`}>
              <Briefcase size={17} />
            </div>
            <span className={styles.kpiTrendBadge}>100% Active</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{metrics.activeJobs}</span>
            <span className={styles.kpiLabel}>Open Requisitions</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={`${styles.kpiIconWrapper} ${styles.iconInfo}`}>
              <TrendingUp size={17} />
            </div>
            <span className={styles.kpiTrendBadge}>Healthy</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>
              {metrics.interviewConversion}%
            </span>
            <span className={styles.kpiLabel}>Interview Progression</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={`${styles.kpiIconWrapper} ${styles.iconSuccess}`}>
              <Award size={17} />
            </div>
            <span className={styles.kpiTrendBadge}>Top 10%</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{metrics.offerRate}%</span>
            <span className={styles.kpiLabel}>Offer Extension Rate</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={`${styles.kpiIconWrapper} ${styles.iconWarning}`}>
              <Star size={17} />
            </div>
            <span className={styles.kpiTrendBadge}>Evaluated</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{metrics.avgScore} / 5</span>
            <span className={styles.kpiLabel}>Avg Evaluator Score</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Hiring Funnel Progression</h2>
              <span className={styles.chartSubtitle}>
                Candidates across active recruitment lifecycle stages
              </span>
            </div>
          </div>

          <div className={styles.chartCanvas}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stageFunnelData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stageFunnelData.map((entry) => (
                    <Cell
                      key={`cell-${entry.key}`}
                      fill={STAGE_COLORS[entry.key] || "#6366f1"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Department Hiring Velocity</h2>
              <span className={styles.chartSubtitle}>
                Applicant distribution across organizational pods
              </span>
            </div>
          </div>

          <div className={styles.chartCanvas}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentBreakdownData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar
                  dataKey="candidates"
                  name="candidates"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Evaluator Sentiment Panel */}
      <div className={styles.healthCard}>
        <div className={styles.chartHeader}>
          <div>
            <h2 className={styles.chartTitle}>
              Evaluator Sentiment & Hiring Health
            </h2>
            <span className={styles.chartSubtitle}>
              Distribution of recruiter scorecard recommendations across the
              active pool
            </span>
          </div>
          <FileCheck size={18} color="var(--primary)" />
        </div>

        <div className={styles.healthGrid}>
          {recommendations.map((rec) => (
            <div key={rec.label} className={styles.healthItem}>
              <div className={styles.healthItemHeader}>
                <span className={`${styles.healthTag} ${rec.tagClass}`}>
                  {rec.label}
                </span>
                <span className={styles.healthCount}>
                  {rec.count} candidates
                </span>
              </div>
              <div className={styles.healthMeterTrack}>
                <div
                  className={`${styles.healthMeterFill} ${rec.fillClass} ${rec.pctClass}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
