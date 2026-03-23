"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Search,
  ArrowUpRight,
  HelpCircle,
  Clock,
} from "lucide-react";
import {
  TicketStackIllustration,
  WalletIllustration,
  ShieldIllustration,
  CommunityIllustration,
  EQBarsIllustration,
  GlobeIllustration,
  UserProfileIllustration,
  EnvelopeIllustration,
  WhatsAppIllustration,
} from "@/components/illustrations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fadeUpBlur, fadeUp, scaleFade, staggerContainer, springs } from "@/lib/animations";


import { useTilt } from "@/hooks/useTilt";

/* ─── FAQ Accordion Item ───────────────────────────────────── */
function FAQItem({ question, answer, isOpen, onToggle, index }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      className="border border-[#1e1e1e] rounded-none mb-3"
      variants={fadeUp}
      transition={{ ...springs.smooth, delay: index * 0.03 }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 md:px-6 py-4 md:py-5 text-left bg-transparent border-none cursor-pointer group"
      >
        <span className="text-[14px] md:text-[15px] font-semibold pr-4 md:pr-8 group-hover:text-white transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={springs.snappy}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-muted" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springs.smooth}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted leading-relaxed px-4 md:px-6 pb-5 pr-8 md:pr-16">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Category Card ────────────────────────────────────────── */
function CategoryCard({ illustration, title, description, glowColor, onClick }: {
  illustration: React.ReactNode;
  title: string;
  description: string;
  glowColor: string;
  onClick: () => void;
}) {
  const tilt = useTilt(6);

  return (
    <motion.button
      className="bg-surface border border-surface-border px-5 py-4 btn-tag text-left cursor-pointer relative overflow-hidden group w-full"
      variants={scaleFade}
      transition={springs.smooth}
      onMouseMove={tilt.handleMouseMove}
      onMouseLeave={tilt.handleMouseLeave}
      style={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        transformPerspective: 800,
      }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${glowColor}15, transparent 70%)` }}
      />
      <div className="relative z-10 flex items-center gap-4">
        <div className="shrink-0">
          {illustration}
        </div>
        <div>
          <h3 className="text-sm font-bold mb-0.5">{title}</h3>
          <p className="text-xs text-muted leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Contact Card ─────────────────────────────────────────── */
function ContactCard({ illustration, title, detail, action, href, glowColor }: {
  illustration: React.ReactNode;
  title: string;
  detail: string;
  action: string;
  href: string;
  glowColor: string;
}) {
  const tilt = useTilt(5);

  return (
    <motion.a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="bg-surface border border-surface-border px-5 py-4 btn-tag block relative overflow-hidden group"
      variants={scaleFade}
      transition={springs.smooth}
      onMouseMove={tilt.handleMouseMove}
      onMouseLeave={tilt.handleMouseLeave}
      style={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        transformPerspective: 800,
      }}
      whileHover={{ y: -3 }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${glowColor}15, transparent 70%)` }}
      />
      <div className="relative z-10 flex items-center gap-4">
        <div className="shrink-0">
          {illustration}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold mb-0.5">{title}</h3>
          <p className="text-xs text-muted leading-relaxed">{detail}</p>
        </div>
        <span className="text-xs font-semibold inline-flex items-center gap-1 shrink-0 group-hover:text-primary transition-colors" style={{ color: glowColor }}>
          {action} <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </motion.a>
  );
}

/* ─── FAQ Data ─────────────────────────────────────────────── */
const faqCategories = {
  comprar: {
    label: "Comprar boletos",
    illustration: <TicketStackIllustration className="h-[20px] w-[50px]" />,
    faqs: [
      {
        q: "¿Cómo compro un boleto en UntzDrop?",
        a: "Busca el evento que te interesa, revisa los boletos disponibles con sus precios, y haz click en 'Comprar'. Completa el pago con tu tarjeta o método preferido y recibirás tu boleto digital al instante.",
      },
      {
        q: "¿Los boletos son legítimos?",
        a: "Sí. Cada boleto pasa por un proceso de verificación antes de que se libere el pago al vendedor. Si un boleto resulta inválido, te devolvemos el 100% de tu dinero.",
      },
      {
        q: "¿Puedo comprar varios boletos a la vez?",
        a: "Sí, puedes seleccionar la cantidad que necesites siempre y cuando el vendedor tenga esa disponibilidad. Cada boleto se verifica de forma individual.",
      },
      {
        q: "¿Los precios incluyen comisiones?",
        a: "Los precios que ves son los que fija cada vendedor. UntzDrop cobra una pequeña comisión de servicio que se muestra claramente antes de confirmar tu compra. Sin sorpresas.",
      },
      {
        q: "¿Qué pasa si el evento se cancela?",
        a: "Si el evento es cancelado oficialmente, te ayudamos a gestionar el reembolso con el vendedor. Nuestro equipo de soporte media en cualquier disputa.",
      },
    ],
  },
  vender: {
    label: "Vender boletos",
    illustration: <WalletIllustration />,
    faqs: [
      {
        q: "¿Cómo pongo un boleto a la venta?",
        a: "Ve al evento, haz click en 'Vender', sube tu boleto (PDF o imagen), fija tu precio y publica. Tu listing aparecerá inmediatamente para todos los compradores.",
      },
      {
        q: "¿Cuánto cobra UntzDrop de comisión?",
        a: "Cobramos una comisión transparente sobre el precio de venta. El porcentaje exacto se muestra antes de publicar tu listing. No hay fees ocultos ni cargos sorpresa.",
      },
      {
        q: "¿Cuándo recibo mi pago?",
        a: "El pago se procesa una vez que el comprador confirma la recepción del boleto. Los fondos se depositan en tu cuenta bancaria o método de pago configurado en 1-3 días hábiles.",
      },
      {
        q: "¿Puedo cambiar el precio después de publicar?",
        a: "Sí, puedes editar o eliminar tu listing en cualquier momento desde tu Dashboard, siempre y cuando no haya una compra en proceso.",
      },
      {
        q: "¿Qué tipo de boletos puedo vender?",
        a: "Puedes vender boletos digitales (PDFs, e-tickets) y boletos físicos para eventos de música electrónica. Cada boleto debe ser válido y no haber sido utilizado.",
      },
    ],
  },
  seguridad: {
    label: "Seguridad y pagos",
    illustration: <ShieldIllustration />,
    faqs: [
      {
        q: "¿Cómo protegen mi compra?",
        a: "Usamos un sistema de escrow (custodia). El pago se retiene hasta que el boleto es verificado y entregado. Si algo sale mal, te devolvemos tu dinero.",
      },
      {
        q: "¿Qué métodos de pago aceptan?",
        a: "Aceptamos tarjetas de crédito/débito (Visa, Mastercard) a través de Stripe. Estamos trabajando para agregar métodos de pago locales como Yape y Plin.",
      },
      {
        q: "¿Mis datos están seguros?",
        a: "Absolutamente. No almacenamos datos de tarjetas - todo se procesa a través de Stripe, que cumple con los estándares PCI DSS nivel 1. Tu información personal está encriptada.",
      },
      {
        q: "¿Qué hago si fui estafado?",
        a: "Contacta a nuestro equipo de soporte inmediatamente. Investigamos cada caso y, si se confirma fraude, devolvemos el monto total al comprador.",
      },
    ],
  },
  general: {
    label: "General",
    illustration: null,
    faqs: [
      {
        q: "¿Qué es UntzDrop?",
        a: "UntzDrop es la primera plataforma dedicada a la compra y venta segura de boletos para eventos de música electrónica. Verificamos cada transacción y protegemos a compradores y vendedores.",
      },
      {
        q: "¿Cómo creo una cuenta?",
        a: "Haz click en 'Log In' y regístrate con tu número de teléfono. Recibirás un código de verificación por SMS para confirmar tu identidad.",
      },
      {
        q: "¿Los boletos son legítimos?",
        a: "Sí. Cada boleto pasa por un proceso de verificación antes de que se libere el pago al vendedor. Si un boleto resulta inválido, te devolvemos el 100% de tu dinero.",
      },
      {
        q: "¿Cómo protegen mi compra?",
        a: "Usamos un sistema de escrow (custodia). El pago se retiene hasta que el boleto es verificado y entregado. Si algo sale mal, te devolvemos tu dinero.",
      },
      {
        q: "¿Qué métodos de pago aceptan?",
        a: "Aceptamos tarjetas de crédito/débito (Visa, Mastercard) a través de Stripe. Estamos trabajando para agregar métodos de pago locales.",
      },
      {
        q: "¿Dónde veo mis compras y ventas?",
        a: "Todo está en tu Dashboard. Ahí puedes ver tus órdenes de compra, tus listings activos, y el estado de cada transacción.",
      },
    ],
  },
};

type CategoryKey = keyof typeof faqCategories;

/* ─── Main page ────────────────────────────────────────────── */
export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("general");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Section refs
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  const categoriesRef = useRef<HTMLDivElement>(null);
  const categoriesInView = useInView(categoriesRef, { once: true, margin: "-60px" });

  const faqRef = useRef<HTMLDivElement>(null);
  const faqInView = useInView(faqRef, { once: true, margin: "-60px" });

  const contactRef = useRef<HTMLDivElement>(null);
  const contactInView = useInView(contactRef, { once: true, margin: "-60px" });

  const requestRef = useRef<HTMLDivElement>(null);
  const requestInView = useInView(requestRef, { once: true, margin: "-60px" });

  // Filter FAQs by search
  const currentFAQs = faqCategories[activeCategory].faqs.filter((faq) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q);
  });

  // Search across all categories
  const allMatchingFAQs = searchQuery.trim()
    ? Object.entries(faqCategories).flatMap(([key, cat]) =>
        cat.faqs
          .filter((faq) => {
            const q = searchQuery.toLowerCase();
            return faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q);
          })
          .map((faq) => ({ ...faq, category: key as CategoryKey, categoryLabel: cat.label }))
      )
    : [];

  const showGlobalSearch = searchQuery.trim().length > 0;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="px-4 md:px-8 lg:px-16 pt-8 md:pt-12 pb-8 md:pb-10 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-[600px] mx-auto text-center"
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-[26px] md:text-[36px] lg:text-[44px] font-extrabold leading-[1.1] tracking-[-2px] mb-4 font-[family-name:var(--font-chakra)]"
            variants={fadeUpBlur}
            transition={springs.gentle}
          >
            ¿En qué te podemos <span className="text-primary">ayudar</span>?
          </motion.h1>

          <motion.p
            className="text-muted text-sm md:text-base mb-5"
            variants={fadeUp}
            transition={springs.smooth}
          >
            Busca en nuestras preguntas frecuentes o contáctanos directamente.
          </motion.p>

          {/* Search bar */}
          <motion.div
            className="relative"
            variants={scaleFade}
            transition={springs.smooth}
          >
            <div className="bg-surface border border-border rounded-none flex items-center gap-3 px-4 md:px-5 h-[48px] md:h-[52px] focus-within:border-primary/50 transition-colors">
              <Search className="w-5 h-5 text-muted shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar pregunta..."
                className="bg-transparent border-none text-white text-sm outline-none w-full placeholder:text-muted"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-muted text-sm cursor-pointer bg-transparent border-none hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ CATEGORY TABS ═══ */}
      <section ref={categoriesRef} className="px-4 md:px-8 lg:px-16 pb-6">
        <motion.div
          className="max-w-[700px] mx-auto flex justify-center gap-2 md:gap-3 flex-wrap"
          initial={{ opacity: 0, y: 10 }}
          animate={categoriesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={springs.smooth}
        >
          {(["general", "comprar", "vender"] as CategoryKey[]).map((key, i) => (
            <span key={key} className="flex items-center gap-2 md:gap-3">
              {i > 0 && <span className="text-[#333] text-xs hidden md:inline">●</span>}
              <button
                className={`bg-transparent border-none text-sm font-semibold cursor-pointer transition-colors px-1 py-1 ${
                  activeCategory === key
                    ? "text-primary"
                    : "text-muted hover:text-white"
                }`}
                onClick={() => { setActiveCategory(key); setSearchQuery(""); setOpenFAQ(null); }}
              >
                {faqCategories[key].label}
              </button>
            </span>
          ))}
        </motion.div>
      </section>

      {/* ═══ FAQ SECTION ═══ */}
      <section ref={faqRef} className="px-4 md:px-8 lg:px-16 py-6 md:py-8">
        <div className="max-w-[700px] mx-auto">
          {/* Section heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={showGlobalSearch ? "search-results" : activeCategory}
              className="mb-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={springs.snappy}
            >
              {showGlobalSearch ? (
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-primary" />
                  <h2 className="text-lg md:text-xl font-bold">
                    {allMatchingFAQs.length} resultado{allMatchingFAQs.length !== 1 ? "s" : ""} para &quot;{searchQuery}&quot;
                  </h2>
                </div>
              ) : (
                <h2 className="text-lg md:text-xl font-bold">
                  {faqCategories[activeCategory].label}
                </h2>
              )}
            </motion.div>
          </AnimatePresence>

          {/* FAQ list */}
          <AnimatePresence mode="wait">
            <motion.div
              key={showGlobalSearch ? `search-${searchQuery}` : activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {showGlobalSearch ? (
                allMatchingFAQs.length === 0 ? (
                  <motion.div
                    className="text-center py-16"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={springs.smooth}
                  >
                    <HelpCircle className="w-12 h-12 text-muted-dark mx-auto mb-4" />
                    <p className="text-muted mb-1">No encontramos resultados</p>
                    <p className="text-xs text-muted-dark">Intenta con otras palabras o contáctanos directamente</p>
                  </motion.div>
                ) : (
                  allMatchingFAQs.map((faq, i) => (
                    <div key={`${faq.category}-${i}`}>
                      {(i === 0 || allMatchingFAQs[i - 1].category !== faq.category) && (
                        <div className="text-xs text-primary font-semibold uppercase tracking-wider mt-6 mb-2 first:mt-0">
                          {faq.categoryLabel}
                        </div>
                      )}
                      <FAQItem
                        question={faq.q}
                        answer={faq.a}
                        isOpen={openFAQ === i}
                        onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
                        index={i}
                      />
                    </div>
                  ))
                )
              ) : (
                currentFAQs.map((faq, i) => (
                  <FAQItem
                    key={i}
                    question={faq.q}
                    answer={faq.a}
                    isOpen={openFAQ === i}
                    onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
                    index={i}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section ref={contactRef} className="px-4 md:px-8 lg:px-16 py-10 md:py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-[900px] mx-auto"
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate={contactInView ? "visible" : "hidden"}
        >
          <motion.div className="text-center mb-6" variants={fadeUpBlur} transition={springs.smooth}>
            <h2 className="text-[20px] md:text-[24px] lg:text-[28px] font-bold tracking-[-1.2px] mb-2 font-[family-name:var(--font-chakra)]">
              ¿No encontraste lo que buscabas?
            </h2>
            <p className="text-muted">Estamos aquí para ayudarte</p>
          </motion.div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <motion.a
              href="mailto:soporte@untzdrop.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold bg-[#181818] border border-[#555] text-white hover:text-primary hover:border-primary transition-colors"
              variants={fadeUp}
              transition={springs.smooth}
              whileHover={{ y: -2 }}
            >
              Email <ArrowUpRight className="w-4 h-4" />
            </motion.a>
            <motion.a
              href="https://wa.me/51999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold bg-[#181818] border border-[#555] text-white hover:text-[#25D366] hover:border-[#25D366] transition-colors"
              variants={fadeUp}
              transition={springs.smooth}
              whileHover={{ y: -2 }}
            >
              WhatsApp <ArrowUpRight className="w-4 h-4" />
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* ═══ REQUEST EVENT ═══ */}
      <section ref={requestRef} className="px-4 md:px-8 lg:px-16 pt-4 pb-12">
        <motion.div
          className="max-w-[700px] mx-auto text-center"
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate={requestInView ? "visible" : "hidden"}
        >
          <motion.h2
            className="text-[20px] md:text-[24px] font-bold tracking-[-1px] mb-2 font-[family-name:var(--font-chakra)]"
            variants={fadeUpBlur}
            transition={springs.smooth}
          >
            ¿Tu evento no aparece?
          </motion.h2>
          <motion.p
            className="text-sm text-muted mb-6 max-w-[400px] mx-auto"
            variants={fadeUp}
            transition={springs.smooth}
          >
            Solicita que agreguemos un evento y lo tendremos listo lo antes posible.
          </motion.p>

          <motion.a
            href="/request-event"
            className="btn-tag inline-flex items-center gap-2 bg-primary text-white px-6 py-3 text-sm font-bold cursor-pointer"
            variants={fadeUp}
            whileHover={{ scale: 1.05, boxShadow: "0 0 24px rgba(236,130,23,0.3)" }}
            whileTap={{ scale: 0.97 }}
            transition={springs.snappy}
          >
            Solicitar un evento <ArrowUpRight className="w-4 h-4" />
          </motion.a>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
