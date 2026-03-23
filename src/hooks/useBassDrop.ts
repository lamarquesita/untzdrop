"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Triple-click easter egg that triggers a "bass drop" effect.
 * Returns: { onClick, isDropping, showToast }
 *
 * When triggered:
 * 1. Screen shakes via CSS animation on <body>
 * 2. Flash overlay appears
 * 3. Optional toast with hidden content
 */
export function useBassDrop() {
  const clickCount = useRef(0);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [isDropping, setIsDropping] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const triggerDrop = useCallback(() => {
    setIsDropping(true);
    setShowToast(true);

    // Add shake class to body
    document.body.classList.add("bass-drop-shake");

    // Clean up after animation
    setTimeout(() => {
      document.body.classList.remove("bass-drop-shake");
      setIsDropping(false);
    }, 600);

    // Hide toast after a few seconds
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  }, []);

  const onClick = useCallback(() => {
    clickCount.current += 1;

    if (timer.current) clearTimeout(timer.current);

    if (clickCount.current >= 3) {
      clickCount.current = 0;
      triggerDrop();
    } else {
      timer.current = setTimeout(() => {
        clickCount.current = 0;
      }, 500);
    }
  }, [triggerDrop]);

  return { onClick, isDropping, showToast, dismissToast: () => setShowToast(false) };
}
