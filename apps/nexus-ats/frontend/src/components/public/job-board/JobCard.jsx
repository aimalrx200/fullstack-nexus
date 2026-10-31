import { Link } from "react-router";
import { MapPin, Clock, DollarSign, ArrowRight, Users } from "lucide-react";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";

export default function JobCard({ job, onApplyClick }) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "18px",
        transition: "transform 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "var(--border-default)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border-subtle)";
      }}
    >
      <div>
        {/* Department & Applicant Count */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <Badge variant="primary">{job.department}</Badge>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            <Users size={13} />
            <span>{job.applicantCount} applied</span>
          </div>
        </div>

        {/* Job Title */}
        <Link to={`/jobs/${job.slug}`}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "8px",
              lineHeight: 1.3,
            }}
          >
            {job.title}
          </h3>
        </Link>

        {/* Short Summary */}
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            marginBottom: "16px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {job.summary}
        </p>

        {/* Metadata Badges */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <MapPin size={14} color="var(--primary)" />
            <span>{job.location}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Clock size={14} color="var(--primary)" />
            <span>{job.employmentType}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <DollarSign size={14} color="var(--success)" />
            <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>
              {job.salaryRange}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          to={`/jobs/${job.slug}`}
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "var(--primary)",
          }}
        >
          View Details
        </Link>

        <Button
          size="sm"
          variant="primary"
          icon={ArrowRight}
          iconPosition="right"
          onClick={() => onApplyClick(job)}
        >
          Apply Now
        </Button>
      </div>
    </div>
  );
}
