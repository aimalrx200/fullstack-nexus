// src/components/ProgressBar.jsx

import { useEffect, useRef, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export const ProgressBar = ({ isRouterLoading = false }) => {
  const isMutating = useIsMutating();
  const isFetching = useIsFetching({
    predicate: (query) => {
      const isAuthQuery = query.queryKey[0] === "authUser";
      return query.state.status === "pending" && !isAuthQuery;
    },
  });

  const activeTasks = (isRouterLoading ? 1 : 0) + isFetching + isMutating;
  const isNavigating = activeTasks > 0;

  const [progress, setProgress] = useState(0);
  const maxTasksRef = useRef(0);
  const animationFrameRef = useRef(null);
  const targetProgressRef = useRef(0);

  useEffect(() => {
    let hideTimer;

    if (isNavigating) {
      if (activeTasks > maxTasksRef.current) {
        maxTasksRef.current = activeTasks;
      }

      const peak = maxTasksRef.current;
      const completed = peak - activeTasks;

      const calculatedTarget = Math.round(20 + (completed / peak) * 72);
      targetProgressRef.current = Math.max(
        targetProgressRef.current,
        calculatedTarget,
      );

      const step = () => {
        setProgress((prev) => {
          const target = targetProgressRef.current;
          if (prev >= target) return prev;

          const diff = target - prev;
          const next = prev + Math.max(0.5, diff * 0.15);
          return next >= target ? target : next;
        });

        animationFrameRef.current = requestAnimationFrame(step);
      };

      animationFrameRef.current = requestAnimationFrame(step);
    } else {
      // Only sweep to 100% if we actually started progress
      if (targetProgressRef.current > 0 || maxTasksRef.current > 0) {
        targetProgressRef.current = 100;

        const finishStep = () => {
          let shouldContinue = true;

          setProgress((prev) => {
            if (prev >= 100) {
              shouldContinue = false;
              return 100;
            }
            const diff = 100 - prev;
            const next = prev + Math.max(2, diff * 0.25);
            if (next >= 100) {
              shouldContinue = false;
              return 100;
            }
            return next;
          });

          if (shouldContinue) {
            animationFrameRef.current = requestAnimationFrame(finishStep);
          } else {
            // Once 100% is reached, wait 300ms for fade transition, then reset completely
            hideTimer = setTimeout(() => {
              setProgress(0);
              targetProgressRef.current = 0;
              maxTasksRef.current = 0;
            }, 300);
          }
        };

        animationFrameRef.current = requestAnimationFrame(finishStep);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
    };
  }, [isNavigating, activeTasks]);

  if (progress === 0 && !isNavigating) return null;

  return (
    <div className="progress-bar-container">
      <div
        className="progress-bar-fill"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      >
        {/* Leading Cyberpunk Laser Tip Effect */}
        <div className="progress-bar-tip" />
      </div>
    </div>
  );
};
