"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Instagram, Music, ExternalLink, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUpBlur, fadeUp, staggerContainer, springs } from "@/lib/animations";
import AudioWave from "./effects/AudioWave";

/* ─── Slideshow slides data ────────────────────────────────── */
const slides = [
  {
    id: "instagram",
    gradient: "from-[#D946EF] via-[#EA580B] to-[#F59E0B]",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    title: "Síguenos en Instagram",
    handle: "@untzdrop",
    description: "Lineups, behind the scenes y la comunidad de la escena",
    cta: "Seguir",
    href: "https://instagram.com/untzdrop",
  },
  {
    id: "spotify",
    gradient: "from-[#1DB954] via-[#1DB954] to-[#191414]",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
    title: "Escucha nuestros playlists",
    handle: "UntzDrop",
    description: "Los sets y tracks que suenan en los mejores eventos",
    cta: "Escuchar",
    href: "https://open.spotify.com",
  },
  {
    id: "tiktok",
    gradient: "from-[#000000] via-[#25F4EE] to-[#FE2C55]",
    icon: (
      <svg width="32" height="36" viewBox="0 0 16 18" fill="white">
        <path d="M12.3 0H9.5v12.4c0 1.2-1 2.2-2.3 2.2s-2.3-1-2.3-2.2c0-1.2 1-2.2 2.3-2.2.2 0 .5 0 .7.1V7.8c-.2 0-.5-.1-.7-.1C4.2 7.7 1.5 10.1 1.5 13.2S4.2 18.7 7.2 18.7s5.7-2.4 5.7-5.7V6c1.1.8 2.4 1.3 3.6 1.3V4.7c-2 0-3.6-1.6-3.6-3.6V0h-.6z" />
      </svg>
    ),
    title: "Míranos en TikTok",
    handle: "@untzdrop",
    description: "Clips de eventos, reviews y contenido exclusivo",
    cta: "Ver",
    href: "https://tiktok.com/@untzdrop",
  },
];

/* ─── Slideshow Banner ─────────────────────────────────────── */
function SlideshowBanner() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoplay = () => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
  };

  const stopAutoplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, []);

  const goTo = (index: number) => {
    setCurrent(index);
    stopAutoplay();
    startAutoplay();
  };

  const slide = slides[current];

  return (
    <motion.div
      className="w-full rounded-2xl overflow-hidden relative h-[180px] md:h-[218px]"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} flex flex-col justify-between p-4 md:p-5`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Top — icon + handle */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                {slide.icon}
              </div>
              <div>
                <div className="text-white text-[12px] md:text-[13px] font-bold">{slide.handle}</div>
                <div className="text-white/60 text-[9px] md:text-[10px]">{slide.description}</div>
              </div>
            </div>
          </div>

          {/* Bottom — title + CTA */}
          <div>
            <div className="text-white text-[18px] md:text-[22px] font-extrabold leading-tight mb-2 md:mb-3 font-[family-name:var(--font-chakra)]">
              {slide.title}
            </div>
            <a
              href={slide.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tag inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 text-[12px] font-bold hover:bg-white/30 transition-colors"
            >
              {slide.cta} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer border-none ${
              i === current ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Main Hero ────────────────────────────────────────────── */
export default function Hero() {
  return (
    <section className="relative px-4 md:px-8 lg:px-16 pt-6 pb-6 overflow-hidden">
      {/* Background layers */}
      <AudioWave className="opacity-30" />

      {/* ═══ MOBILE: Centered hero with search ═══ */}
      <motion.div
        className="relative z-10 md:hidden text-center"
        variants={staggerContainer(0.12, 0.1)}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-[26px] font-medium leading-[1.0] tracking-[-1.5px] mb-3 font-[family-name:var(--font-chakra)]"
          variants={fadeUpBlur}
          transition={springs.gentle}
        >
          Compra o Vende<br />
          Boletos de <span className="text-primary">Raves</span> &amp; EDM
        </motion.h1>

        <motion.p
          className="text-muted text-[12px] leading-[18px] mb-5 mx-auto max-w-[280px] font-[family-name:var(--font-chakra)]"
          variants={fadeUp}
          transition={springs.smooth}
        >
          Encuentra tickets o revende los tuyos de forma segura y entre personas reales
        </motion.p>

        <motion.div
          className="relative mx-auto max-w-[320px]"
          variants={fadeUp}
          transition={springs.smooth}
        >
          <div className="bg-[#111] border border-[#222] flex items-center gap-2 px-4 h-[44px] rounded-none">
            <Search className="w-4 h-4 text-[#555] shrink-0" />
            <input
              type="text"
              placeholder="Buscar evento..."
              className="bg-transparent border-none text-white text-sm outline-none w-full placeholder:text-[#555]"
              onFocus={() => document.getElementById("browse-events")?.scrollIntoView({ behavior: "smooth" })}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* ═══ DESKTOP: Original side-by-side layout ═══ */}
      <motion.div
        className="relative z-10 hidden md:flex items-start gap-9"
        variants={staggerContainer(0.12, 0.1)}
        initial="hidden"
        animate="visible"
      >
        {/* Left — Copy */}
        <motion.div
          className="w-[418px] shrink-0 pt-2"
          variants={staggerContainer(0.1)}
        >
          <motion.h1
            className="text-[34px] lg:text-[41px] font-medium leading-[1.0] tracking-[-1.9px] mb-6 font-[family-name:var(--font-chakra)]"
            variants={fadeUpBlur}
            transition={springs.gentle}
          >
            Compra o Vende<br />
            Boletos de <span className="text-primary">Raves</span> &amp; EDM
          </motion.h1>

          <motion.p
            className="text-muted text-[14px] leading-[20px] mb-6 max-w-[340px] font-[family-name:var(--font-chakra)]"
            variants={fadeUp}
            transition={springs.smooth}
          >
            La plataforma donde la escena se conecta.<br />
            Encuentra tickets o revende los tuyos de forma segura, rápida y entre personas reales
          </motion.p>

          <motion.button
            onClick={() => document.getElementById("browse-events")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-tag bg-primary text-white px-6 py-3 text-[15px] font-semibold cursor-pointer inline-flex items-center gap-2 font-[family-name:var(--font-chakra)]"
            variants={fadeUp}
            transition={springs.smooth}
            whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(236,130,23,0.3)" }}
            whileTap={{ scale: 0.97 }}
          >
            Únete a la escena <ArrowUpRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Right — Slideshow banner */}
        <motion.div
          className="flex-1"
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.97 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={springs.gentle}
        >
          <SlideshowBanner />
        </motion.div>
      </motion.div>
    </section>
  );
}
