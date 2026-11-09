// apps/nexus-ats/frontend/src/components/admin/candidate-drawer/ActivityLogTimeline.jsx

import styles from "./ActivityLogTimeline.module.css";

export default function ActivityLogTimeline({ candidate }) {
  // Use existing timeline or generate structured default entries from application date
  const events =
    candidate.timeline && candidate.timeline.length > 0
      ? candidate.timeline
      : [
          {
            id: "tl-base-1",
            type: "application_submitted",
            note: "Inbound application received via Nexus Careers Portal",
            timestamp: candidate.appliedDate || "2026-10-21",
          },
          {
            id: "tl-base-2",
            type: "stage_change",
            note: `Candidate advanced to ${candidate.stage?.toUpperCase()} stage`,
            timestamp:
              candidate.updatedAt || candidate.appliedDate || "2026-10-22",
          },
        ];

  return (
    <div className={styles.container}>
      <div className={styles.timeline}>
        {events.map((event) => (
          <div key={event.id} className={styles.timelineItem}>
            <div className={styles.dot} />
            <div className={styles.itemHeader}>
              <span className={styles.eventTitle}>
                {event.type === "stage_change"
                  ? "Stage Progression"
                  : "Application Received"}
              </span>
              <span className={styles.eventTime}>{event.timestamp}</span>
            </div>
            <p className={styles.eventNote}>{event.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
