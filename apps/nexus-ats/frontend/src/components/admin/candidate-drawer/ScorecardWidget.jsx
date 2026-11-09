// apps/nexus-ats/frontend/src/components/admin/candidate-drawer/ScorecardWidget.jsx

import { useDispatch } from "react-redux";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { updateCandidateRating } from "@/redux/slices/candidateSlice";
import styles from "./ScorecardWidget.module.css";

const FILL_CLASS_MAP = {
  1: styles.fill1,
  2: styles.fill2,
  3: styles.fill3,
  4: styles.fill4,
  5: styles.fill5,
};

const REC_CLASS_MAP = {
  "Strong Hire": styles.recStrongHire,
  Hire: styles.recHire,
  "Review Required": styles.recReview,
  "Do Not Hire": styles.recDoNotHire,
};

export default function ScorecardWidget({ candidate }) {
  const dispatch = useDispatch();

  const currentScore = candidate.rating ?? candidate.score ?? 0;
  const scorecard = candidate.scorecard || {
    technical: currentScore,
    communication: currentScore,
    systemDesign: currentScore,
    recommendation: currentScore >= 4 ? "Hire" : "Review Required",
  };

  const handleRate = (score) => {
    dispatch(
      updateCandidateRating({
        candidateId: candidate.id,
        score,
      }),
    );
    toast.success(`Evaluator score updated to ${score}/5`);
  };

  const recClass = REC_CLASS_MAP[scorecard.recommendation] || styles.recReview;

  return (
    <div className={styles.container}>
      {/* Primary Score Rating Box */}
      <div className={styles.ratingCard}>
        <div className={styles.ratingHeader}>
          <span className={styles.sectionTitle}>Evaluator Scorecard</span>
          {scorecard.recommendation && (
            <span className={`${styles.recommendationBadge} ${recClass}`}>
              {scorecard.recommendation}
            </span>
          )}
        </div>

        <div className={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((starVal) => (
            <button
              key={starVal}
              type="button"
              className={styles.starBtn}
              onClick={() => handleRate(starVal)}
              title={`Rate ${starVal} out of 5 stars`}
              aria-label={`Rate ${starVal} out of 5 stars`}
            >
              <Star
                size={22}
                className={
                  starVal <= currentScore ? styles.starFilled : styles.starEmpty
                }
              />
            </button>
          ))}
        </div>

        <span className={styles.ratingHint}>
          Click any star to update candidate competency rating ({currentScore}
          /5)
        </span>
      </div>

      {/* Sub-Criteria Breakdown */}
      <div className={styles.criteriaGrid}>
        <div className={styles.criteriaRow}>
          <span className={styles.criteriaLabel}>Technical Architecture</span>
          <div className={styles.criteriaMeter}>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${
                  FILL_CLASS_MAP[scorecard.technical] || styles.fill3
                }`}
              />
            </div>
            <span className={styles.criteriaScore}>
              {scorecard.technical}/5
            </span>
          </div>
        </div>

        <div className={styles.criteriaRow}>
          <span className={styles.criteriaLabel}>Communication & Culture</span>
          <div className={styles.criteriaMeter}>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${
                  FILL_CLASS_MAP[scorecard.communication] || styles.fill3
                }`}
              />
            </div>
            <span className={styles.criteriaScore}>
              {scorecard.communication}/5
            </span>
          </div>
        </div>

        <div className={styles.criteriaRow}>
          <span className={styles.criteriaLabel}>
            System Design / Execution
          </span>
          <div className={styles.criteriaMeter}>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${
                  FILL_CLASS_MAP[scorecard.systemDesign] || styles.fill3
                }`}
              />
            </div>
            <span className={styles.criteriaScore}>
              {scorecard.systemDesign}/5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
