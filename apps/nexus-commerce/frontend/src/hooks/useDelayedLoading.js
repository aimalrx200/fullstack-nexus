// apps/nexus-commerce/frontend/src/hooks/useDelayedLoading.js

import { useState, useEffect, useRef } from "react";

/**
 * Prevents skeleton flashing on fast queries (<150ms)
 * and guarantees a minimum visible duration (3000ms) to prevent strobe flickers.
 */
export function useDelayedLoading(
  isLoading,
  { delay = 150, minDuration = 3000 } = {},
) {
  const [shouldShow, setShouldShow] = useState(false);
  const startTimeRef = useRef(null);

  useEffect(() => {
    let delayTimer = null;
    let minDurationTimer = null;

    if (isLoading) {
      // Delay showing skeleton to let fast requests resolve silently
      delayTimer = setTimeout(() => {
        startTimeRef.current = Date.now();
        setShouldShow(true);
      }, delay);
    } else {
      if (delayTimer) clearTimeout(delayTimer);

      if (startTimeRef.current) {
        // If skeleton appeared, keep it visible for at least minDuration
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, minDuration - elapsed);

        minDurationTimer = setTimeout(() => {
          setShouldShow(false);
          startTimeRef.current = null;
        }, remaining);
      } else {
        setShouldShow(false);
      }
    }

    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      if (minDurationTimer) clearTimeout(minDurationTimer);
    };
  }, [isLoading, delay, minDuration]);

  return shouldShow;
}
