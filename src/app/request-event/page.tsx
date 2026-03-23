"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Link2, Music, Zap, CheckCircle2, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fadeUpBlur, fadeUp, scaleFade, staggerContainer, springs } from "@/lib/animations";

export default function RequestEventPage() {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isValid = eventName.trim().length > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/event-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: eventName,
          event_link: eventLink || undefined,
          event_date: eventDate || undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Error al enviar la solicitud");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    }
    setSubmitting(false);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="px-4 md:px-8 lg:px-16 pt-8 md:pt-12 pb-12 md:pb-20 flex justify-center">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              className="w-full max-w-[520px]"
              variants={staggerContainer(0.1, 0.1)}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            >
              {/* Header */}
              <motion.div className="mb-8 md:mb-10" variants={staggerContainer(0.08)}>
                <motion.div
                  className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 btn-tag px-4 py-2 mb-4 md:mb-5"
                  variants={fadeUp}
                  transition={springs.snappy}
                >
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-primary font-semibold uppercase tracking-wider">Solicitar Evento</span>
                </motion.div>

                <motion.h1
                  className="text-[26px] md:text-[32px] lg:text-[36px] font-extrabold leading-[1.1] tracking-[-1.8px] mb-3 font-[family-name:var(--font-chakra)]"
                  variants={fadeUpBlur}
                  transition={springs.gentle}
                >
                  ¿No encuentras tu evento?
                </motion.h1>

                <motion.p
                  className="text-muted text-[14px] md:text-[15px] leading-relaxed"
                  variants={fadeUp}
                  transition={springs.smooth}
                >
                  Cuéntanos qué evento quieres ver en UntzDrop y lo agregaremos lo antes posible.
                </motion.p>
              </motion.div>

              {/* Form */}
              <motion.form onSubmit={handleSubmit} variants={staggerContainer(0.08)}>
                {/* Event Name */}
                <motion.div className="mb-5" variants={fadeUp} transition={springs.smooth}>
                  <label className="block text-sm font-semibold mb-2">
                    Nombre del evento <span className="text-primary">*</span>
                  </label>
                  <div
                    className={`bg-surface border rounded-[10px] flex items-center gap-3 px-4 h-[48px] transition-colors ${
                      focused === "name" ? "border-primary/50" : "border-border"
                    }`}
                  >
                    <Music className="w-4 h-4 text-muted shrink-0" />
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      onFocus={() => setFocused("name")}
                      onBlur={() => setFocused(null)}
                      placeholder="ej. Experts Only: Lima Edition"
                      className="bg-transparent border-none text-white text-sm outline-none w-full placeholder:text-muted"
                    />
                  </div>
                </motion.div>

                {/* Event Link */}
                <motion.div className="mb-5" variants={fadeUp} transition={springs.smooth}>
                  <label className="block text-sm font-semibold mb-2">
                    Link del evento <span className="text-muted text-xs font-normal">(opcional)</span>
                  </label>
                  <div
                    className={`bg-surface border rounded-[10px] flex items-center gap-3 px-4 h-[48px] transition-colors ${
                      focused === "link" ? "border-primary/50" : "border-border"
                    }`}
                  >
                    <Link2 className="w-4 h-4 text-muted shrink-0" />
                    <input
                      type="url"
                      value={eventLink}
                      onChange={(e) => setEventLink(e.target.value)}
                      onFocus={() => setFocused("link")}
                      onBlur={() => setFocused(null)}
                      placeholder="https://instagram.com/p/..."
                      className="bg-transparent border-none text-white text-sm outline-none w-full placeholder:text-muted"
                    />
                  </div>
                </motion.div>

                {/* Event Date */}
                <motion.div className="mb-8" variants={fadeUp} transition={springs.smooth}>
                  <label className="block text-sm font-semibold mb-2">
                    Fecha del evento <span className="text-muted text-xs font-normal">(opcional)</span>
                  </label>
                  <div
                    className={`bg-surface border rounded-[10px] flex items-center gap-3 px-4 h-[48px] transition-colors ${
                      focused === "date" ? "border-primary/50" : "border-border"
                    }`}
                  >
                    <CalendarDays className="w-4 h-4 text-muted shrink-0" />
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      onFocus={() => setFocused("date")}
                      onBlur={() => setFocused(null)}
                      className="bg-transparent border-none text-white text-sm outline-none w-full placeholder:text-muted [color-scheme:dark]"
                    />
                  </div>
                </motion.div>

                {/* Error */}
                {error && (
                  <motion.div
                    className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {error}
                  </motion.div>
                )}

                {/* Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-3"
                  variants={fadeUp}
                  transition={springs.smooth}
                >
                  <motion.button
                    type="button"
                    onClick={handleCancel}
                    className="btn-tag flex-1 bg-surface border border-border text-white font-semibold py-3.5 px-6 text-sm cursor-pointer"
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={springs.snappy}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={!isValid}
                    className={`btn-tag flex-1 font-semibold py-3.5 px-6 text-sm cursor-pointer inline-flex items-center justify-center gap-2 transition-opacity ${
                      isValid
                        ? "bg-primary text-white"
                        : "bg-primary/30 text-white/40 cursor-not-allowed"
                    }`}
                    whileHover={isValid ? { scale: 1.02, boxShadow: "0 0 24px rgba(236,130,23,0.3)" } : {}}
                    whileTap={isValid ? { scale: 0.98 } : {}}
                    transition={springs.snappy}
                  >
                    {submitting ? "Enviando..." : "Enviar solicitud"} {!submitting && <ArrowUpRight className="w-4 h-4" />}
                  </motion.button>
                </motion.div>
              </motion.form>
            </motion.div>
          ) : (
            /* ═══ SUCCESS STATE ═══ */
            <motion.div
              key="success"
              className="w-full max-w-[520px] text-center py-10 md:py-16"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={springs.bouncy}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#10B981]/10 mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...springs.bouncy, delay: 0.15 }}
              >
                <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-[#10B981]" />
              </motion.div>

              <motion.h2
                className="text-[22px] md:text-[28px] font-extrabold tracking-[-1.2px] mb-3 font-[family-name:var(--font-chakra)]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.smooth, delay: 0.2 }}
              >
                ¡Solicitud enviada!
              </motion.h2>

              <motion.p
                className="text-muted mb-2 max-w-[360px] mx-auto"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.smooth, delay: 0.28 }}
              >
                Recibimos tu solicitud para <strong className="text-white">{eventName}</strong>.
                Nuestro equipo lo revisará y lo agregará a la plataforma.
              </motion.p>

              <motion.p
                className="text-xs text-muted-dark mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...springs.smooth, delay: 0.35 }}
              >
                Tiempo estimado: 24-48 horas
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-3 justify-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.smooth, delay: 0.4 }}
              >
                <motion.button
                  onClick={() => {
                    setSubmitted(false);
                    setEventName("");
                    setEventLink("");
                    setEventDate("");
                  }}
                  className="btn-tag bg-surface border border-border text-white font-semibold py-3 px-6 text-sm cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={springs.snappy}
                >
                  Solicitar otro
                </motion.button>
                <motion.button
                  onClick={() => router.push("/")}
                  className="btn-tag bg-primary text-white font-semibold py-3 px-6 text-sm cursor-pointer inline-flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(236,130,23,0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={springs.snappy}
                >
                  Explorar eventos <ArrowUpRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </main>
  );
}
