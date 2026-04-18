"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Star, Info, ChevronDown, Upload, X, FileCheck, Loader2, Clock, CheckCircle2, Share2, ExternalLink } from "lucide-react";
import Link from "next/link";
import jsQR from "jsqr";
import { Event, calcServiceFee, displayPrice, formatFullDate } from "@/lib/supabase";
import { getTicketTypes, getTicketLabel, type TicketTypeConfig } from "@/lib/ticket-types";

type Step = "tickets" | "transfer" | "review";
type Mode = "sell" | "list";

export interface Buyer {
  id: number;
  name: string;
  quantity: number;
  price: number;
  ticket_type: "ga" | "vip";
}

const STEPS: { key: Step; label: string }[] = [
  { key: "tickets", label: "Boletos" },
  { key: "transfer", label: "Transferencia" },
  { key: "review", label: "Resumen" },
];

const GRADIENT_PALETTE = [
  "from-[#EA580B] to-[#D946EF]",
  "from-[#D946EF] to-[#F06529]",
  "from-[#06B6D4] to-[#EA580B]",
  "from-[#F06529] to-[#FBBF24]",
  "from-[#10B981] to-[#06B6D4]",
  "from-[#EA580B] to-[#F06529]",
];

interface SellModalProps {
  event: Event;
  buyers: Buyer[];
  onClose: () => void;
  onComplete: (orderData: SellOrderData, ticketFile: File | null) => Promise<{ ok: boolean; error?: string }>;
}

export interface SellOrderData {
  mode: Mode;
  quantity: number;
  unitPrice: number;
  ticketType: string;      // display label
  ticketTypeValue: string; // raw DB value
  subtotal: number;
  fee: number;
  payout: number;
}

const TIMER_SECONDS = 5 * 60;

function formatTimer(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function SellModal({ event, buyers, onClose, onComplete }: SellModalProps) {
  const [step, setStep] = useState<Step>("tickets");
  const [mode, setMode] = useState<Mode>("sell");
  const [quantity, setQuantity] = useState(1);

  // "Publicar Venta" state
  const [listPrice, setListPrice] = useState("");
  const eventTicketTypes = getTicketTypes(event.id);
  const [listType, setListType] = useState(eventTicketTypes[0]?.value || "ga");
  const [listQty, setListQty] = useState(1);

  // File upload state
  const [ticketFile, setTicketFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Timer starts immediately for "Vender Ahora"
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerActive = mode === "sell";
  const expired = timerActive && timeLeft <= 0;

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, timeLeft]);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  // Highest GA offer for "Vender Ahora"
  const gaBuyers = buyers.filter((b) => b.ticket_type === "ga");
  const highestBuyer = gaBuyers.length > 0
    ? gaBuyers.reduce((best, b) => (b.price > best.price ? b : best), gaBuyers[0])
    : buyers[0];

  // Compute order data
  const sellSubtotal = highestBuyer ? highestBuyer.price * quantity : 0;
  const sellFee = calcServiceFee(sellSubtotal);
  const sellPayout = sellSubtotal - sellFee;

  const listPriceNum = Number(listPrice) || 0;
  const listSubtotal = listPriceNum * listQty;
  const listFee = calcServiceFee(listSubtotal);
  const listPayout = listSubtotal - listFee;

  const orderData: SellOrderData = mode === "sell"
    ? { mode, quantity, unitPrice: highestBuyer?.price ?? 0, ticketType: highestBuyer?.ticket_type === "vip" ? "VIP" : "GA", ticketTypeValue: highestBuyer?.ticket_type ?? "ga", subtotal: sellSubtotal, fee: sellFee, payout: sellPayout }
    : { mode, quantity: listQty, unitPrice: listPriceNum, ticketType: getTicketLabel(event.id, listType), ticketTypeValue: listType, subtotal: listSubtotal, fee: listFee, payout: listPayout };

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1].key);
  };
  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].key);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full h-full sm:h-auto sm:w-[90vw] sm:max-w-[440px] bg-[#111111] sm:border border-[#EA580B]/30 sm:rounded-[20px] p-5 pt-14 sm:p-8 sm:pt-12 sm:max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[300px] h-[120px] bg-[radial-gradient(ellipse,rgba(236,130,23,0.3),transparent_70%)] pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-[22px] text-muted cursor-pointer z-10 hover:text-white"
        >
          &#10005;
        </button>

        {/* Timer bar */}
        {timerActive && !expired && (
          <div className="flex items-center justify-center gap-2 mb-4 relative z-10">
            <Clock className="w-4 h-4 text-[#EA580B]" />
            <span className={`text-sm font-bold tabular-nums ${timeLeft <= 60 ? "text-red-400" : "text-[#EA580B]"}`}>
              {formatTimer(timeLeft)}
            </span>
          </div>
        )}

        {processing ? (
          <ProcessingStep label={mode === "sell" ? "Procesando venta..." : "Publicando entrada..."} />
        ) : success ? (
          <SuccessStep orderData={orderData} eventName={event.name} eventId={event.id} mode={mode} onClose={onClose} />
        ) : expired ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Clock className="w-12 h-12 text-[#555]" />
            <h3 className="text-lg font-bold">Tu sesión ha expirado</h3>
            <p className="text-sm text-[#888] text-center">El tiempo de la sesión se ha agotado. Vuelve a intentarlo.</p>
            <button
              onClick={onClose}
              className="bg-[#2C2C2C] text-white font-semibold py-3 px-8 text-base cursor-pointer hover:brightness-110 transition-colors"
            >
              Volver
            </button>
          </div>
        ) : (
          <>
            <StepIndicator currentIndex={stepIndex} />
            <EventHeader event={event} />

            {step === "tickets" && (
              <TicketsStep
                buyers={buyers}
                highestBuyer={highestBuyer}
                mode={mode} setMode={setMode}
                quantity={quantity} setQuantity={setQuantity}
                listPrice={listPrice} setListPrice={setListPrice}
                listType={listType} setListType={setListType} ticketTypes={eventTicketTypes}
                listQty={listQty} setListQty={setListQty}
                orderData={orderData}
                onContinue={goNext}
              />
            )}
            {step === "transfer" && (
              <TransferStep
                ticketQty={orderData.quantity}
                file={ticketFile}
                setFile={setTicketFile}
                onBack={goBack}
                onContinue={goNext}
              />
            )}
            {step === "review" && (
              <ReviewStep
                orderData={orderData}
                onBack={goBack}
                submitting={submitting}
                error={submitError}
                onComplete={async () => {
                  if (submitting) return;
                  setSubmitting(true);
                  setProcessing(true);
                  setSubmitError(null);
                  try {
                    const result = await onComplete(orderData, ticketFile);
                    if (result.ok) {
                      // Keep processing visible for at least 2s for UX
                      await new Promise(r => setTimeout(r, 2000));
                      setProcessing(false);
                      setSuccess(true);
                    } else {
                      setProcessing(false);
                      setSubmitError(result.error || "Error al publicar la entrada");
                    }
                  } catch {
                    setProcessing(false);
                    setSubmitError("Error al publicar la entrada");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Step indicator ────────────────────────────────── */

function StepIndicator({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="flex items-center justify-between mb-8 relative z-10">
      {STEPS.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const color = done ? "text-primary" : active ? "text-white" : "text-[#555]";
        const lineColor = i < currentIndex ? "bg-primary" : "bg-[#333]";

        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <span className={`text-xs font-semibold whitespace-nowrap ${color}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`h-[2px] flex-1 mx-3 ${lineColor}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Event header ──────────────────────────────────── */

function EventHeader({ event }: { event: Event }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-14 h-14 overflow-hidden bg-[#1a1a1a] shrink-0">
        {event.image_url ? (
          <img src={event.image_url} alt={event.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#2a2040] to-[#2A2A2A]" />
        )}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold truncate">{event.name}</div>
        <div className="text-xs text-[#888] truncate">
          {formatFullDate(event.date)} &middot; {event.venue}
        </div>
      </div>
    </div>
  );
}

/* ── Tickets step ──────────────────────────────────── */

interface TicketsStepProps {
  buyers: Buyer[];
  highestBuyer: Buyer | undefined;
  mode: Mode; setMode: (m: Mode) => void;
  quantity: number; setQuantity: (n: number) => void;
  listPrice: string; setListPrice: (s: string) => void;
  listType: string; setListType: (t: string) => void;
  listQty: number; setListQty: (n: number) => void;
  orderData: SellOrderData;
  onContinue: () => void;
  ticketTypes: TicketTypeConfig[];
}

function TicketsStep({
  highestBuyer, mode, setMode, quantity, setQuantity,
  listPrice, setListPrice, listType, setListType,
  listQty, setListQty, orderData, onContinue, ticketTypes,
}: TicketsStepProps) {
  const gradientClass = GRADIENT_PALETTE[0];
  const isVip = highestBuyer?.ticket_type === "vip";

  return (
    <div>
      <div className="flex border-b border-[#222] mb-6">
        <button
          onClick={() => setMode("sell")}
          className={`flex-1 pb-3 text-sm font-semibold text-center transition-colors ${
            mode === "sell"
              ? "text-[#EA580B] border-b-2 border-[#EA580B]"
              : "text-[#555] hover:text-[#888]"
          }`}
        >
          Vender Ahora
        </button>
        <button
          onClick={() => setMode("list")}
          className={`flex-1 pb-3 text-sm font-semibold text-center transition-colors ${
            mode === "list"
              ? "text-[#EA580B] border-b-2 border-[#EA580B]"
              : "text-[#555] hover:text-[#888]"
          }`}
        >
          Publicar Venta
        </button>
      </div>

      {mode === "sell" ? (
        <>
          {/* Buyer profile card */}
          {highestBuyer ? (
          <div className="flex items-center gap-3 mb-6 py-4 border-b border-[#1a1a1a]">
            <div className={`w-10 h-10 bg-gradient-to-br ${gradientClass} shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{highestBuyer.name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-white fill-white" />
                ))}
                <span className="text-xs text-[#666] ml-1">&middot; 12 ventas</span>
              </div>
              <div className="text-[11px] text-[#555] mt-0.5">Unido en Enero 2024</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] text-[#555]">Vende ahora por</div>
              <div className="text-[26px] font-extrabold leading-tight">
                S/{Math.round(orderData.payout)}
              </div>
            </div>
          </div>
          ) : (
          <div className="mb-6 py-4 border-b border-[#1a1a1a] text-center text-sm text-[#555]">
            No hay compradores interesados todavia
          </div>
          )}

          {highestBuyer && (
          <>
          {/* Ticket type + quantity */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span
                className="btn-tag-sm text-xs font-bold px-3 py-1 text-white"
                style={{ backgroundColor: isVip ? "#D946EF" : "#3B82F6" }}
              >
                {isVip ? "VIP" : "GA"}
              </span>
              <span className="text-sm text-[#888]">Entrada {isVip ? "VIP" : "General"}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 bg-[#1a1a1a] border border-[#333] text-white text-lg flex items-center justify-center cursor-pointer hover:bg-[#222] transition-colors"
              >
                &minus;
              </button>
              <span className="text-sm font-bold w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(highestBuyer.quantity, quantity + 1))}
                className="w-8 h-8 bg-[#1a1a1a] border border-[#333] text-white text-lg flex items-center justify-center cursor-pointer hover:bg-[#222] transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#888]">
                S/{Math.round(highestBuyer.price)} &times; {quantity} boleto{quantity > 1 ? "s" : ""}
              </span>
              <span>S/{Math.round(orderData.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-[#888]">Cargo por servicio</span>
              <span>-S/{orderData.fee}</span>
            </div>
            <div className="border-t border-[#222] pt-3 flex justify-between text-base font-bold">
              <span>Total a recibir</span>
              <span>S/{Math.round(orderData.payout)}</span>
            </div>
          </div>
          </>
          )}
        </>
      ) : (
        <>
          {/* Ticket type selector */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">Tipo de entrada</label>
            <div className="flex flex-wrap gap-2">
              {ticketTypes.map((tt) => (
                <button
                  key={tt.value}
                  onClick={() => setListType(tt.value)}
                  className={`btn-tag-sm text-xs font-bold px-4 py-1.5 transition-colors border-none cursor-pointer ${
                    listType === tt.value
                      ? "text-white"
                      : "bg-[#1a1a1a] text-[#555] hover:text-white"
                  }`}
                  style={listType === tt.value ? { backgroundColor: tt.color } : undefined}
                >
                  {tt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price input */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">Precio por boleto</label>
            <div className="flex items-center bg-[#111111] border border-[#333] px-4">
              <span className="text-sm text-[#888] pr-2">S/</span>
              <input
                type="number"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent border-none text-white text-sm py-3.5 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between mb-6">
            <label className="text-sm font-semibold">Cantidad de boletos</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setListQty(Math.max(1, listQty - 1))}
                className="w-8 h-8 bg-[#1a1a1a] border border-[#333] text-white text-lg flex items-center justify-center cursor-pointer hover:bg-[#222] transition-colors"
              >
                &minus;
              </button>
              <span className="text-sm font-bold w-6 text-center">{listQty}</span>
              <button
                onClick={() => setListQty(listQty + 1)}
                className="w-8 h-8 bg-[#1a1a1a] border border-[#333] text-white text-lg flex items-center justify-center cursor-pointer hover:bg-[#222] transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Pricing breakdown */}
          {orderData.unitPrice > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#888]">
                  S/{orderData.unitPrice} &times; {listQty} boleto{listQty > 1 ? "s" : ""}
                </span>
                <span>S/{Math.round(orderData.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-[#888]">Cargo por servicio</span>
                <span>-S/{orderData.fee}</span>
              </div>
              <div className="border-t border-[#222] pt-3 flex justify-between text-base font-bold">
                <span>Total a recibir</span>
                <span>S/{Math.round(orderData.payout)}</span>
              </div>
            </div>
          )}

          {/* Warning: listing below highest bid */}
          {highestBuyer && orderData.unitPrice > 0 && orderData.unitPrice < highestBuyer.price && (
            <div className="flex gap-3 p-4 bg-[#EA580B]/10 border border-[#EA580B]/30 mb-6">
              <Info className="w-5 h-5 text-[#EA580B] shrink-0 mt-0.5" />
              <p className="text-xs text-[#888] leading-relaxed">
                Ya hay un comprador dispuesto a pagar{" "}
                <span className="text-white font-semibold">S/{displayPrice(highestBuyer.price)}</span>{" "}
                (precio total). Considera usar &quot;Vender Ahora&quot; para vender al instante.
              </p>
            </div>
          )}
        </>
      )}

      <button
        onClick={onContinue}
        className="w-full bg-[#EA580B] hover:bg-[#C74A09] text-white font-bold py-3.5 text-base cursor-pointer transition-colors"
      >
        Continuar
      </button>
    </div>
  );
}

/* ── Transfer step ─────────────────────────────────── */

const ACCEPTED_FORMATS = ".jpg,.jpeg,.png,.pdf,.heic";

function scanImageForQR(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); resolve(false); return; }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height);
      URL.revokeObjectURL(url);
      resolve(!!result);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(false); };
    img.src = url;
  });
}

function TransferStep({
  ticketQty,
  file,
  setFile,
  onBack,
  onContinue,
}: {
  ticketQty: number;
  file: File | null;
  setFile: (file: File | null) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canContinue = !!file && !scanning;

  const handleFile = useCallback(async (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["jpg", "jpeg", "png", "pdf", "heic"].includes(ext)) return;

    setScanning(true);
    setError(null);
    setFile(null);

    const hasQR = await scanImageForQR(f);
    setScanning(false);

    if (hasQR) {
      setFile(f);
      setError(null);
    } else {
      setError("No se detectó un código QR válido en este archivo. Intenta con otra imagen.");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);

  return (
    <div>
      {/* QR upload */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">
          Sube {ticketQty} código{ticketQty > 1 ? "s" : ""} QR válido{ticketQty > 1 ? "s" : ""}
        </label>

        {!file && !scanning ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed cursor-pointer transition-colors ${
              dragging
                ? "border-[#EA580B] bg-[#EA580B]/10"
                : error
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-[#333] bg-[#111] hover:border-[#555]"
            }`}
          >
            <Upload className="w-8 h-8 text-[#555]" />
            <div className="text-center">
              <span className="text-sm text-[#888]">Arrastra y suelta tu archivo aquí o{" "}</span>
              <span className="text-sm text-[#EA580B] font-semibold">buscar archivos</span>
            </div>
            <span className="text-[11px] text-[#555]">JPG, PNG, PDF, HEIC</span>
          </div>
        ) : scanning ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed border-[#333] bg-[#111]">
            <Loader2 className="w-8 h-8 text-[#EA580B] animate-spin" />
            <span className="text-sm text-[#888]">Verificando código QR...</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-[#111] border border-[#222]">
            <FileCheck className="w-5 h-5 text-[#EA580B] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{file!.name}</div>
              <div className="text-[11px] text-[#555]">{(file!.size / 1024).toFixed(0)} KB</div>
            </div>
            <button
              onClick={() => { setFile(null); setError(null); }}
              className="w-7 h-7 flex items-center justify-center text-[#555] hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400 mt-2">{error}</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FORMATS}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex gap-3 p-4 bg-[#111] border border-[#222] mb-6">
        <Info className="w-5 h-5 text-[#EA580B] shrink-0 mt-0.5" />
        <p className="text-xs text-[#888] leading-relaxed">
          UntzDrop entregará tu código QR al comprador una vez confirmada la venta.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="w-1/3 bg-[#2C2C2C] text-white font-semibold py-3.5 text-base cursor-pointer hover:brightness-110 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`flex-1 font-bold py-3.5 text-base transition-colors ${
            canContinue
              ? "bg-[#EA580B] hover:bg-[#C74A09] text-white cursor-pointer"
              : "bg-[#6B3D08] text-[#A0602B] cursor-not-allowed"
          }`}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

/* ── Review step ───────────────────────────────────── */

function ReviewStep({ orderData, onBack, onComplete, submitting, error }: { orderData: SellOrderData; onBack: () => void; onComplete: () => void; submitting: boolean; error?: string | null }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const ticketLabel = orderData.ticketType === "VIP" ? "VIP" : "Admisión General";
  const modeLabel = orderData.mode === "sell" ? "Vender Ahora" : "Publicar Venta";

  return (
    <div>
      <h3 className="text-base font-bold mb-6">Resumen de tu venta</h3>

      {/* Line items */}
      <div className="space-y-4 mb-6">
        <div className="flex items-start justify-between text-sm">
          <div>
            <span className="text-[#888]">{modeLabel}</span>
          </div>
          <div className="text-right">
            <div>{orderData.quantity}x {ticketLabel}</div>
            <div className="text-xs text-[#888] mt-0.5">S/{Math.round(orderData.unitPrice)} c/u</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#888]">Transferencia</span>
          <span className="text-xs text-[#888]">UntzDrop coordinará la entrega</span>
        </div>
      </div>

      {/* Pricing — collapsible subtotal */}
      <div className="border-t border-[#222] pt-4 mb-6">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full flex items-center justify-between text-sm mb-2 cursor-pointer"
        >
          <span className="text-[#888] flex items-center gap-1.5">
            Subtotal
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showBreakdown ? "rotate-180" : ""}`} />
          </span>
          <span>S/{Math.round(orderData.subtotal)}</span>
        </button>

        {showBreakdown && (
          <div className="pl-3 border-l border-[#222] ml-1 mb-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#555]">
                S/{Math.round(orderData.unitPrice)} &times; {orderData.quantity} boleto{orderData.quantity > 1 ? "s" : ""}
              </span>
              <span className="text-[#888]">S/{Math.round(orderData.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#555]">Cargo por servicio</span>
              <span className="text-[#888]">-S/{orderData.fee}</span>
            </div>
          </div>
        )}

        <div className="border-t border-[#222] pt-3 flex justify-between text-base font-bold">
          <span>Total a recibir</span>
          <span>S/{Math.round(orderData.payout)}</span>
        </div>
      </div>

      {/* All-in price note */}
      <div className="flex gap-3 p-4 bg-[#111] border border-[#222] mb-6">
        <Info className="w-5 h-5 text-[#EA580B] shrink-0 mt-0.5" />
        <p className="text-xs text-[#888] leading-relaxed">
          Tu publicación se muestra como precio total para los compradores (incluyendo el cargo por servicio de UntzDrop). Esto es diferente a tu precio de publicación y pago neto.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="w-1/3 bg-[#2C2C2C] text-white font-semibold py-3.5 text-base cursor-pointer hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Atrás
        </button>
        <button
          onClick={onComplete}
          disabled={submitting}
          className={`flex-1 font-bold py-3.5 text-base transition-colors flex items-center justify-center gap-2 ${
            submitting
              ? "bg-[#6B3D08] text-[#A0602B] cursor-not-allowed"
              : "bg-[#EA580B] hover:bg-[#C74A09] text-white cursor-pointer"
          }`}
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</>
          ) : orderData.mode === "sell"
            ? `Vender Ahora por S/${Math.round(orderData.payout)}`
            : "Completar Venta"}
        </button>
      </div>
    </div>
  );
}

/* ── Processing step ───────────────────────────────── */

function ProcessingStep({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-5">
      <Loader2 className="w-10 h-10 text-[#EA580B] animate-spin" />
      <h3 className="text-lg font-bold">{label}</h3>
      <div className="w-full max-w-[260px] h-1.5 bg-[#222] overflow-hidden">
        <div className="h-full bg-[#EA580B] animate-[progress_2s_ease-in-out_infinite]" style={{ width: "100%", animation: "progress 2s ease-in-out infinite" }} />
      </div>
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <p className="text-xs text-[#666]">Esto puede tomar unos segundos...</p>
    </div>
  );
}

/* ── Success step ──────────────────────────────────── */

function SuccessStep({ orderData, eventName, eventId, mode, onClose }: { orderData: SellOrderData; eventName: string; eventId: number; mode: Mode; onClose: () => void }) {
  const ticketLabel = orderData.ticketType === "VIP" ? "VIP" : "GA";
  const isSell = mode === "sell";
  const eventUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/events/${eventId}`;

  const handleShare = async () => {
    const text = isSell
      ? `Vendí mi entrada para ${eventName} en UntzDrop`
      : `Estoy vendiendo mi entrada para ${eventName} en UntzDrop`;
    if (navigator.share) {
      try { await navigator.share({ title: eventName, text, url: eventUrl }); } catch {}
    } else {
      await navigator.clipboard.writeText(eventUrl);
      alert("Link copiado al portapapeles");
    }
  };

  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-[#EA580B]/20 blur-2xl rounded-full" />
        <div className="relative w-16 h-16 bg-[#EA580B]/10 border-2 border-[#EA580B] flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-[#EA580B]" />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-2">
        {isSell ? "¡Venta completada!" : "¡Entrada publicada!"}
      </h3>
      <p className="text-sm text-[#888] mb-6 max-w-[320px]">
        {isSell
          ? "Tu entrada fue vendida. UntzDrop coordinará la entrega con el comprador."
          : "Tu entrada ya está visible para los compradores. Te avisaremos cuando alguien la compre."}
      </p>

      <div className="w-full bg-[#1a1a1a] border border-[#222] p-4 mb-6 text-left space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#888]">Evento</span>
          <span className="font-semibold text-right max-w-[60%] truncate">{eventName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#888]">Cantidad</span>
          <span className="font-semibold">{orderData.quantity}x {ticketLabel}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#888]">Precio por entrada</span>
          <span className="font-semibold">S/{Math.round(orderData.unitPrice)}</span>
        </div>
        <div className="border-t border-[#222] pt-3 flex justify-between text-base font-bold">
          <span>{isSell ? "Total recibido" : "Total a recibir"}</span>
          <span className="text-[#EA580B]">S/{Math.round(orderData.payout)}</span>
        </div>
      </div>

      <div className="flex gap-3 w-full mb-3">
        <button
          onClick={handleShare}
          className="flex-1 bg-[#2C2C2C] hover:bg-[#333] text-white font-semibold py-3 text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 border-none"
        >
          <Share2 className="w-4 h-4" /> Compartir
        </button>
        <Link
          href={`/events/${eventId}`}
          onClick={onClose}
          className="flex-1 bg-[#2C2C2C] hover:bg-[#333] text-white font-semibold py-3 text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 no-underline"
        >
          <ExternalLink className="w-4 h-4" /> Ver evento
        </Link>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-[#EA580B] hover:bg-[#C74A09] text-white font-bold py-3.5 text-base cursor-pointer transition-colors border-none"
      >
        Listo
      </button>
    </div>
  );
}
