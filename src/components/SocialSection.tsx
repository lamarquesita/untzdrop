"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Instagram, ArrowUpRight } from "lucide-react";
import { fadeUpBlur, fadeUp, scaleFade, staggerContainer, springs } from "@/lib/animations";

const posts = [
  { gradient: "from-[#EA580B] to-[#D946EF]", label: "🔥 Próximo evento" },
  { gradient: "from-[#3a2a5e] to-[#2a1a4e]", label: "🎧 Detrás de escena" },
  { gradient: "from-[#D946EF] to-[#3B82F6]", label: "🎶 Lineup reveal" },
  { gradient: "from-[#10B981] to-[#06B6D4]", label: "📸 La comunidad" },
];

export default function SocialSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="px-16 py-16">
      <motion.div
        className="max-w-[900px] mx-auto bg-surface border border-surface-border btn-tag p-10 relative overflow-hidden"
        variants={scaleFade}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={springs.gentle}
      >
        {/* Subtle glow */}
        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-[#D946EF]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex gap-10 items-center">
          {/* Left — Copy */}
          <motion.div
            className="flex-1"
            variants={staggerContainer(0.08)}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.div
              className="inline-flex items-center gap-2 mb-4"
              variants={fadeUp}
              transition={springs.snappy}
            >
              <Instagram className="w-5 h-5 text-[#D946EF]" />
              <span className="text-sm font-bold">@untzdrop</span>
            </motion.div>

            <motion.h3
              className="text-[24px] font-extrabold leading-tight tracking-[-1px] mb-3 font-[family-name:var(--font-chakra)]"
              variants={fadeUpBlur}
              transition={springs.smooth}
            >
              Síguenos en Instagram
            </motion.h3>

            <motion.p
              className="text-sm text-muted leading-relaxed mb-5 max-w-[300px]"
              variants={fadeUp}
              transition={springs.smooth}
            >
              Enteráte primero de los eventos más hot, promos exclusivas y contenido detrás de escena.
            </motion.p>

            <motion.a
              href="https://instagram.com/untzdrop"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tag inline-flex items-center gap-2 bg-gradient-to-r from-[#D946EF] to-[#EA580B] text-white px-5 py-2.5 text-sm font-bold cursor-pointer"
              variants={fadeUp}
              transition={springs.smooth}
              whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(217,70,239,0.3)" }}
              whileTap={{ scale: 0.97 }}
            >
              Seguir <ArrowUpRight className="w-4 h-4" />
            </motion.a>
          </motion.div>

          {/* Right — Post grid */}
          <motion.div
            className="grid grid-cols-2 gap-3 w-[260px] shrink-0"
            variants={staggerContainer(0.06, 0.15)}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {posts.map((post, i) => (
              <motion.div
                key={i}
                className={`aspect-square rounded-xl bg-gradient-to-br ${post.gradient} relative overflow-hidden group cursor-pointer`}
                variants={scaleFade}
                transition={springs.smooth}
                whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-2">
                    {post.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
