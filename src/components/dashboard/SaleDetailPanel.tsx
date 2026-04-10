"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ExternalLink } from "lucide-react";
import { Sale } from "@/lib/mockDashboard";

function formatFullDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: Sale["status"] }) {
  const config = {
    completed: { label: "Completado", bg: "bg-green-500/15", text: "text-green-400" },
    pending: { label: "Pendiente", bg: "bg-yellow-500/15", text: "text-yellow-400" },
    transferred: { label: "Transferido", bg: "bg-blue-500/15", text: "text-blue-400" },
    cancelled: { label: "Cancelado", bg: "bg-red-500/15", text: "text-red-400" },
  }[status];

  return (
    <span className={`${config.bg} ${config.text} text-xs font-semibold px-2.5 py-1 rounded-full`}>
      {config.label}
    </span>
  );
}

function PayoutBadge({ status }: { status: Sale["payout"]["status"] }) {
  const config = {
    paid: { label: "Pagado", bg: "bg-green-500/15", text: "text-green-400" },
    pending: { label: "Pendiente", bg: "bg-yellow-500/15", text: "text-yellow-400" },
    processing: { label: "Procesando", bg: "bg-blue-500/15", text: "text-blue-400" },
  }[status];

  return (
    <span className={`${config.bg} ${config.text} text-xs font-semibold px-2.5 py-1 rounded-full`}>
      {config.label}
    </span>
  );
}

export default function SaleDetailPanel({
  sale,
  onClose,
}: {
  sale: Sale;
  onClose: () => void;
}) {
  const router = useRouter();
  const eventPassed = new Date(sale.event.date) < new Date();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleViewEvent = () => {
    onClose();
    if (eventPassed) {
      router.push("/");
    } else {
      router.push(`/events/${sale.event.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Panel — left side */}
      <div className="w-[480px] bg-[#111111] border-r border-border overflow-y-auto animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2A]">
          <h2 className="text-lg font-bold">Detalles de Venta</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2A2A2A] cursor-pointer bg-transparent border-none text-[#888] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Event Info */}
          <div>
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#2a2040] to-[#2A2A2A] shrink-0 overflow-hidden">
                {sale.event.image_url && (
                  <img src={sale.event.image_url} alt={sale.event.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <div className="font-bold text-base">{sale.event.name}</div>
                <div className="text-sm text-[#888] mt-1">{formatFullDate(sale.event.date)}</div>
                <div className="text-sm text-[#666]">{sale.event.venue}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-[#888]">Orden: <span className="text-white font-mono">{sale.orderNumber}</span></span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  sale.ticketType === "vip"
                    ? "bg-[#D946EF]/15 text-[#D946EF]"
                    : "bg-[#3B82F6]/15 text-[#3B82F6]"
                }`}
              >
                {sale.ticketType}
              </span>
              <span className="text-xs text-[#888]">&times; {sale.ticketQuantity}</span>
            </div>
            <div className="mt-3">
              <StatusBadge status={sale.status} />
            </div>

            {/* View Event button */}
            <button
              onClick={handleViewEvent}
              className="mt-4 flex items-center gap-1.5 text-xs text-primary font-semibold cursor-pointer bg-transparent border-none hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              {eventPassed ? "Evento Finalizado — Ir al Inicio" : "Ver Evento"}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-[#2A2A2A]" />

          {/* Delivery */}
          <div>
            <h3 className="text-sm font-bold mb-3 text-[#aaa]">Entrega</h3>
            {sale.delivery.transferredAt ? (
              <p className="text-sm text-[#888]">
                Entrada transferida a <span className="text-white">{sale.delivery.buyerEmail}</span> el {formatFullDate(sale.delivery.transferredAt)}
              </p>
            ) : (
              <p className="text-sm text-[#888]">
                Pendiente de transferencia a <span className="text-white">{sale.delivery.buyerEmail}</span>
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[#2A2A2A]" />

          {/* Earnings */}
          <div>
            <h3 className="text-sm font-bold mb-3 text-[#aaa]">Ganancias</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#888]">Precio de venta ({sale.ticketQuantity} entrada{sale.ticketQuantity > 1 ? "s" : ""})</span>
                <span>S/{sale.earnings.salePrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Comision de plataforma</span>
                <span className="text-red-400">-S/{sale.earnings.platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Tarifa de procesamiento</span>
                <span className="text-red-400">-S/{sale.earnings.processingFee}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[#2A2A2A]">
                <span>Ganancia neta</span>
                <span className="text-green-400">S/{sale.earnings.netEarnings}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#2A2A2A]" />

          {/* Payout */}
          <div>
            <h3 className="text-sm font-bold mb-3 text-[#aaa]">Pago</h3>
            <div className="flex items-center gap-3 mb-3">
              <PayoutBadge status={sale.payout.status} />
              {sale.payout.method && (
                <span className="text-xs text-[#666]">{sale.payout.method}</span>
              )}
            </div>
            {sale.payout.paidAt && (
              <p className="text-xs text-[#555] mb-3">
                Pagado el {formatFullDate(sale.payout.paidAt)}
              </p>
            )}
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-lg p-3">
              <p className="text-xs text-[#888]">
                Puedes solicitar el pago de tus ganancias desde tu <span className="text-primary font-semibold">pagina de perfil</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop — right side */}
      <div className="flex-1 bg-black/60" onClick={onClose} />
    </div>
  );
}
