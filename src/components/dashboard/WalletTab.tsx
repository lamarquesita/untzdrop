"use client";

import { useState } from "react";
import { Plus, Search, Gift, Info, ExternalLink, Loader2 } from "lucide-react";
import { getAuthHeaders } from "@/lib/supabase";
import BankAccountModal from "./BankAccountModal";

/* ─── Info Tooltip ───────────────────────────────────── */
function InfoTip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="bg-transparent border-none cursor-help p-0 ml-1.5"
      >
        <Info className="w-3.5 h-3.5 text-[#555] hover:text-[#888] transition-colors" />
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#222] border border-[#333] text-[10px] text-[#ccc] w-[200px] z-50 leading-relaxed">
          {text}
        </div>
      )}
    </span>
  );
}

/* ─── Mock Data ──────────────────────────────────────── */
const mockBalance = 247.50;
const mockSiteCredit = 15.00;

const mockAccounts = [
  { id: "acc_1", bank: "BCP", last4: "4821", type: "Ahorros", primary: true },
];

interface Transaction {
  id: string;
  date: string;
  event: {
    name: string;
    date: string;
    venue: string;
    image_url: string | null;
    ticketType: "ga" | "vip" | null;
  };
  order: string;
  type: "sale" | "purchase" | "offer" | "withdrawal" | "other";
  amount: number;
}

const IMG = "https://ymtoyhtqvnalqlezadly.supabase.co/storage/v1/object/public/event-images";

const mockTransactions: Transaction[] = [
  { id: "tx_1", date: "2026-04-05T14:30:00", event: { name: "Anjunadeep", date: "2026-04-17T17:00:00", venue: "Open Air Lima", image_url: `${IMG}/anjunadeep.jpg`, ticketType: "ga" }, order: "CV-20260401-001", type: "sale", amount: 153.00 },
  { id: "tx_2", date: "2026-04-03T10:15:00", event: { name: "Porter Robinson", date: "2026-05-02T00:00:00", venue: "Centro de Convenciones Barranco", image_url: `${IMG}/poter.jpg`, ticketType: "vip" }, order: "CV-20260402-002", type: "purchase", amount: -275.00 },
  { id: "tx_3", date: "2026-04-01T09:00:00", event: { name: "Ultra Peru", date: "2026-05-02T17:00:00", venue: "Cultural Lima", image_url: `${IMG}/ULTRA-BUENOS-AIRES-2026-SHARE-IMAGE.png`, ticketType: "ga" }, order: "CV-20260403-003", type: "purchase", amount: -396.00 },
  { id: "tx_4", date: "2026-03-28T18:00:00", event: { name: "Circoloco", date: "2026-03-21T01:00:00", venue: "Fundo Mamacona", image_url: `${IMG}/circoloco.jpg`, ticketType: "ga" }, order: "CV-20260321-005", type: "sale", amount: 178.00 },
  { id: "tx_5", date: "2026-03-25T12:00:00", event: { name: "Retiro a BCP ****4821", date: "", venue: "", image_url: null, ticketType: null }, order: "—", type: "withdrawal", amount: -500.00 },
  { id: "tx_6", date: "2026-03-20T11:20:00", event: { name: "Flower Power", date: "2026-04-03T03:00:00", venue: "Joia", image_url: `${IMG}/sasha.jpg`, ticketType: "vip" }, order: "CV-20260403-006", type: "purchase", amount: -198.00 },
  { id: "tx_7", date: "2026-03-18T08:00:00", event: { name: "Maddix", date: "2026-04-19T02:00:00", venue: "Paradiso Lima", image_url: `${IMG}/maddix_396803.png`, ticketType: "ga" }, order: "OFR-20260318-001", type: "offer", amount: -120.00 },
  { id: "tx_8", date: "2026-03-15T14:00:00", event: { name: "Referido: Ana G.", date: "", venue: "Crédito de referido", image_url: null, ticketType: null }, order: "—", type: "other", amount: 15.00 },
  { id: "tx_9", date: "2026-03-10T10:00:00", event: { name: "Retiro a BCP ****4821", date: "", venue: "", image_url: null, ticketType: null }, order: "—", type: "withdrawal", amount: -300.00 },
  { id: "tx_10", date: "2026-03-05T16:30:00", event: { name: "Fabric", date: "2026-04-26T02:00:00", venue: "Villa", image_url: `${IMG}/fabric.jpg`, ticketType: "ga" }, order: "CV-20260305-010", type: "sale", amount: 210.00 },
];

const filters = [
  { value: "sale", label: "Ventas" },
  { value: "purchase", label: "Compras" },
  { value: "offer", label: "Ofertas" },
  { value: "withdrawal", label: "Retiros" },
  { value: "other", label: "Otro" },
] as const;

type FilterType = typeof filters[number]["value"] | null;

const typeConfig = {
  sale: { label: "Venta", color: "text-green-400" },
  purchase: { label: "Compra", color: "text-white" },
  offer: { label: "Oferta", color: "text-yellow-400" },
  withdrawal: { label: "Retiro", color: "text-red-400" },
  other: { label: "Otro", color: "text-primary" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function formatEventDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

/* ─── Main Component ─────────────────────────────────── */
export default function WalletTab() {
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBankModal, setShowBankModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setWithdrawMsg(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/payouts/request", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setWithdrawMsg({ type: "error", text: data.error || "Error al procesar el retiro" });
      } else {
        setWithdrawMsg({ type: "success", text: `Retiro de S/${data.amount.toFixed(2)} procesado. Recibirás los fondos en 1-2 días hábiles.` });
      }
    } catch {
      setWithdrawMsg({ type: "error", text: "Error de conexión" });
    }
    setWithdrawing(false);
  };

  const filtered = mockTransactions.filter((tx) => {
    if (activeFilter && tx.type !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return tx.event.name.toLowerCase().includes(q) || tx.order.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top row: Balance + Site Credit + Accounts + Referral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Balance */}
        <div className="bg-[#111] border border-[#2A2A2A] p-5">
          <div className="flex items-center text-xs text-[#888] font-semibold uppercase tracking-wide mb-1">
            Balance Disponible
            <InfoTip text="Fondos disponibles de tus ventas completadas que puedes retirar a tu cuenta bancaria." />
          </div>
          <div className="text-3xl font-bold font-[family-name:var(--font-chakra)]">
            S/{mockBalance.toFixed(2)}
          </div>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || mockBalance <= 0}
            className={`btn-tag-sm text-white text-xs font-semibold px-4 py-2 cursor-pointer border-none transition-all mt-3 flex items-center gap-2 ${
              withdrawing || mockBalance <= 0 ? "bg-[#333] cursor-not-allowed" : "bg-primary hover:brightness-110"
            }`}
          >
            {withdrawing && <Loader2 className="w-3 h-3 animate-spin" />}
            {withdrawing ? "Procesando..." : "Retirar Fondos"}
          </button>
          {withdrawMsg && (
            <p className={`text-[10px] mt-2 ${withdrawMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {withdrawMsg.text}
            </p>
          )}
        </div>

        {/* Site Credit */}
        <div className="bg-[#111] border border-[#2A2A2A] p-5">
          <div className="flex items-center text-xs text-[#888] font-semibold uppercase tracking-wide mb-1">
            Crédito del Sitio
            <InfoTip text="Crédito que puedes usar para comprar entradas. Se obtiene por referidos, promociones o reembolsos. No es retirable." />
          </div>
          <div className="text-3xl font-bold font-[family-name:var(--font-chakra)] text-primary">
            S/{mockSiteCredit.toFixed(2)}
          </div>
          <p className="text-[10px] text-[#555] mt-3">Se aplica automáticamente en tu próxima compra</p>
        </div>

        {/* Bank Accounts */}
        <div className="bg-[#111] border border-[#2A2A2A] p-5">
          <div className="flex items-center text-xs text-[#888] font-semibold uppercase tracking-wide mb-3">
            Cuentas Bancarias
            <InfoTip text="Cuentas vinculadas donde recibirás los pagos de tus ventas y retiros de fondos." />
          </div>
          {mockAccounts.length > 0 ? (
            <div className="space-y-2 mb-3">
              {mockAccounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold">{acc.bank}</span>
                    <span className="text-xs text-[#888] ml-2">****{acc.last4}</span>
                    <span className="text-[10px] text-[#666] ml-2">{acc.type}</span>
                  </div>
                  {acc.primary && (
                    <span className="text-[10px] text-primary font-semibold">Principal</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#666] mb-3">No hay cuentas vinculadas</p>
          )}
          <button
            onClick={() => setShowBankModal(true)}
            className="btn-tag-sm bg-[#2A2A2A] hover:bg-[#333] text-white text-xs font-semibold px-3 py-2 cursor-pointer border-none transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar Cuenta
          </button>
        </div>

        {/* Referral */}
        <div className="bg-[#111] border border-[#2A2A2A] p-5">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">Refiere y Gana S/15</span>
            <InfoTip text="Invita amigos a UntzDrop. Cuando hagan su primera compra, ambos reciben S/15 de crédito." />
          </div>
          <p className="text-xs text-[#888] mb-3">Comparte tu enlace con amigos. Cuando hagan su primera compra, ambos reciben S/15 de crédito.</p>
          <a
            href="https://untzdrop.com/r/cam"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tag-sm bg-primary hover:brightness-110 text-white text-xs font-semibold px-4 py-2 cursor-pointer border-none transition-all inline-flex items-center gap-1.5"
          >
            Compartir Enlace <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Balance History */}
      <div>
        <div className="flex items-center mb-4">
          <h3 className="text-sm font-bold">Historial de Balance</h3>
          <InfoTip text="Registro de todas las transacciones en tu cuenta: ventas, compras, ofertas, retiros y créditos." />
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 bg-[#111] border border-[#2A2A2A] flex items-center gap-2 px-3 h-[38px]">
            <Search className="w-4 h-4 text-[#555] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por evento u orden..."
              className="bg-transparent border-none text-white text-xs outline-none w-full placeholder:text-[#555]"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(activeFilter === f.value ? null : f.value)}
                className={`text-[11px] font-semibold px-3 py-1.5 cursor-pointer border transition-colors ${
                  activeFilter === f.value
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-transparent border-[#2A2A2A] text-[#888] hover:text-white hover:border-[#444]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-[0.8fr_2fr_1fr_0.7fr_0.8fr] gap-3 px-3 py-2 border-b border-[#2A2A2A]">
              <span className="text-[#666] text-xs font-semibold uppercase tracking-wide">Fecha</span>
              <span className="text-[#666] text-xs font-semibold uppercase tracking-wide">Evento</span>
              <span className="text-[#666] text-xs font-semibold uppercase tracking-wide">Orden</span>
              <span className="text-[#666] text-xs font-semibold uppercase tracking-wide">Tipo</span>
              <span className="text-[#666] text-xs font-semibold uppercase tracking-wide text-right">Monto</span>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-[#555] text-sm">No se encontraron transacciones</div>
            ) : (
              filtered.map((tx) => (
                <div key={tx.id} className="grid grid-cols-[0.8fr_2fr_1fr_0.7fr_0.8fr] gap-3 px-3 py-3 border-b border-[#1A1A1A] hover:bg-[#111] transition-colors items-center">
                  {/* Date */}
                  <span className="text-xs text-[#888]">{formatDate(tx.date)}</span>

                  {/* Event with image */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#2a2040] to-[#1a1a2e] shrink-0 overflow-hidden">
                      {tx.event.image_url && (
                        <img src={tx.event.image_url} alt={tx.event.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-white font-medium truncate">{tx.event.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {tx.event.date && (
                          <span className="text-[10px] text-[#666]">{formatEventDate(tx.event.date)}</span>
                        )}
                        {tx.event.venue && (
                          <span className="text-[10px] text-[#555] truncate">{tx.event.venue}</span>
                        )}
                        {tx.event.ticketType && (
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 ${
                            tx.event.ticketType === "vip"
                              ? "bg-[#D946EF]/15 text-[#D946EF]"
                              : "bg-[#3B82F6]/15 text-[#3B82F6]"
                          }`}>
                            {tx.event.ticketType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order */}
                  <span className="text-xs text-[#888] font-mono">{tx.order}</span>

                  {/* Type */}
                  <span className={`text-xs font-semibold ${typeConfig[tx.type].color}`}>
                    {typeConfig[tx.type].label}
                  </span>

                  {/* Amount */}
                  <span className={`text-xs font-semibold text-right ${tx.amount >= 0 ? "text-green-400" : "text-white"}`}>
                    {tx.amount >= 0 ? "+" : ""}S/{Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showBankModal && (
        <BankAccountModal
          accounts={mockAccounts}
          onClose={() => setShowBankModal(false)}
        />
      )}
    </div>
  );
}
