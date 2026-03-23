"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Search } from "lucide-react";
import { Sale } from "@/lib/mockDashboard";

type SortField = "datePlaced" | "pricePerTicket" | "totalPayout";
type SortDir = "asc" | "desc";

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

function isCompleted(sale: Sale) {
  return sale.status === "completed" || sale.status === "transferred";
}

export default function SalesTab({
  sales,
  onViewDetails,
}: {
  sales: Sale[];
  onViewDetails: (sale: Sale) => void;
}) {
  const [subTab, setSubTab] = useState<"incomplete" | "completed">("incomplete");
  const [sortField, setSortField] = useState<SortField>("datePlaced");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    let base = sales.filter((s) =>
      subTab === "completed" ? isCompleted(s) : !isCompleted(s)
    );

    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(
        (s) =>
          s.event.name.toLowerCase().includes(q) ||
          s.orderNumber.toLowerCase().includes(q) ||
          s.event.venue.toLowerCase().includes(q)
      );
    }

    return base.sort((a, b) => {
      const aVal = sortField === "datePlaced" ? new Date(a[sortField]).getTime() : a[sortField];
      const bVal = sortField === "datePlaced" ? new Date(b[sortField]).getTime() : b[sortField];
      return sortDir === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [sales, subTab, sortField, sortDir, search]);

  return (
    <div>
      {/* Sub-tabs + Search */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1">
          {(["incomplete", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer border-none transition-colors ${
                subTab === tab
                  ? "bg-primary/15 text-primary"
                  : "bg-transparent text-[#666] hover:text-white"
              }`}
            >
              {tab === "incomplete" ? "Incompletas" : "Completadas"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-surface border border-border rounded-[10px] px-3 h-[36px] w-[260px]">
          <Search className="w-3.5 h-3.5 text-[#555]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar venta..."
            className="bg-transparent border-none text-white text-xs outline-none w-full placeholder:text-muted"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {/* Header */}
        <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_0.8fr_0.6fr] gap-4 px-4 pb-3 border-b border-[#2A2A2A] items-center min-w-[1000px]">
          <span className="text-[#666] text-xs font-semibold uppercase tracking-wide">Evento</span>
          <span className="text-[#666] text-xs font-semibold uppercase tracking-wide">Orden #</span>
          <SortableHeader label="Orden" field="datePlaced" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
          <SortableHeader label="Precio" field="pricePerTicket" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
          <SortableHeader label="Pago Total" field="totalPayout" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
          <span className="text-[#666] text-xs font-semibold uppercase tracking-wide">Estado</span>
          <span className="text-[#666] text-xs font-semibold uppercase tracking-wide">Acciones</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#555] text-sm">
            No hay ventas {subTab === "incomplete" ? "incompletas" : "completadas"}
          </div>
        ) : (
          filtered.map((sale) => (
            <div
              key={sale.id}
              className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_0.8fr_0.6fr] gap-4 px-4 py-4 border-b border-[#2A2A2A] items-center hover:bg-[#181818] transition-colors min-w-[1000px]"
            >
              {/* Event */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2a2040] to-[#2A2A2A] shrink-0 overflow-hidden">
                  {sale.event.image_url && (
                    <img src={sale.event.image_url} alt={sale.event.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{sale.event.name}</div>
                  <div className="text-xs text-[#666] truncate">
                    {formatEventDate(sale.event.date)} &middot; {sale.event.venue}
                  </div>
                </div>
              </div>

              {/* Order # */}
              <div className="text-xs text-[#888] font-mono">{sale.orderNumber.slice(-7)}</div>

              {/* Date Placed */}
              <div className="text-xs text-[#888]">{formatDate(sale.datePlaced)}</div>

              {/* Price/Ticket */}
              <div className="text-sm font-semibold">S/{sale.pricePerTicket}</div>

              {/* Total Payout */}
              <div className="text-sm font-semibold text-green-400">S/{sale.totalPayout}</div>

              {/* Status */}
              <div>
                <StatusBadge status={sale.status} />
              </div>

              {/* Actions */}
              <div>
                <button
                  onClick={() => onViewDetails(sale)}
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
