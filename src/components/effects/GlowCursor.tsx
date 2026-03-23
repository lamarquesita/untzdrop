"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Radial glow that follows the cursor.
 * Uses transform only — no layout recalc, pure compositor layer.
 * Automatically hidden on touch devices.
 */
export default function GlowCursor() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });
  const visible = useRef(true);

  useEffect(() => {
    // Hide on touch devices
    if ("ontouchstart" in window) {
      visible.current = false;
      return;
    }

    const handleMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [x, y]);

  if (typeof window !== "undefined" && "ontouchstart" in window) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[9999]"
      aria-hidden
    >
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, rgba(236,130,23,0.06) 0%, rgba(236,130,23,0.02) 40%, transparent 70%)",
          willChange: "transform",
        }}
      />
    </motion.div>
  );
}
