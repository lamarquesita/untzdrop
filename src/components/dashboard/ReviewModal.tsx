"use client";

import { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { Order } from "@/lib/mockDashboard";

const defaultReviews: Record<number, string> = {
  5: "Excelente experiencia. La entrada llegó al instante y todo funcionó perfecto en el evento. 100% recomendado.",
  4: "Buena experiencia. La entrada llegó rápido y no tuve problemas en la entrada del evento.",
  3: "Experiencia normal. La entrada funcionó pero la comunicación pudo ser mejor.",
  2: "Experiencia regular. Tuve algunos inconvenientes con la entrada o la entrega.",
  1: "Mala experiencia. Tuve problemas serios con esta transacción.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
}

export default function ReviewModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [review, setReview] = useState(defaultReviews[5]);
  const [submitted, setSubmitted] = useState(false);
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleRatingChange = (star: number) => {
    setRating(star);
    if (!edited) {
      setReview(defaultReviews[star]);
    }
  };

  const handleReviewChange = (text: string) => {
    setReview(text);
    setEdited(true);
  };

  const handleSubmit = () => {
    // TODO: POST to /api/reviews
    setSubmitted(true);
  };

  const displayRating = hoveredStar ?? rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[440px] bg-[#111111] border border-[#2A2A2A] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2A] shrink-0">
          <div className="flex items-center gap-3">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <h2 className="text-base font-bold">Dejar Reseña</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-[#2A2A2A] cursor-pointer bg-transparent border-none text-[#888] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-12 text-center">
            <div className="w-14 h-14 bg-primary/15 flex items-center justify-center mx-auto mb-4">
              <Star className="w-7 h-7 text-primary fill-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">Reseña Publicada</h3>
            <p className="text-sm text-[#888] mb-6">Gracias por tu reseña. Tu opinión ayuda a construir confianza en la comunidad.</p>
            <button
              onClick={onClose}
              className="btn-tag-sm bg-[#2A2A2A] hover:bg-[#333] text-white text-sm font-semibold px-6 py-2.5 cursor-pointer border-none transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {/* Order context */}
              <div className="bg-[#1A1A1A] px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2a2040] to-[#2A2A2A] shrink-0 overflow-hidden">
                  {order.event.image_url && (
                    <img src={order.event.image_url} alt={order.event.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{order.event.name}</div>
                  <div className="text-xs text-[#666]">{formatDate(order.event.date)} · {order.event.venue}</div>
                </div>
              </div>

              {/* Star rating */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-3">Calificación</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      className="bg-transparent border-none cursor-pointer p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= displayRating
                            ? "text-primary fill-primary"
                            : "text-[#333] fill-none"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-[#888] ml-3 font-semibold">{displayRating}/5</span>
                </div>
              </div>

              {/* Review text */}
              <div>
                <label className="block text-xs font-semibold text-[#aaa] mb-2">Tu reseña</label>
                <textarea
                  value={review}
                  onChange={(e) => handleReviewChange(e.target.value)}
                  rows={4}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 transition-colors resize-none placeholder:text-[#555]"
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-[#555]">{review.length} caracteres</span>
                  {edited && (
                    <button
                      onClick={() => { setReview(defaultReviews[rating]); setEdited(false); }}
                      className="text-[10px] text-primary cursor-pointer bg-transparent border-none hover:underline"
                    >
                      Restaurar texto sugerido
                    </button>
                  )}
                </div>
              </div>

              {/* Info */}
              <p className="text-[10px] text-[#555] leading-relaxed">
                Tu reseña será visible para otros usuarios. Las reseñas ayudan a construir confianza en la comunidad y permiten a compradores y vendedores tomar mejores decisiones.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#2A2A2A] flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={onClose}
                className="btn-tag-sm text-sm text-[#888] hover:text-white font-semibold cursor-pointer bg-transparent border border-[#333] px-5 py-2.5 transition-colors hover:border-[#555]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={review.trim().length < 5}
                className={`btn-tag-sm text-sm text-white font-semibold cursor-pointer border-none px-5 py-2.5 transition-all ${
                  review.trim().length >= 5
                    ? "bg-primary hover:brightness-110"
                    : "bg-[#333] text-[#666] cursor-not-allowed"
                }`}
              >
                Publicar Reseña
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
