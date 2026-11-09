// apps/nexus-ats/frontend/src/components/admin/pipeline/BoardSkeleton.jsx

import styles from "./BoardSkeleton.module.css";

// 5 Columns matching PIPELINE_STAGE_KEYS with realistic organic card counts
const SKELETON_COLUMNS = [
  { id: "col-applied", cardCount: 3 },
  { id: "col-screen", cardCount: 2 },
  { id: "col-interview", cardCount: 3 },
  { id: "col-offer", cardCount: 2 },
  { id: "col-rejected", cardCount: 1 },
];

export default function BoardSkeleton() {
  return (
    <div
      className={styles.skeletonWrapper}
      aria-busy="true"
      aria-label="Loading candidate pipeline"
    >
      <div className={styles.skeletonBoard}>
        {SKELETON_COLUMNS.map((column) => (
          <div key={column.id} className={styles.skeletonColumn}>
            {/* Column Header Placeholder */}
            <div className={styles.columnHeader}>
              <div className={styles.headerLeft}>
                <div className={`${styles.stageDot} ${styles.pulse}`} />
                <div className={`${styles.titlePlaceholder} ${styles.pulse}`} />
              </div>
              <div className={`${styles.counterPlaceholder} ${styles.pulse}`} />
            </div>

            {/* Candidate Card Placeholders */}
            <div className={styles.cardList}>
              {Array.from({ length: column.cardCount }).map((_, index) => (
                <div key={index} className={styles.cardPlaceholder}>
                  <div className={styles.cardTopRow}>
                    <div className={`${styles.avatar} ${styles.pulse}`} />
                    <div className={styles.nameAndJob}>
                      <div className={`${styles.nameLine} ${styles.pulse}`} />
                      <div className={`${styles.jobLine} ${styles.pulse}`} />
                    </div>
                  </div>

                  <div className={styles.tagsRow}>
                    <div className={`${styles.tagPill} ${styles.pulse}`} />
                    <div className={`${styles.tagPill} ${styles.pulse}`} />
                    <div className={`${styles.tagPill} ${styles.pulse}`} />
                  </div>

                  <div className={styles.cardFooter}>
                    <div
                      className={`${styles.starsPlaceholder} ${styles.pulse}`}
                    />
                    <div
                      className={`${styles.datePlaceholder} ${styles.pulse}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
