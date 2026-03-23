"use client";

import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AudioWave from "@/components/effects/AudioWave";
import { fadeUpBlur, fadeUp, scaleFade, staggerContainer, springs } from "@/lib/animations";
import { useTilt } from "@/hooks/useTilt";
import {
  EQBarsIllustration,
  WaveformCircleIllustration,
  SearchEventIllustration,
  SecureTransactionIllustration,
  LiveExperienceIllustration,
  ShieldIllustration,
  CommunityIllustration,
  GlobeIllustration,
  PriceTagIllustration,
  TicketStackIllustration,
} from "@/components/illustrations";

/* ─── Animated counter ─────────────────────────────────────── */
function AnimatedStat({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [displayed, setDisplayed] = useState(0);

  if (isInView && displayed === 0) {
    let start = 0;
    const duration = 1200;
    const step = Math.max(1, Math.floor(value / (duration / 16)));
    const interval = setInterval(() => {
      start += step;
      if (start >= value) {
        start = value;
        clearInterval(interval);
      }
      setDisplayed(start);
    }, 16);
  }

  return (
    <motion.div
      ref={ref}
      className="text-center"
      variants={scaleFade}
      transition={springs.smooth}
    >
      <div className="text-[32px] md:text-[40px] lg:text-[48px] font-extrabold text-primary leading-none font-[family-name:var(--font-chakra)]">
        {isInView ? displayed.toLocaleString() : "0"}{suffix}
      </div>
      <div className="text-sm text-muted mt-2">{label}</div>
    </motion.div>
  );
}

/* ─── Value card with tilt + custom illustration ───────────── */
function ValueCard({ illustration, title, description, glowColor }: {
  illustration: React.ReactNode;
  title: string;
  description: string;
  glowColor: string;
}) {
  const tilt = useTilt(8);

  return (
    <motion.div
      className="bg-surface border border-surface-border p-6 md:p-8 btn-tag relative overflow-hidden group cursor-default"
      variants={scaleFade}
      transition={springs.smooth}
      onMouseMove={tilt.handleMouseMove}
      onMouseLeave={tilt.handleMouseLeave}
      style={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        transformPerspective: 800,
      }}
      whileHover={{ y: -4 }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${glowColor}15, transparent 70%)` }}
      />
      <div className="relative z-10">
        <div className="h-[60px] md:h-[80px] flex items-center justify-start mb-4 md:mb-5">
          {illustration}
        </div>
        <h3 className="text-base md:text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

/* ─── Step card ────────────────────────────────────────────── */
function StepCard({ number, title, description, illustration }: {
  number: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
}) {
  return (
    <motion.div
      className="relative text-center"
      variants={fadeUp}
      transition={springs.smooth}
    >
      <div className="h-[80px] md:h-[100px] flex items-center justify-center mb-4 md:mb-6">
        {illustration}
      </div>
      <div className="text-[40px] md:text-[56px] font-extrabold text-primary/10 leading-none font-[family-name:var(--font-chakra)] mb-2 select-none">
        {number}
      </div>
      <h3 className="text-lg md:text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed max-w-[280px] mx-auto">{description}</p>
    </motion.div>
  );
}

/* ─── Main page ────────────────────────────────────────────── */
export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useSpring(useTransform(heroProgress, [0, 1], [0, 80]), { stiffness: 100, damping: 30 });
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  const missionRef = useRef<HTMLDivElement>(null);
  const missionInView = useInView(missionRef, { once: true, margin: "-80px" });

  const stepsRef = useRef<HTMLDivElement>(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: "-80px" });

  const valuesRef = useRef<HTMLDivElement>(null);
  const valuesInView = useInView(valuesRef, { once: true, margin: "-80px" });

  const manifestoRef = useRef<HTMLDivElement>(null);
  const manifestoInView = useInView(manifestoRef, { once: true, margin: "-80px" });

  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-60px" });

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <motion.section
        ref={heroRef}
        className="relative px-4 md:px-8 lg:px-16 pt-12 md:pt-20 pb-16 md:pb-28 overflow-hidden"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <AudioWave className="opacity-70" />

        <motion.div
          className="relative z-10 max-w-[720px] mx-auto text-center"
          variants={staggerContainer(0.12, 0.15)}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-[28px] md:text-[40px] lg:text-[52px] font-extrabold leading-[1.05] tracking-[-2.5px] mb-4 md:mb-6 font-[family-name:var(--font-chakra)]"
            variants={fadeUpBlur}
            transition={springs.gentle}
          >
            Creamos el lugar donde la{" "}
            <span className="text-primary">escena</span>{" "}
            se conecta
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-muted max-w-[520px] mx-auto leading-relaxed"
            variants={fadeUp}
            transition={springs.smooth}
          >
            UntzDrop nació de la frustración de querer ir a un evento y no encontrar boletos confiables —
            o tener entradas que no puedes usar y no saber dónde venderlas.
          </motion.p>
        </motion.div>

        <div className="absolute top-1/2 left-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[150px] md:w-[300px] h-[150px] md:h-[300px] bg-[#D946EF]/5 rounded-full blur-[100px] pointer-events-none" />
      </motion.section>

      {/* ═══ MISSION STATEMENT ═══ */}
      <section ref={missionRef} className="px-4 md:px-8 lg:px-16 py-12 md:py-20">
        <motion.div
          className="max-w-[900px] mx-auto flex flex-col md:flex-row gap-10 md:gap-16 items-center"
          variants={staggerContainer(0.1)}
          initial="hidden"
          animate={missionInView ? "visible" : "hidden"}
        >
          {/* Left — visual */}
          <motion.div
            className="w-[240px] h-[240px] md:w-[320px] md:h-[320px] shrink-0 relative flex items-center justify-center"
            variants={scaleFade}
            transition={springs.gentle}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-[#D946EF]/10 rounded-3xl rotate-3" />
            <div className="absolute inset-0 bg-surface border border-surface-border rounded-3xl -rotate-2" />
            <div className="relative z-10 flex items-center justify-center">
              {/* DJ Controller — detailed top-down view */}
              <div className="relative">
                {/* Ambient glow behind deck */}
                <div className="absolute -inset-8 rounded-3xl" style={{
                  background: "radial-gradient(ellipse 60% 50% at 30% 50%, rgba(236,130,23,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 70% 50%, rgba(217,70,239,0.08) 0%, transparent 60%)",
                }} />
                <svg viewBox="0 0 380 240" className="w-[200px] h-[130px] md:w-[300px] md:h-[190px] relative z-10" fill="none">
                  <defs>
                    <linearGradient id="dj-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#EA580B" />
                      <stop offset="100%" stopColor="#D946EF" />
                    </linearGradient>
                    <radialGradient id="vinyl-l" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#1a1a1a" />
                      <stop offset="40%" stopColor="#111" />
                      <stop offset="100%" stopColor="#0d0d0d" />
                    </radialGradient>
                    <radialGradient id="vinyl-r" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#1a1a1a" />
                      <stop offset="40%" stopColor="#111" />
                      <stop offset="100%" stopColor="#0d0d0d" />
                    </radialGradient>
                    <filter id="glow-o" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="glow-p" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>

                  {/* ═══ DECK BODY ═══ */}
                  <rect x="4" y="4" width="372" height="232" rx="12" fill="#0a0a0e" stroke="#1a1a1a" strokeWidth="1.5" />
                  <rect x="8" y="8" width="364" height="224" rx="10" fill="#0e0e12" />

                  {/* ═══ LEFT JOG WHEEL ═══ */}
                  <circle cx="105" cy="115" r="72" fill="#0a0a0a" stroke="#1e1e1e" strokeWidth="1" />
                  <circle cx="105" cy="115" r="65" fill="url(#vinyl-l)" stroke="#222" strokeWidth="0.8" />
                  {/* Vinyl grooves — dense rings */}
                  {Array.from({ length: 20 }).map((_, i) => (
                    <circle key={`vl-${i}`} cx="105" cy="115" r={18 + i * 2.3} stroke="#1a1a1a" strokeWidth="0.3" fill="none" opacity={0.3 + (i % 3 === 0 ? 0.3 : 0)} />
                  ))}
                  {/* Vinyl highlight reflection */}
                  <ellipse cx="85" cy="95" rx="30" ry="15" fill="white" fillOpacity="0.015" transform="rotate(-30 85 95)" />
                  {/* Spinning label */}
                  <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    style={{ originX: "105px", originY: "115px" }}
                  >
                    <circle cx="105" cy="115" r="16" fill="#111" stroke="#EA580B" strokeWidth="0.8" strokeOpacity="0.6" />
                    <circle cx="105" cy="115" r="14" fill="#EA580B" fillOpacity="0.08" />
                    {/* Label details */}
                    <rect x="97" y="110" width="16" height="2" rx="1" fill="#EA580B" fillOpacity="0.3" />
                    <rect x="99" y="114" width="12" height="1.5" rx="0.75" fill="#EA580B" fillOpacity="0.15" />
                    <circle cx="105" cy="115" r="2.5" fill="#111" stroke="#333" strokeWidth="0.5" />
                    <circle cx="105" cy="115" r="1" fill="#EA580B" fillOpacity="0.8" />
                  </motion.g>
                  {/* Jog ring glow */}
                  <motion.circle
                    cx="105" cy="115" r="65"
                    stroke="#EA580B" strokeWidth="1.5" fill="none"
                    filter="url(#glow-o)"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* ═══ RIGHT JOG WHEEL ═══ */}
                  <circle cx="275" cy="115" r="72" fill="#0a0a0a" stroke="#1e1e1e" strokeWidth="1" />
                  <circle cx="275" cy="115" r="65" fill="url(#vinyl-r)" stroke="#222" strokeWidth="0.8" />
                  {Array.from({ length: 20 }).map((_, i) => (
                    <circle key={`vr-${i}`} cx="275" cy="115" r={18 + i * 2.3} stroke="#1a1a1a" strokeWidth="0.3" fill="none" opacity={0.3 + (i % 3 === 0 ? 0.3 : 0)} />
                  ))}
                  <ellipse cx="255" cy="95" rx="30" ry="15" fill="white" fillOpacity="0.015" transform="rotate(-30 255 95)" />
                  <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
                    style={{ originX: "275px", originY: "115px" }}
                  >
                    <circle cx="275" cy="115" r="16" fill="#111" stroke="#D946EF" strokeWidth="0.8" strokeOpacity="0.6" />
                    <circle cx="275" cy="115" r="14" fill="#D946EF" fillOpacity="0.08" />
                    <rect x="267" y="110" width="16" height="2" rx="1" fill="#D946EF" fillOpacity="0.3" />
                    <rect x="269" y="114" width="12" height="1.5" rx="0.75" fill="#D946EF" fillOpacity="0.15" />
                    <circle cx="275" cy="115" r="2.5" fill="#111" stroke="#333" strokeWidth="0.5" />
                    <circle cx="275" cy="115" r="1" fill="#D946EF" fillOpacity="0.8" />
                  </motion.g>
                  <motion.circle
                    cx="275" cy="115" r="65"
                    stroke="#D946EF" strokeWidth="1.5" fill="none"
                    filter="url(#glow-p)"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  />

                  {/* ═══ CENTER MIXER ═══ */}
                  <rect x="168" y="25" width="44" height="190" rx="4" fill="#0c0c10" stroke="#1e1e1e" strokeWidth="1" />

                  {/* EQ Knobs — 3 per channel */}
                  {[40, 55, 70].map((y, i) => (
                    <g key={`eq-l-${i}`}>
                      <circle cx="180" cy={y} r="5" fill="#151518" stroke="#333" strokeWidth="0.8" />
                      <line x1="180" y1={y} x2="180" y2={y - 4} stroke="#EA580B" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
                    </g>
                  ))}
                  {[40, 55, 70].map((y, i) => (
                    <g key={`eq-r-${i}`}>
                      <circle cx="200" cy={y} r="5" fill="#151518" stroke="#333" strokeWidth="0.8" />
                      <line x1="200" y1={y} x2="200" y2={y - 4} stroke="#D946EF" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
                    </g>
                  ))}

                  {/* Channel faders */}
                  <rect x="177" y="85" width="6" height="40" rx="3" fill="#1a1a1a" />
                  <rect x="177" y="92" width="6" height="10" rx="3" fill="#EA580B" fillOpacity="0.5" />
                  <rect x="197" y="85" width="6" height="40" rx="3" fill="#1a1a1a" />
                  <rect x="197" y="98" width="6" height="10" rx="3" fill="#D946EF" fillOpacity="0.5" />

                  {/* LED meters */}
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => (
                    <motion.rect
                      key={`ml-${j}`}
                      x={174} y={140 - j * 5} width="4" height="3" rx="0.5"
                      fill={j < 6 ? "#EA580B" : "#ef4444"}
                      animate={{ opacity: [0.15, j < 5 ? 0.85 : 0.4, 0.15] }}
                      transition={{ duration: 0.6 + j * 0.15, repeat: Infinity, delay: j * 0.08 }}
                    />
                  ))}
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => (
                    <motion.rect
                      key={`mr-${j}`}
                      x={202} y={140 - j * 5} width="4" height="3" rx="0.5"
                      fill={j < 6 ? "#D946EF" : "#ef4444"}
                      animate={{ opacity: [0.15, j < 5 ? 0.85 : 0.4, 0.15] }}
                      transition={{ duration: 0.5 + j * 0.12, repeat: Infinity, delay: j * 0.1 }}
                    />
                  ))}

                  {/* Crossfader */}
                  <rect x="174" y="165" width="32" height="5" rx="2.5" fill="#1a1a1a" />
                  <rect x="186" y="163" width="10" height="9" rx="2" fill="#222" stroke="#444" strokeWidth="0.5" />

                  {/* ═══ TRANSPORT BUTTONS ═══ */}
                  {/* Left deck: Play + Cue */}
                  <motion.circle cx="105" cy="210" r="8" fill="#111" stroke="#EA580B" strokeWidth="1"
                    animate={{ boxShadow: ["0 0 0px #EA580B", "0 0 6px #EA580B", "0 0 0px #EA580B"] }}
                  />
                  <polygon points="102,206 102,214 109,210" fill="#EA580B" fillOpacity="0.7" />
                  <rect x="82" y="204" width="12" height="12" rx="2" fill="#111" stroke="#555" strokeWidth="0.8" />
                  <text x="88" y="212" textAnchor="middle" fontSize="6" fill="#888" fontFamily="monospace">CUE</text>

                  {/* Right deck: Play + Cue */}
                  <motion.circle cx="275" cy="210" r="8" fill="#111" stroke="#D946EF" strokeWidth="1" />
                  <polygon points="272,206 272,214 279,210" fill="#D946EF" fillOpacity="0.7" />
                  <rect x="286" y="204" width="12" height="12" rx="2" fill="#111" stroke="#555" strokeWidth="0.8" />
                  <text x="292" y="212" textAnchor="middle" fontSize="6" fill="#888" fontFamily="monospace">CUE</text>

                  {/* ═══ PITCH SLIDERS ═══ */}
                  <rect x="25" y="40" width="5" height="60" rx="2.5" fill="#1a1a1a" />
                  <rect x="24" y="62" width="7" height="10" rx="1.5" fill="#333" stroke="#555" strokeWidth="0.3" />
                  <rect x="350" y="40" width="5" height="60" rx="2.5" fill="#1a1a1a" />
                  <rect x="349" y="58" width="7" height="10" rx="1.5" fill="#333" stroke="#555" strokeWidth="0.3" />

                  {/* ═══ HOT CUE PADS ═══ */}
                  {[0, 1, 2, 3].map((i) => (
                    <rect key={`pad-l-${i}`} x={42 + i * 14} y="205" width="11" height="11" rx="2"
                      fill="#111" stroke={i === 0 ? "#EA580B" : "#333"} strokeWidth="0.8"
                    />
                  ))}
                  {[0, 1, 2, 3].map((i) => (
                    <rect key={`pad-r-${i}`} x={310 + i * 14} y="205" width="11" height="11" rx="2"
                      fill="#111" stroke={i === 0 ? "#D946EF" : "#333"} strokeWidth="0.8"
                    />
                  ))}
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Right — text */}
          <motion.div className="flex-1" variants={staggerContainer(0.08)}>
            <motion.h2
              className="text-[22px] md:text-[28px] lg:text-[32px] font-bold tracking-[-1.5px] mb-4 font-[family-name:var(--font-chakra)]"
              variants={fadeUpBlur}
              transition={springs.smooth}
            >
              La escena electrónica merece algo mejor
            </motion.h2>
            <motion.p
              className="text-muted leading-relaxed mb-4"
              variants={fadeUp}
              transition={springs.smooth}
            >
              En Latinoamérica, la reventa de boletos sucede en grupos de WhatsApp, stories de Instagram y
              comentarios de Facebook. No hay garantías, no hay protección, y las estafas son comunes.
            </motion.p>
            <motion.p
              className="text-muted leading-relaxed"
              variants={fadeUp}
              transition={springs.smooth}
            >
              <strong className="text-white">UntzDrop cambia eso.</strong> Somos la primera plataforma dedicada
              a la compra y venta segura de boletos para eventos de música electrónica en la región.
              Verificamos cada transacción y protegemos tanto a compradores como vendedores.
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section ref={stepsRef} className="px-4 md:px-8 lg:px-16 py-12 md:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-[900px] mx-auto"
          variants={staggerContainer(0.12)}
          initial="hidden"
          animate={stepsInView ? "visible" : "hidden"}
        >
          <motion.div className="text-center mb-10 md:mb-16" variants={fadeUpBlur} transition={springs.smooth}>
            <h2 className="text-[22px] md:text-[28px] lg:text-[32px] font-bold tracking-[-1.5px] mb-3 font-[family-name:var(--font-chakra)]">
              Cómo funciona
            </h2>
            <p className="text-muted max-w-[400px] mx-auto">
              Tres pasos. Sin complicaciones. Sin estafas.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            <StepCard
              number="01"
              title="Encuentra tu evento"
              description="Busca entre cientos de eventos de electrónica. Filtra por fecha, lugar o artista."
              illustration={<SearchEventIllustration />}
            />
            <StepCard
              number="02"
              title="Compra o vende seguro"
              description="Cada transacción está protegida. El pago se retiene hasta que el boleto es verificado."
              illustration={<SecureTransactionIllustration />}
            />
            <StepCard
              number="03"
              title="Vive la experiencia"
              description="Recibe tu boleto digital al instante. Sin filas, sin papel, sin drama."
              illustration={<LiveExperienceIllustration />}
            />
          </div>
        </motion.div>
      </section>

      {/* ═══ VALUES ═══ */}
      <section ref={valuesRef} className="px-4 md:px-8 lg:px-16 py-12 md:py-20">
        <motion.div
          className="max-w-[1000px] mx-auto"
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate={valuesInView ? "visible" : "hidden"}
        >
          <motion.div className="text-center mb-10 md:mb-14" variants={fadeUpBlur} transition={springs.smooth}>
            <h2 className="text-[22px] md:text-[28px] lg:text-[32px] font-bold tracking-[-1.5px] mb-3 font-[family-name:var(--font-chakra)]">
              Lo que nos mueve
            </h2>
            <p className="text-muted max-w-[420px] mx-auto">
              No somos una empresa de tecnología que descubrió la música. Somos gente de la escena que aprendió a programar.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ValueCard
              illustration={<ShieldIllustration />}
              title="Seguridad real"
              description="Pagos protegidos, verificación de boletos, y soporte humano si algo sale mal. No bots, no respuestas automáticas."
              glowColor="#10B981"
            />
            <ValueCard
              illustration={<CommunityIllustration />}
              title="Para la comunidad"
              description="Construida para ravers, por ravers. Cada feature nace de una necesidad real que vivimos en carne propia."
              glowColor="#3B82F6"
            />
            <ValueCard
              illustration={<GlobeIllustration />}
              title="Latinoamérica primero"
              description="Empezamos en Lima, pero la visión es regional. Métodos de pago locales, idioma nativo, precios en moneda local."
              glowColor="#D946EF"
            />
            <ValueCard
              illustration={<PriceTagIllustration />}
              title="Precios justos"
              description="Los vendedores fijan sus precios. Nosotros cobramos una comisión transparente. Sin sorpresas, sin fees ocultos."
              glowColor="#EA580B"
            />
          </div>
        </motion.div>
      </section>



      {/* ═══ MANIFESTO ═══ */}
      <section ref={manifestoRef} className="px-4 md:px-8 lg:px-16 py-12 md:py-20">
        <motion.div
          className="max-w-[700px] mx-auto text-center"
          variants={staggerContainer(0.1)}
          initial="hidden"
          animate={manifestoInView ? "visible" : "hidden"}
        >
          <motion.div
            className="text-[20px] md:text-[24px] lg:text-[28px] font-bold leading-[1.4] font-[family-name:var(--font-chakra)] tracking-[-1px]"
            variants={fadeUpBlur}
            transition={springs.gentle}
          >
            <motion.span className="block mb-2" variants={fadeUp} transition={springs.smooth}>
              Creemos que la música es para{" "}
              <span className="text-primary">todos</span>.
            </motion.span>
            <motion.span className="block mb-2 text-muted" variants={fadeUp} transition={springs.smooth}>
              Que la reventa no debería ser un riesgo.
            </motion.span>
            <motion.span className="block mb-2" variants={fadeUp} transition={springs.smooth}>
              Que la escena merece{" "}
              <span className="text-[#D946EF]">herramientas dignas</span>.
            </motion.span>
            <motion.span className="block text-muted" variants={fadeUp} transition={springs.smooth}>
              Y que el próximo drop está a un click.
            </motion.span>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ CTA ═══ */}
      <section ref={ctaRef} className="px-4 md:px-8 lg:px-16 pt-10 pb-12 md:pb-20">
        <motion.div
          className="relative max-w-[800px] mx-auto bg-surface border border-surface-border btn-tag p-8 md:p-14 text-center overflow-hidden"
          variants={scaleFade}
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          transition={springs.gentle}
        >
          <AudioWave className="opacity-30" />

          <div className="relative z-10">
            <motion.div className="mb-4 flex justify-center">
              <TicketStackIllustration />
            </motion.div>

            <h2 className="text-[22px] md:text-[28px] lg:text-[32px] font-bold tracking-[-1.5px] mb-3 font-[family-name:var(--font-chakra)]">
              ¿Listo para el drop?
            </h2>
            <p className="text-muted mb-6 md:mb-8 max-w-[400px] mx-auto">
              Únete a miles de personas que ya compran y venden boletos de forma segura.
            </p>

            <motion.a
              href="/"
              className="btn-tag inline-flex items-center gap-2 bg-primary text-white px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold cursor-pointer"
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(236,130,23,0.3)" }}
              whileTap={{ scale: 0.97 }}
              transition={springs.snappy}
            >
              Explorar eventos <ArrowUpRight className="w-5 h-5" />
            </motion.a>
          </div>

          <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-[250px] h-[250px] bg-[#D946EF]/5 rounded-full blur-[80px] pointer-events-none" />
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
