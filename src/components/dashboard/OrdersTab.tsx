"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Order } from "@/lib/mockDashboard";

type SortField = "datePurchased" | "pricePerTicket" | "amountPaid";
type SortDir = "asc" | "desc";

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

function SortableHeader({
  label,
  field,
  sortField,
  sortDir,
  onSort,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const active = sortField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-[#666] text-xs font-semibold uppercase tracking-wide cursor-pointer bg-transparent border-none hover:text-white transition-colors"
    >
      {label}
      <span className="flex flex-col -space-y-1">
        <ChevronUp className={`w-3 h-3 ${active && sortDir === "asc" ? "text-white" : "text-[#444]"}`} />
        <ChevronDown className={`w-3 h-3 ${active && sortDir === "desc" ? "text-white" : "text-[#444]"}`} />
      </span>
    </button>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function formatEventDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default function OrdersTab({
  orders,
  onViewDetails,
  onViewTicket,
}: {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  onViewTicket?: (order: Order) => void;
}) {
  const [subTab, setSubTab] = useState<"upcoming" | "attended">("upcoming");
  const [sortField, setSortField] = useState<SortField>("datePurchased");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    const base = orders.filter((o) => (subTab === "upcoming" ? o.isUpcoming : !o.isUpcoming));
    return base.sort((a, b) => {
      const aVal = sortField === "datePurchased" ? new Date(a[sortField]).getTime() : a[sortField];
      const bVal = sortField === "datePurchased" ? new Date(b[sortField]).getTime() : b[sortField];
      return sortDir === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [orders, subTab, sortField, sortDir]);

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-1 mb-6">
        {(["upcoming", "attended"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer border-none transition-colors ${
              subTab === tab
                ? "bg-primary/15 text-primary"
                : "bg-transparent text-[#666] hover:text-white"
            }`}
          >
            {tab === "upcoming" ? "Proximos" : "Asistidos"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {/* Header */}
        <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_0.8fr_0.8fr_1fr] gap-4 px-4 pb-3 border-b border-[#2A2A2A] items-center min-w-[1000px]">
          <span className="text-[#666] text-xs font-semibold uppercase tracking-wide">Evento</span>
          <span className="text-[#666] text-xs font-semibold uppercase tracking-wide">Boletos</span>
          <span className="text-[#666] text-xs font-semibold uppercase tracking-wide">Orden #</span>
          <SortableHeader label="Fecha" field="datePurchased" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
          <SortableHeader label="Precio" field="pricePerTicket" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
          <SortableHeader label="Total" field="amountPaid" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
          <span className="text-[#666] text-xs font-semibold uppercase tracking-wide">Estado</span>
          <span className="text-[#666] text-xs font-semibold uppercase tracking-wide">Acciones</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#555] text-sm">
            No hay ordenes {subTab === "upcoming" ? "proximas" : "pasadas"}
          </div>
        ) : (
          filtered.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_0.8fr_0.8fr_1fr] gap-4 px-4 py-4 border-b border-[#2A2A2A] items-center hover:bg-[#181818] transition-colors min-w-[1000px]"
            >
              {/* Event */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2a2040] to-[#2A2A2A] shrink-0 overflow-hidden">
                  {order.event.image_url && (
                    <img src={order.event.image_url} alt={order.event.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{order.event.name}</div>
                  <div className="text-xs text-[#666] truncate">
                    {formatEventDate(order.event.date)} &middot; {order.event.venue}
                  </div>
                </div>
              </div>

              {/* Tickets */}
              <div className="flex items-center gap-2">
                <span className="text-sm">{order.ticketQuantity}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    order.ticketType === "vip"
                      ? "bg-[#D946EF]/15 text-[#D946EF]"
                      : "bg-[#3B82F6]/15 text-[#3B82F6]"
                  }`}
                >
                  {order.ticketType}
                </span>
              </div>

              {/* Order # */}
              <div className="text-xs text-[#888] font-mono">{order.orderNumber.slice(-7)}</div>

              {/* Date */}
              <div className="text-xs text-[#888]">{formatDate(order.datePurchased)}</div>

              {/* Price */}
              <div className="text-sm font-semibold">S/{order.pricePerTicket}</div>

              {/* Amount */}
              <div className="text-sm font-semibold">S/{order.amountPaid}</div>

              {/* Status */}
              <div>
                <StatusBadge status={order.status} />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {onViewTicket && (order.status === "confirmed" || order.status === "completed") && (
                  <button
                    onClick={() => onViewTicket(order)}
                    className="text-[11px] text-green-400 font-semibold cursor-pointer bg-transparent border-none hover:underline"
                  >
                    Ver Boleto
                  </button>
                )}
                <button
                  onClick={() => onViewDetails(order)}
                  className="text-[11px] text-primary font-semibold cursor-pointer bg-transparent border-none hover:underline"
                >
                  Detalles
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
