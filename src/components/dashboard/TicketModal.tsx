"use client";

import { useEffect, useState } from "react";
import { X, Download, Loader2 } from "lucide-react";
import { Order } from "@/lib/mockDashboard";
import { getAuthHeaders } from "@/lib/supabase";

function formatEventDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function TicketModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch(`/api/ticket/${order.id}`, { headers: authHeaders });
        if (res.ok) {
          const { downloadUrl } = await res.json();
          setTicketUrl(downloadUrl);
        } else {
          const data = await res.json();
          setError(data.error || "No se pudo cargar el boleto");
        }
      } catch {
        setError("Error al cargar el boleto");
      }
      setLoading(false);
    }
    fetchTicket();
  }, [order.id]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[400px] mx-4">
        {/* Orange glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[120px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(236,130,23,0.3), transparent 70%)",
          }}
        />

        <div className="relative bg-[#111111] border border-[#EA580B]/30 rounded-[20px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="text-lg font-bold">Tu Boleto</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2A2A2A] cursor-pointer bg-transparent border-none text-[#888] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 pb-6 space-y-5">
            {/* Event Info */}
            <div className="text-center">
              <div className="font-bold text-base">{order.event.name}</div>
              <div className="text-sm text-[#888] mt-1">{formatEventDate(order.event.date)}</div>
              <div className="text-xs text-[#666] mt-0.5">{order.event.venue}</div>
            </div>

            {/* Ticket display */}
            <div className="flex justify-center">
              {loading ? (
                <div className="w-[200px] h-[200px] bg-[#111111] rounded-xl flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#555] animate-spin" />
                </div>
              ) : ticketUrl ? (
                <div className="w-[250px] bg-white rounded-xl overflow-hidden">
                  <img
                    src={ticketUrl}
                    alt="Ticket QR"
                    className="w-full h-auto"
                    onError={(e) => {
                      // If image fails (e.g. it's a PDF), show download link instead
                      (e.target as HTMLImageElement).style.display = "none";
                      setError("pdf");
                    }}
                  />
                </div>
              ) : error === "pdf" ? (
                <div className="w-[250px] h-[200px] bg-[#111111] rounded-xl flex flex-col items-center justify-center gap-3">
                  <p className="text-sm text-[#888]">Archivo PDF</p>
                  <a
                    href={ticketUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-tag bg-primary text-white px-4 py-2 text-sm font-semibold flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </a>
                </div>
              ) : (
                <div className="w-[200px] h-[200px] bg-[#111111] rounded-xl flex items-center justify-center">
                  <p className="text-sm text-[#555] text-center px-4">
                    {error || "Boleto no disponible aún"}
                  </p>
                </div>
              )}
            </div>

            {/* Download button */}
            {ticketUrl && !loading && (
              <div className="flex justify-center">
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-2 bg-[#2A2A2A] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar Boleto
                </a>
              </div>
            )}

            {/* Ticket Info */}
            <div className="bg-[#111111] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">Boletos</span>
                <span className="font-semibold">
                  {order.ticketQuantity} &times;{" "}
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      order.ticketType === "vip"
                        ? "bg-[#D946EF]/15 text-[#D946EF]"
                        : "bg-[#3B82F6]/15 text-[#3B82F6]"
                    }`}
                  >
                    {order.ticketType}
                  </span>
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">Orden</span>
                <span className="font-mono text-xs">{order.orderNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
