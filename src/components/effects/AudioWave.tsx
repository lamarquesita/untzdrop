"use client";

import { useEffect, useRef } from "react";

/**
 * Canvas-based audio waveform that pulses in the background.
 * Uses requestAnimationFrame — zero DOM nodes for the wave itself.
 * Renders subtle, ambient waveform bars with the primary orange color.
 */
export default function AudioWave({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const barCount = 64;
    const phases = Array.from({ length: barCount }, () => Math.random() * Math.PI * 2);
    const speeds = Array.from({ length: barCount }, () => 0.3 + Math.random() * 0.7);
    const maxHeights = Array.from({ length: barCount }, () => 0.3 + Math.random() * 0.7);

    const draw = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      const barWidth = w / barCount;
      const gap = 2;

      for (let i = 0; i < barCount; i++) {
        const t = time * 0.001 * speeds[i];
        const wave = Math.sin(t + phases[i]) * 0.5 + 0.5;
        const barHeight = wave * maxHeights[i] * h * 0.6;

        const x = i * barWidth + gap / 2;
        const y = h / 2 - barHeight / 2;

        // Gradient from primary to transparent
        const alpha = 0.08 + wave * 0.12;
        ctx.fillStyle = `rgba(236, 130, 23, ${alpha})`;
        ctx.fillRect(x, y, barWidth - gap, barHeight);


      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden
    />
  );
}
