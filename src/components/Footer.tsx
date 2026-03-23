"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { fadeUpBlur, fadeUp, staggerContainer, springs } from "@/lib/animations";

const linkColumns = [
  {
    title: "Nosotros",
    links: [
      { label: "Inicio", href: "/", chakra: true },
      { label: "Acerca de", href: "/about" },
      { label: "Preguntas Frecuentes", href: "/help" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Solicitar un Evento", href: "/request-event" },
      { label: "Soporte", href: "/help" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Política de Privacidad", href: "/privacy" },
      { label: "Términos y Condiciones", href: "/terms" },
    ],
  },
  {
    title: "Redes Sociales",
    links: [
      { label: "Instagram", href: "https://instagram.com/untzdrop" },
      { label: "LinkedIn", href: "https://linkedin.com/company/untzdrop" },
    ],
  },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-40px" });
  const [secretRevealed, setSecretRevealed] = useState(false);

  return (
    <footer ref={footerRef} className="border-t border-border-subtle px-4 md:px-8 lg:px-16 pt-10 md:pt-12">
      {/* Tagline — clickable secret */}
      <motion.div
        className="text-center mb-8 md:mb-10 cursor-pointer select-none"
        variants={fadeUpBlur}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={springs.gentle}
        onClick={() => setSecretRevealed((v) => !v)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <h2 className="text-[20px] md:text-[24px] lg:text-[28px] font-bold leading-[1.3] font-[family-name:var(--font-chakra)]">
          La escena no para.<br />
          Nosotros tampoco.
        </h2>
        <motion.div
          className="text-xs text-muted-dark mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView ? 0.5 : 0 }}
          transition={{ delay: 1.2 }}
        >
          ▼
        </motion.div>
      </motion.div>

      {/* Secret content */}
      <AnimatePresence>
        {secretRevealed && (
          <motion.div
            className="text-center mb-8 md:mb-10 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springs.smooth}
          >
            <motion.div
              className="btn-tag inline-block bg-gradient-to-r from-primary/20 to-[#D946EF]/20 border border-primary/30 px-6 md:px-8 py-4 md:py-6"
              initial={{ scale: 0.8, filter: "blur(10px)" }}
              animate={{ scale: 1, filter: "blur(0px)" }}
              transition={springs.bouncy}
            >
              <div className="text-xs text-muted uppercase tracking-widest mb-2">Contenido Secreto</div>
              <div className="text-xl md:text-2xl font-bold text-primary font-[family-name:var(--font-chakra)] mb-1">
                🎧 ESCENA2026
              </div>
              <div className="text-xs text-text-dim">
                Usa este código para un beneficio especial en tu primer evento
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link columns */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 justify-center mb-8 md:mb-10 max-w-[800px] mx-auto"
        variants={staggerContainer(0.08, 0.1)}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {linkColumns.map((col) => (
          <motion.div key={col.title} variants={fadeUp} transition={springs.smooth}>
            <h4 className="text-sm font-bold mb-3 md:mb-4">{col.title}</h4>
            {col.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`block text-text-dim text-[13px] underline underline-offset-[3px] mb-2 hover:text-white transition-colors ${
                  link.chakra ? "font-[family-name:var(--font-chakra)]" : ""
                }`}
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom */}
      <motion.div
        className="flex justify-center items-center py-4 text-xs text-muted-dark font-[family-name:var(--font-chakra)]"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ ...springs.smooth, delay: 0.4 }}
      >
        &copy; 2026 UntzDrop.
      </motion.div>
    </footer>
  );
}
