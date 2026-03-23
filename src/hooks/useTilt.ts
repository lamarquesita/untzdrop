"use client";

import { useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCallback } from "react";

/**
 * 3D tilt effect that responds to mouse position.
 * Returns motion style values + event handlers to spread onto a motion.div.
 *
 * Usage:
 *   const tilt = useTilt();
 *   <motion.div
 *     onMouseMove={tilt.handleMouseMove}
 *     onMouseLeave={tilt.handleMouseLeave}
 *     style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformPerspective: 800 }}
 *   />
 */
export function useTilt(maxDeg = 8) {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(
    useTransform(mouseY, [0, 1], [maxDeg, -maxDeg]),
    { stiffness: 300, damping: 20 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [0, 1], [-maxDeg, maxDeg]),
    { stiffness: 300, damping: 20 }
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  return { rotateX, rotateY, handleMouseMove, handleMouseLeave };
}
