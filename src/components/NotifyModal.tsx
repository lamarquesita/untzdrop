"use client";

import { useState, useEffect } from "react";
import { X, Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotifyModal({
  eventName,
  onClose,
  onAlertSet,
}: {
  eventName: string;
  onClose: () => void;
  onAlertSet?: () => void;
}) {
  const [ticketType, setTicketType] = useState<"any" | "ga" | "vip">("any");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = () => {
    // TODO: POST to /api/notify-alerts
    onAlertSet?.();
    setSubmitted(true);
  };

  const ticketTypeLabel = ticketType === "any" ? "cualquier tipo" : ticketType.toUpperCase();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />

        <motion.div
          className="relative w-full h-full sm:h-auto sm:max-w-[400px] bg-[#111111] sm:border border-[#2A2A2A] overflow-y-auto sm:overflow-hidden flex flex-col"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          />

          {/* Header */}
          <motion.div
            className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2A] shrink-0"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
              >
                <Bell className="w-4 h-4 text-primary" />
              </motion.div>
              <h2 className="text-base font-bold">Avisarme</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-[#2A2A2A] cursor-pointer bg-transparent border-none text-[#888] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="px-6 py-12 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="w-14 h-14 bg-primary/15 flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                >
                  <Check className="w-7 h-7 text-primary" />
                </motion.div>
                <motion.h3
                  className="text-lg font-bold mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Notificación Configurada
                </motion.h3>
                <motion.p
                  className="text-sm text-[#888] mb-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Te enviaremos un correo cuando alguien publique entradas de <span className="text-white font-semibold">{ticketTypeLabel}</span> para <span className="text-white">{eventName}</span>.
                </motion.p>
                <motion.p
                  className="text-xs text-[#666] mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Serás de los primeros en enterarte.
                </motion.p>
                <motion.button
                  onClick={onClose}
                  className="btn-tag-sm bg-[#2A2A2A] hover:bg-[#333] text-white text-sm font-semibold px-6 py-2.5 cursor-pointer border-none transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Cerrar
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-6 py-5 space-y-5">
                  <motion.p
                    className="text-xs text-[#888]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    Aún no hay entradas a la venta para <span className="text-white font-semibold">{eventName}</span>. Te avisaremos por correo cuando alguien publique.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-xs font-semibold text-[#aaa] mb-2">Preferencia de entrada</label>
                    <div className="flex gap-2">
                      {([
                        { value: "any" as const, label: "Cualquiera", activeClass: "bg-white/10 border-white/30 text-white" },
                        { value: "ga" as const, label: "General (GA)", activeClass: "bg-primary/15 border-primary/30 text-primary" },
                        { value: "vip" as const, label: "VIP", activeClass: "bg-[#D946EF]/15 border-[#D946EF]/30 text-[#D946EF]" },
                      ]).map((opt) => (
                        <motion.button
                          key={opt.value}
                          onClick={() => setTicketType(opt.value)}
                          className={`flex-1 py-2.5 text-sm font-semibold cursor-pointer border transition-all ${
                            ticketType === opt.value
                              ? opt.activeClass
                              : "bg-[#1A1A1A] border-[#2A2A2A] text-[#888] hover:text-white hover:border-[#444]"
                          }`}
                          whileTap={{ scale: 0.96 }}
                        >
                          {opt.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  className="px-6 py-4 border-t border-[#2A2A2A] flex items-center justify-end gap-3 shrink-0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <motion.button
                    onClick={onClose}
                    className="btn-tag-sm text-sm text-[#888] hover:text-white font-semibold cursor-pointer bg-transparent border border-[#333] px-5 py-2.5 transition-colors hover:border-[#555]"
                    whileTap={{ scale: 0.97 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    onClick={handleSubmit}
                    className="btn-tag-sm text-sm text-white font-semibold cursor-pointer border-none px-5 py-2.5 transition-all bg-primary hover:brightness-110"
                    whileTap={{ scale: 0.97 }}
                  >
                    Notificarme
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
