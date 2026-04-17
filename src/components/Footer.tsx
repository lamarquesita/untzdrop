"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
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
      { label: "Acuerdo de Usuario", href: "/user-agreement" },
      { label: "Política de Privacidad", href: "/privacy" },
      { label: "Términos y Condiciones", href: "/terms" },
      { label: "Política de Cookies", href: "/cookies" },
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

  return (
    <footer ref={footerRef} className="border-t border-border-subtle px-4 md:px-8 lg:px-16 pt-10 md:pt-12">
      {/* Tagline */}
      <motion.div
        className="text-center mb-8 md:mb-10"
        variants={fadeUpBlur}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={springs.gentle}
      >
        <h2 className="text-[20px] md:text-[24px] lg:text-[28px] font-bold leading-[1.3] font-[family-name:var(--font-chakra)]">
          La escena no para.<br />
          Nosotros tampoco.
        </h2>
      </motion.div>

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
