"use client";

import { motion } from "framer-motion";
import { springs } from "@/lib/animations";

/* ═══════════════════════════════════════════════════════════════
   Scene-level SVG illustrations for UntzDrop about page.
   Minimal line-art with orange (#EA580B) + fuchsia (#D946EF) accents.
   Supermetal-inspired: detailed, technical, composition-based.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Animated EQ bars — small accent for badges ─── */
export function EQBarsIllustration({ className = "" }: { className?: string }) {
  const bars = [
    { height: 40, delay: 0 },
    { height: 65, delay: 0.1 },
    { height: 50, delay: 0.2 },
    { height: 80, delay: 0.05 },
    { height: 55, delay: 0.15 },
    { height: 70, delay: 0.25 },
    { height: 45, delay: 0.08 },
  ];

  return (
    <div className={`flex items-end justify-center gap-[4px] ${className}`}>
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="w-[6px] rounded-full"
          style={{ background: "linear-gradient(180deg, #EA580B, #D946EF)" }}
          animate={{
            height: [bar.height * 0.3, bar.height, bar.height * 0.5, bar.height * 0.9, bar.height * 0.3],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: bar.delay }}
        />
      ))}
    </div>
  );
}

/* ─── Headphones + Waveform — mission / about identity ─── */
export function WaveformCircleIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={`w-[160px] h-[160px] ${className}`} fill="none">
      <defs>
        <linearGradient id="wf-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EA580B" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="100" cy="100" r="90" stroke="url(#wf-grad)" strokeWidth="1" opacity="0.3" />
      <circle cx="100" cy="100" r="75" stroke="url(#wf-grad)" strokeWidth="0.5" opacity="0.15" />
      {/* Waveform across the center */}
      <motion.path
        d="M 30 100 Q 45 70, 60 100 Q 75 130, 90 100 Q 105 60, 120 100 Q 135 140, 150 100 Q 165 75, 170 100"
        stroke="url(#wf-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      {/* Headphone arcs */}
      <path d="M 60 85 Q 60 45, 100 40 Q 140 45, 140 85" stroke="#EA580B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Ear cups */}
      <rect x="50" y="82" width="16" height="26" rx="6" stroke="#EA580B" strokeWidth="1.5" fill="#EA580B" fillOpacity="0.15" />
      <rect x="134" y="82" width="16" height="26" rx="6" stroke="#EA580B" strokeWidth="1.5" fill="#EA580B" fillOpacity="0.15" />
      {/* Dots on waveform */}
      {[60, 90, 120, 150].map((x, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy="100"
          r="3"
          fill="#EA580B"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + i * 0.2, duration: 0.4 }}
        />
      ))}
    </svg>
  );
}

/* ─── Search + Event Cards — "Find your event" ─── */
export function SearchEventIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 120" className={`w-[140px] h-[90px] ${className}`} fill="none">
      <defs>
        <linearGradient id="se-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EA580B" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
      {/* Background cards - stacked */}
      <rect x="35" y="20" width="110" height="70" rx="6" stroke="#333" strokeWidth="1" fill="#1a1a1a" />
      <rect x="25" y="28" width="110" height="70" rx="6" stroke="#444" strokeWidth="1" fill="#141414" />
      <rect x="15" y="36" width="110" height="70" rx="6" stroke="url(#se-grad)" strokeWidth="1.5" fill="#0e0e12" />
      {/* Lines on front card */}
      <rect x="25" y="48" width="50" height="4" rx="2" fill="#EA580B" fillOpacity="0.4" />
      <rect x="25" y="58" width="35" height="3" rx="1.5" fill="#555" />
      <rect x="25" y="66" width="60" height="3" rx="1.5" fill="#333" />
      {/* Image placeholder on card */}
      <rect x="90" y="44" width="28" height="28" rx="4" fill="#EA580B" fillOpacity="0.12" stroke="#EA580B" strokeWidth="0.5" strokeOpacity="0.3" />
      {/* Magnifying glass */}
      <motion.g
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ...springs.smooth }}
      >
        <circle cx="145" cy="35" r="16" stroke="url(#se-grad)" strokeWidth="2" fill="none" />
        <line x1="157" y1="47" x2="168" y2="58" stroke="url(#se-grad)" strokeWidth="2.5" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

/* ─── Shield + Checkmark + Lock — "Buy/sell securely" ─── */
export function SecureTransactionIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={`w-[130px] h-[95px] ${className}`} fill="none">
      <defs>
        <linearGradient id="st-grad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#EA580B" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
      {/* Shield */}
      <motion.path
        d="M 80 10 L 125 28 L 125 65 Q 125 95, 80 112 Q 35 95, 35 65 L 35 28 Z"
        stroke="url(#st-grad)"
        strokeWidth="1.5"
        fill="#EA580B"
        fillOpacity="0.06"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5 }}
      />
      {/* Inner shield line */}
      <path
        d="M 80 22 L 115 36 L 115 62 Q 115 86, 80 100 Q 45 86, 45 62 L 45 36 Z"
        stroke="#EA580B"
        strokeWidth="0.5"
        strokeOpacity="0.3"
        fill="none"
      />
      {/* Checkmark */}
      <motion.path
        d="M 62 60 L 75 73 L 100 48"
        stroke="#EA580B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      />
      {/* Small lock icon */}
      <rect x="8" y="80" width="18" height="14" rx="3" stroke="#555" strokeWidth="1" fill="#1a1a1a" />
      <path d="M 12 80 L 12 74 Q 12 68, 17 68 Q 22 68, 22 74 L 22 80" stroke="#555" strokeWidth="1" fill="none" />
      {/* Connection dots */}
      {[[8, 40], [152, 40], [8, 100], [152, 100]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="#EA580B" fillOpacity="0.3" />
      ))}
    </svg>
  );
}

/* ─── Music note + Pulse — "Live the experience" ─── */
export function LiveExperienceIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={`w-[130px] h-[95px] ${className}`} fill="none">
      <defs>
        <linearGradient id="le-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EA580B" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
      {/* Radiating circles */}
      {[40, 55, 70].map((r, i) => (
        <motion.circle
          key={i}
          cx="80"
          cy="60"
          r={r}
          stroke="url(#le-grad)"
          strokeWidth="0.8"
          fill="none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15 + i * 0.05, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.2, duration: 0.8 }}
        />
      ))}
      {/* Ticket shape */}
      <motion.g
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <rect x="50" y="38" width="60" height="44" rx="5" stroke="url(#le-grad)" strokeWidth="1.5" fill="#EA580B" fillOpacity="0.08" />
        {/* Ticket perforation */}
        <line x1="82" y1="38" x2="82" y2="82" stroke="#EA580B" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.4" />
        {/* Music note on ticket */}
        <circle cx="68" cy="62" r="5" fill="#EA580B" fillOpacity="0.3" />
        <line x1="73" y1="62" x2="73" y2="48" stroke="#EA580B" strokeWidth="1.5" />
        <path d="M 73 48 Q 80 45, 80 50" stroke="#EA580B" strokeWidth="1.5" fill="none" />
        {/* QR-like block on right side */}
        <rect x="90" y="48" width="12" height="12" rx="1" stroke="#555" strokeWidth="0.8" fill="#1a1a1a" />
        <rect x="93" y="51" width="3" height="3" fill="#EA580B" fillOpacity="0.4" />
        <rect x="97" y="51" width="3" height="3" fill="#EA580B" fillOpacity="0.2" />
        <rect x="93" y="55" width="3" height="3" fill="#EA580B" fillOpacity="0.2" />
        <rect x="97" y="55" width="3" height="3" fill="#EA580B" fillOpacity="0.4" />
      </motion.g>
      {/* Pulse dots */}
      {[20, 35, 125, 140].map((x, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={60}
          r="2"
          fill="#EA580B"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
    </svg>
  );
}

/* ─── Shield — value card ─── */
export function ShieldIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={`w-[60px] h-[60px] ${className}`} fill="none">
      <path
        d="M 40 8 L 68 20 L 68 45 Q 68 65, 40 75 Q 12 65, 12 45 L 12 20 Z"
        stroke="#10B981"
        strokeWidth="1.5"
        fill="#10B981"
        fillOpacity="0.08"
      />
      <path d="M 28 40 L 36 48 L 54 30" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Community — people connected ─── */
export function CommunityIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 80" className={`w-[70px] h-[55px] ${className}`} fill="none">
      {/* Connection lines */}
      <line x1="30" y1="40" x2="50" y2="30" stroke="#3B82F6" strokeWidth="0.8" strokeOpacity="0.4" />
      <line x1="70" y1="40" x2="50" y2="30" stroke="#3B82F6" strokeWidth="0.8" strokeOpacity="0.4" />
      <line x1="30" y1="40" x2="70" y2="40" stroke="#3B82F6" strokeWidth="0.8" strokeOpacity="0.4" />
      {/* Center person */}
      <circle cx="50" cy="22" r="8" stroke="#3B82F6" strokeWidth="1.5" fill="#3B82F6" fillOpacity="0.1" />
      <circle cx="50" cy="19" r="3" fill="#3B82F6" fillOpacity="0.4" />
      {/* Left person */}
      <circle cx="25" cy="45" r="7" stroke="#3B82F6" strokeWidth="1" fill="#3B82F6" fillOpacity="0.08" />
      <circle cx="25" cy="43" r="2.5" fill="#3B82F6" fillOpacity="0.3" />
      {/* Right person */}
      <circle cx="75" cy="45" r="7" stroke="#3B82F6" strokeWidth="1" fill="#3B82F6" fillOpacity="0.08" />
      <circle cx="75" cy="43" r="2.5" fill="#3B82F6" fillOpacity="0.3" />
      {/* Pulse rings */}
      <circle cx="50" cy="22" r="14" stroke="#3B82F6" strokeWidth="0.5" strokeOpacity="0.2" />
    </svg>
  );
}

/* ─── Globe with dots — LatAm ─── */
export function GlobeIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={`w-[60px] h-[60px] ${className}`} fill="none">
      <circle cx="40" cy="40" r="30" stroke="#D946EF" strokeWidth="1.5" fill="#D946EF" fillOpacity="0.05" />
      {/* Longitude lines */}
      <ellipse cx="40" cy="40" rx="15" ry="30" stroke="#D946EF" strokeWidth="0.6" strokeOpacity="0.25" />
      <ellipse cx="40" cy="40" rx="25" ry="30" stroke="#D946EF" strokeWidth="0.6" strokeOpacity="0.15" />
      {/* Latitude lines */}
      <ellipse cx="40" cy="40" rx="30" ry="10" stroke="#D946EF" strokeWidth="0.6" strokeOpacity="0.2" />
      <ellipse cx="40" cy="28" rx="25" ry="6" stroke="#D946EF" strokeWidth="0.6" strokeOpacity="0.15" />
      {/* Location dots — LatAm positions */}
      <circle cx="32" cy="42" r="2.5" fill="#D946EF" fillOpacity="0.6" />
      <circle cx="35" cy="50" r="2" fill="#D946EF" fillOpacity="0.4" />
      <circle cx="28" cy="36" r="1.5" fill="#D946EF" fillOpacity="0.3" />
      {/* Pulse around main dot */}
      <motion.circle
        cx="32" cy="42" r="6"
        stroke="#D946EF" strokeWidth="0.8"
        fill="none"
        initial={{ opacity: 0.5, scale: 1 }}
        animate={{ opacity: 0, scale: 2 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  );
}

/* ─── Price tag ─── */
export function PriceTagIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={`w-[60px] h-[60px] ${className}`} fill="none">
      <path
        d="M 15 40 L 40 15 L 65 15 L 65 40 L 40 65 Z"
        stroke="#EA580B"
        strokeWidth="1.5"
        fill="#EA580B"
        fillOpacity="0.08"
      />
      <circle cx="55" cy="25" r="4" stroke="#EA580B" strokeWidth="1.5" fill="#EA580B" fillOpacity="0.2" />
      {/* Dollar lines */}
      <line x1="35" y1="35" x2="50" y2="35" stroke="#EA580B" strokeWidth="1" strokeOpacity="0.5" />
      <line x1="38" y1="42" x2="48" y2="42" stroke="#EA580B" strokeWidth="1" strokeOpacity="0.3" />
    </svg>
  );
}

/* ─── Ticket stack — for CTA ─── */
export function TicketStackIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 80" className={`w-[120px] h-[70px] ${className}`} fill="none">
      <defs>
        <linearGradient id="ts-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EA580B" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
      {/* Back tickets */}
      <rect x="18" y="8" width="100" height="48" rx="5" stroke="#333" strokeWidth="0.8" fill="#1a1a1a" transform="rotate(-3 68 32)" />
      <rect x="14" y="14" width="100" height="48" rx="5" stroke="#444" strokeWidth="0.8" fill="#141414" transform="rotate(2 64 38)" />
      {/* Front ticket */}
      <rect x="10" y="20" width="100" height="48" rx="5" stroke="url(#ts-grad)" strokeWidth="1.5" fill="#0e0e12" />
      {/* Perforation */}
      <line x1="78" y1="20" x2="78" y2="68" stroke="#EA580B" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.3" />
      {/* Content lines */}
      <rect x="20" y="32" width="40" height="4" rx="2" fill="#EA580B" fillOpacity="0.4" />
      <rect x="20" y="42" width="30" height="3" rx="1.5" fill="#555" />
      <rect x="20" y="50" width="45" height="3" rx="1.5" fill="#333" />
      {/* QR block */}
      <rect x="86" y="30" width="16" height="16" rx="2" stroke="#555" strokeWidth="0.8" fill="#1a1a1a" />
      <rect x="89" y="33" width="4" height="4" fill="#EA580B" fillOpacity="0.4" />
      <rect x="95" y="33" width="4" height="4" fill="#EA580B" fillOpacity="0.2" />
      <rect x="89" y="39" width="4" height="4" fill="#EA580B" fillOpacity="0.2" />
      <rect x="95" y="39" width="4" height="4" fill="#EA580B" fillOpacity="0.4" />
    </svg>
  );
}

/* ─── Legacy exports for backward compat ─── */
export const MusicLiveIllustration = LiveExperienceIllustration;
export const WalletIllustration = PriceTagIllustration;
export const ChatIllustration = CommunityIllustration;
export const UserProfileIllustration = CommunityIllustration;
export const EnvelopeIllustration = SearchEventIllustration;
export const WhatsAppIllustration = CommunityIllustration;
