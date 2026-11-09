// apps/nexus-ats/frontend/src/components/admin/pipeline/KanbanColumn.jsx

import { Droppable } from "@hello-pangea/dnd";
import { Inbox } from "lucide-react";
import CandidateCard from "./CandidateCard";
import styles from "./KanbanColumn.module.css";

const STAGE_DOT_CLASS_MAP = {
  applied: styles.dotApplied,
  screen: styles.dotScreen,
  interview: styles.dotInterview,
  offer: styles.dotOffer,
  rejected: styles.dotRejected,
};

export default function KanbanColumn({ stage, candidates = [] }) {
  const dotClass = STAGE_DOT_CLASS_MAP[stage.id] || styles.dotApplied;

  return (
    <Droppable droppableId={stage.id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`${styles.column} ${
            snapshot.isDraggingOver ? styles.columnDraggingOver : ""
          }`}
          aria-label={`${stage.title} column with ${candidates.length} candidates`}
        >
          {/* Column Header */}
          <div className={styles.headerContainer}>
            <div className={styles.headerRow}>
              <div className={styles.headerTitleGroup}>
                <span className={`${styles.stageDot} ${dotClass}`} />
                <h3 className={styles.columnTitle}>{stage.title}</h3>
              </div>
              <span className={styles.columnCount}>{candidates.length}</span>
            </div>
            {stage.description && (
              <p className={styles.columnDescription}>{stage.description}</p>
            )}
          </div>

          {/* Cards Drop Target */}
          <div className={styles.cardList}>
            {candidates.map((candidate, index) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                index={index}
              />
            ))}

            {candidates.length === 0 && (
              <div className={styles.emptyDropZone}>
                <Inbox size={20} />
                <span className={styles.emptyText}>No applicants here</span>
              </div>
            )}

            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}
