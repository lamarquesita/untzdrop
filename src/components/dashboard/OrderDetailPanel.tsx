"use client";

import { useEffect } from "react";
import { X, CreditCard } from "lucide-react";
import { Order } from "@/lib/mockDashboard";

function formatFullDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const config = {
    confirmed: { label: "Confirmado", bg: "bg-green-500/15", text: "text-green-400" },
    pending: { label: "Pendiente", bg: "bg-yellow-500/15", text: "text-yellow-400" },
    cancelled: { label: "Cancelado", bg: "bg-red-500/15", text: "text-red-400" },
    completed: { label: "Completado", bg: "bg-blue-500/15", text: "text-blue-400" },
  }[status];

  return (
    <span className={`${config.bg} ${config.text} text-xs font-semibold px-2.5 py-1 rounded-full`}>
      {config.label}
    </span>
  );
}

export default function OrderDetailPanel({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Panel — left side */}
      <div className="w-[480px] bg-[#111111] border-r border-border overflow-y-auto animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2A]">
          <h2 className="text-lg font-bold">Detalles del Pedido</h2>
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
                {order.event.image_url && (
                  <img src={order.event.image_url} alt={order.event.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <div className="font-bold text-base">{order.event.name}</div>
                <div className="text-sm text-[#888] mt-1">{formatFullDate(order.event.date)}</div>
                <div className="text-sm text-[#666]">{order.event.venue}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-[#888]">Orden: <span className="text-white font-mono">{order.orderNumber}</span></span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  order.ticketType === "vip"
                    ? "bg-[#D946EF]/15 text-[#D946EF]"
                    : "bg-[#3B82F6]/15 text-[#3B82F6]"
                }`}
              >
                {order.ticketType}
              </span>
              <span className="text-xs text-[#888]">&times; {order.ticketQuantity}</span>
            </div>
            <div className="mt-3">
              <StatusBadge status={order.status} />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#2A2A2A]" />

          {/* Delivery */}
          <div>
            <h3 className="text-sm font-bold mb-3 text-[#aaa]">Entrega</h3>
            <p className="text-sm text-[#888]">
              Boleto entregado a <span className="text-white">{order.delivery.email}</span> el {formatFullDate(order.payment.paidAt)}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-[#2A2A2A]" />

          {/* Payment */}
          <div>
            <h3 className="text-sm font-bold mb-3 text-[#aaa]">Pago</h3>
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-[#555]" />
              <div>
                <div className="text-sm font-semibold">
                  {order.payment.cardBrand} ****{order.payment.cardLast4}
                </div>
                <div className="text-xs text-[#666]">{order.payment.cardholderName}</div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#888]">Subtotal ({order.ticketQuantity} boleto{order.ticketQuantity > 1 ? "s" : ""})</span>
                <span>S/{order.payment.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Tarifa de servicio</span>
                <span>S/{order.payment.serviceFee}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[#2A2A2A]">
                <span>Total</span>
                <span>S/{order.payment.total}</span>
              </div>
            </div>

            <div className="mt-3 text-xs text-[#555]">
              Pagado el {formatFullDate(order.payment.paidAt)} a las {formatTime(order.payment.paidAt)}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#2A2A2A]" />

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="btn-tag-sm bg-[#2A2A2A] hover:bg-[#2A2A2A] text-white text-xs font-semibold px-4 py-2 cursor-pointer border-none transition-colors">
              Ver Recibo
            </button>
            <button className="text-red-400 text-xs font-semibold cursor-pointer bg-transparent border-none hover:text-red-300 transition-colors">
              Reportar un Problema
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop — right side */}
      <div className="flex-1 bg-black/60" onClick={onClose} />
    </div>
  );
}
