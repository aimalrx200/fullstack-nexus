// apps/nexus-ats/frontend/src/components/admin/candidate-drawer/CandidateHeader.jsx

import { useDispatch } from "react-redux";
import { Mail, Phone, MapPin, ExternalLink, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { moveCandidateStage } from "@/redux/slices/candidateSlice";
import { MOCK_STAGES } from "@/lib/mockData/stages.mock";
import styles from "./CandidateHeader.module.css";

export default function CandidateHeader({ candidate }) {
  const dispatch = useDispatch();

  const handleStageChange = (e) => {
    const newStageId = e.target.value;
    if (newStageId !== candidate.stage) {
      dispatch(
        moveCandidateStage({
          candidateId: candidate.id,
          newStageId,
        }),
      );
      const stageObj = MOCK_STAGES.find((s) => s.id === newStageId);
      toast.success(
        `Stage updated to ${stageObj?.title || newStageId.toUpperCase()}`,
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileRow}>
        <div className={styles.avatar}>
          {candidate.avatar ? (
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className={styles.avatarImg}
            />
          ) : (
            candidate.name?.charAt(0) || "C"
          )}
        </div>

        <div className={styles.titleArea}>
          <h2 className={styles.name}>{candidate.name}</h2>
          <span className={styles.jobTitle}>{candidate.jobTitle}</span>
        </div>
      </div>

      {/* Manual Stage Mover (A11y & Quick Navigation) */}
      <div className={styles.stageControlRow}>
        <span className={styles.stageLabel}>Current Stage</span>
        <div className={styles.stageSelectWrapper}>
          <select
            className={styles.stageSelect}
            value={candidate.stage}
            onChange={handleStageChange}
            aria-label="Change candidate pipeline stage"
          >
            {MOCK_STAGES.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.title}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className={styles.stageChevron} />
        </div>
      </div>

      {/* Contact Channels */}
      <div className={styles.contactChips}>
        {candidate.email && (
          <a
            href={`mailto:${candidate.email}`}
            className={styles.chip}
            title={candidate.email}
          >
            <Mail size={13} color="var(--primary)" />
            <span>{candidate.email}</span>
          </a>
        )}

        {candidate.phone && (
          <a
            href={`tel:${candidate.phone}`}
            className={styles.chip}
            title={candidate.phone}
          >
            <Phone size={13} color="var(--success)" />
            <span>{candidate.phone}</span>
          </a>
        )}

        {candidate.location && (
          <span className={styles.chip} title={candidate.location}>
            <MapPin size={13} color="var(--warning)" />
            <span>{candidate.location}</span>
          </span>
        )}

        {candidate.portfolioUrl && (
          <a
            href={candidate.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.chip}
          >
            <ExternalLink size={13} />
            <span>Portfolio / Profile</span>
          </a>
        )}
      </div>
    </div>
  );
}
