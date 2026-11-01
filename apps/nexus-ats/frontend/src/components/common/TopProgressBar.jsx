// apps/nexus-ats/frontend/src/components/common/TopProgressBar.jsx

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigation } from "react-router";
import styles from "./TopProgressBar.module.css";

const START_DELAY_MS = 150;
const TRICKLE_INTERVAL_MS = 250;
const MAX_TRICKLE_PERCENT = 88;

export default function TopProgressBar() {
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(false);

  const barRef = useRef(null);
  const progressRef = useRef(0);
  const startTimerRef = useRef(null);
  const trickleTimerRef = useRef(null);
  const finishTimerRef = useRef(null);

  const updateProgress = useCallback((val) => {
    progressRef.current = Math.max(progressRef.current, val);
    if (barRef.current) {
      barRef.current.style.width = `${progressRef.current}%`;
    }
  }, []);

  const startTrickling = useCallback(() => {
    clearInterval(trickleTimerRef.current);
    trickleTimerRef.current = setInterval(() => {
      if (progressRef.current < MAX_TRICKLE_PERCENT) {
        // Diminishing returns: increments get smaller as progress approaches 88%
        const delta = (MAX_TRICKLE_PERCENT - progressRef.current) * 0.12;
        updateProgress(progressRef.current + Math.max(delta, 0.5));
      }
    }, TRICKLE_INTERVAL_MS);
  }, [updateProgress]);

  const completeAndFade = useCallback(() => {
    clearTimeout(startTimerRef.current);
    clearInterval(trickleTimerRef.current);

    // Jump to 100% completion
    updateProgress(100);

    // Fade out after completion transition
    finishTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      // Reset width back to 0% after fully invisible
      setTimeout(() => {
        progressRef.current = 0;
        if (barRef.current) {
          barRef.current.style.width = "0%";
        }
      }, 200);
    }, 200);
  }, [updateProgress]);

  useEffect(() => {
    const isLoading =
      navigation.state === "loading" || navigation.state === "submitting";

    if (isLoading) {
      clearTimeout(finishTimerRef.current);

      // Debounce appearance: do not show if navigation finishes under 150ms
      startTimerRef.current = setTimeout(() => {
        setIsVisible(true);
        updateProgress(18);
        startTrickling();
      }, START_DELAY_MS);
    } else {
      if (isVisible) {
        completeAndFade();
      } else {
        clearTimeout(startTimerRef.current);
      }
    }

    return () => {
      clearTimeout(startTimerRef.current);
      clearInterval(trickleTimerRef.current);
      clearTimeout(finishTimerRef.current);
    };
  }, [
    navigation.state,
    isVisible,
    completeAndFade,
    startTrickling,
    updateProgress,
  ]);

  return (
    <div
      className={`${styles.container} ${isVisible ? styles.visible : ""}`}
      aria-hidden="true"
    >
      <div ref={barRef} className={styles.bar} />
    </div>
  );
}
