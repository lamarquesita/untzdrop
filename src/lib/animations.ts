"use client";

import { Variants, Transition, useScroll, useTransform, useSpring } from "framer-motion";

// ─── Spring presets ────────────────────────────────────────────
export const springs = {
  /** Snappy — buttons, chips, small elements */
  snappy: { type: "spring", stiffness: 400, damping: 30 } as Transition,
  /** Smooth — cards, sections, medium weight */
  smooth: { type: "spring", stiffness: 200, damping: 24, mass: 0.8 } as Transition,
  /** Gentle — large sections, heavy elements */
  gentle: { type: "spring", stiffness: 120, damping: 20, mass: 1 } as Transition,
  /** Bouncy — playful micro-interactions */
  bouncy: { type: "spring", stiffness: 300, damping: 15, mass: 0.6 } as Transition,
};

// ─── Reusable variant sets ─────────────────────────────────────

/** Fade up with blur — the Linear.app signature entrance */
export const fadeUpBlur: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
};

/** Fade up without blur — cleaner, for body text */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/** Scale fade — for cards and images */
export const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

/** Stagger container — wrap children that use the above variants */
export const staggerContainer = (
  staggerChildren = 0.08,
  delayChildren = 0
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

/** Slide in from left */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

/** Slide in from right */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

// ─── Scroll-linked parallax helper ────────────────────────────
/**
 * Returns a smoothed MotionValue that maps scroll progress
 * through an element to an output range.
 *
 * Usage:
 *   const ref = useRef(null);
 *   const value = useParallax(ref, ["0%", "-15%"]);
 *   <motion.div ref={ref} style={{ y: value }} />
 */
export function useParallax(
  target: React.RefObject<HTMLElement | null>,
  outputRange: number[] = [0, -40],
  inputRange: number[] = [0, 1]
) {
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });

  const raw = useTransform(scrollYProgress, inputRange, outputRange);
  const value = useSpring(raw, { stiffness: 100, damping: 30 });

  return value;
}
