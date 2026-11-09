// apps/nexus-ats/frontend/src/components/admin/pipeline/CandidateCard.jsx

import { Draggable } from "@hello-pangea/dnd";
import { useDispatch } from "react-redux";
import { Star, FileText } from "lucide-react";
import { setSelectedCandidateId } from "@/redux/slices/candidateSlice";
import { openCandidateDrawer } from "@/redux/slices/uiSlice";
import styles from "./CandidateCard.module.css";

const MAX_VISIBLE_TAGS = 3;

export default function CandidateCard({ candidate, index }) {
  const dispatch = useDispatch();

  const handleCardClick = () => {
    dispatch(setSelectedCandidateId(candidate.id));
    dispatch(openCandidateDrawer());
  };

  const rating = candidate.rating ?? candidate.score ?? 0;
  const tags = candidate.tags || [];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const remainingTagsCount = tags.length - MAX_VISIBLE_TAGS;

  return (
    <Draggable draggableId={candidate.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${styles.card} ${
            snapshot.isDragging ? styles.cardDragging : ""
          }`}
          onClick={handleCardClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleCardClick();
            }
          }}
          aria-label={`Candidate ${candidate.name}, applied for ${candidate.jobTitle}`}
        >
          {/* Header Row: Avatar, Name & Target Role */}
          <div className={styles.headerRow}>
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

            <div className={styles.infoCol}>
              <div className={styles.nameRow}>
                <span className={styles.candidateName}>{candidate.name}</span>
                {candidate.experienceYears !== undefined && (
                  <span className={styles.experienceBadge}>
                    {candidate.experienceYears}y exp
                  </span>
                )}
              </div>
              <span className={styles.targetRole}>{candidate.jobTitle}</span>
            </div>
          </div>

          {/* Skill Tag Pills */}
          {tags.length > 0 && (
            <div className={styles.tagsRow}>
              {visibleTags.map((tag, i) => (
                <span key={i} className={styles.tagPill}>
                  {tag}
                </span>
              ))}
              {remainingTagsCount > 0 && (
                <span className={styles.tagPillMore}>
                  +{remainingTagsCount}
                </span>
              )}
            </div>
          )}

          {/* Footer: Rating Stars, Applied Date & Resume Attachment */}
          <div className={styles.cardFooter}>
            <div
              className={styles.ratingStars}
              aria-label={`Score ${rating} out of 5`}
            >
              {[1, 2, 3, 4, 5].map((starVal) => (
                <Star
                  key={starVal}
                  size={12}
                  className={
                    starVal <= rating ? styles.starFilled : styles.starEmpty
                  }
                />
              ))}
            </div>

            <div className={styles.footerRight}>
              {candidate.appliedDate && (
                <span className={styles.dateText}>{candidate.appliedDate}</span>
              )}
              {candidate.resumeUrl && (
                <span
                  className={styles.resumeIndicator}
                  title="PDF Resume Attached"
                >
                  <FileText size={11} />
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
