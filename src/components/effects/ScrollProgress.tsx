"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Glowing orange progress bar at the very top of the viewport.
 * Tracks page scroll progress.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[9998] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #EA580B, #D946EF)",
        boxShadow: "0 0 8px rgba(236,130,23,0.5), 0 0 20px rgba(236,130,23,0.2)",
      }}
    />
  );
}
