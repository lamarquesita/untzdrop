"use client";

import dynamic from "next/dynamic";
import ScrollProgress from "./ScrollProgress";

// Lazy-load GlowCursor since it's non-critical and touch-device-aware
const GlowCursor = dynamic(() => import("./GlowCursor"), { ssr: false });

/**
 * Global visual effects — mount once in the layout.
 * GlowCursor: mouse-following glow (desktop only)
 * ScrollProgress: top progress bar
 */
export default function GlobalEffects() {
  return (
    <>
      <ScrollProgress />
      <GlowCursor />
    </>
  );
}
