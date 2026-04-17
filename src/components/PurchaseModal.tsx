"use client";

import { useState, useEffect, useRef } from "react";
import { Star, Ticket, CreditCard, Info, Lock, ChevronDown, Clock } from "lucide-react";
import { Event, Listing, calcServiceFee, formatFullDate, getAuthHeaders } from "@/lib/supabase";
import StripeCardForm, { useStripePayment, type StripeCardFormRef } from "./StripeCardForm";

type Step = "tickets" | "delivery" | "payment" | "review";
type Mode = "buy" | "offer";

const STEPS: { key: Step; label: string }[] = [
  { key: "tickets", label: "Boletos" },
  { key: "delivery", label: "Entrega" },
  { key: "payment", label: "Pago" },
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

interface PurchaseModalProps {
  event: Event;
  listing: Listing;
  onClose: () => void;
}

interface OrderData {
  mode: Mode;
  quantity: number;
  unitPrice: number;
  ticketType: string;
  subtotal: number;
  fee: number;
  total: number;
}

const TIMER_SECONDS = 5 * 60;

function formatTimer(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function PurchaseModal({ event, listing, onClose }: PurchaseModalProps) {
  const [step, setStep] = useState<Step>("tickets");
  const [mode, setMode] = useState<Mode>("buy");
  const [quantity, setQuantity] = useState(1);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerType, setOfferType] = useState<"ga" | "vip">("ga");
  const [offerQty, setOfferQty] = useState(1);

  // Delivery info state
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("51");

  // Payment processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple">("card");
  const [cardLast4, setCardLast4] = useState<string>("");

  // Timer for "Comprar Ahora"
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const expired = timerActive && timeLeft <= 0;

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, timeLeft]);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  // Compute order data based on mode
  const buySubtotal = listing.price * quantity;
  const buyFee = calcServiceFee(buySubtotal);
  const buyTotal = buySubtotal + buyFee;

  const offerPriceNum = Number(offerPrice) || 0;
  const offerSubtotal = offerPriceNum * offerQty;
  const offerFee = calcServiceFee(offerSubtotal);
  const offerTotal = offerSubtotal + offerFee;

  const orderData: OrderData = mode === "buy"
    ? { mode, quantity, unitPrice: listing.price, ticketType: listing.ticket_type === "vip" ? "VIP" : "GA", subtotal: buySubtotal, fee: buyFee, total: buyTotal }
    : { mode, quantity: offerQty, unitPrice: offerPriceNum, ticketType: offerType === "vip" ? "VIP" : "GA", subtotal: offerSubtotal, fee: offerFee, total: offerTotal };

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1].key);
  };
  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].key);
  };

  const handleDeliveryContinue = () => {
    if (mode === "buy" && !timerActive) {
      setTimerActive(true);
    }
    goNext();
  };

  const total = mode === "buy" ? buyTotal : offerTotal;
  const cardFormRef = useRef<StripeCardFormRef>(null);
  const { confirmPayment, confirmWithApplePay, applePayAvailable } = useStripePayment({
    total: Math.round(total * 100),
    label: `UntzDrop - ${event.name}`,
  });

  const fetchClientSecret = async () => {
    const authHeaders = await getAuthHeaders();
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({
        listing_id: listing.id,
        quantity: mode === "buy" ? quantity : offerQty,
        delivery_email: deliveryEmail,
        delivery_phone: deliveryPhone,
        save_card: false,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Checkout failed");
    }
    const { client_secret } = await response.json();
    return client_secret as string;
  };

  const handleCheckout = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setPaymentError("");

    try {
      let paymentIntent;
      if (paymentMethod === "apple") {
        paymentIntent = await confirmWithApplePay(fetchClientSecret);
      } else {
        const clientSecret = await fetchClientSecret();
        paymentIntent = await confirmPayment(clientSecret);
      }

      if (paymentIntent?.status === "succeeded") {
        alert("¡Compra exitosa! Recibirás tu código QR por correo electrónico.");
        onClose();
      }

    } catch (error) {
      console.error("Checkout error:", error);
      setPaymentError(error instanceof Error ? error.message : "Error processing payment");
    } finally {
      setIsProcessing(false);
    }
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

        {expired ? (
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
                listing={listing}
                mode={mode} setMode={setMode}
                quantity={quantity} setQuantity={setQuantity}
                offerPrice={offerPrice} setOfferPrice={setOfferPrice}
                offerType={offerType} setOfferType={setOfferType}
                offerQty={offerQty} setOfferQty={setOfferQty}
                orderData={orderData}
                onContinue={goNext}
              />
            )}
            {step === "delivery" && (
              <DeliveryStep
                mode={mode}
                email={deliveryEmail}
                phone={deliveryPhone}
                setEmail={setDeliveryEmail}
                setPhone={setDeliveryPhone}
                onBack={goBack}
                onContinue={handleDeliveryContinue}
              />
            )}
            {step === "payment" && (
              <PaymentStep mode={mode} onBack={goBack} onContinue={(last4) => {
                if (last4) setCardLast4(last4);
                goNext();
              }} method={paymentMethod} setMethod={setPaymentMethod} applePayAvailable={applePayAvailable} cardFormRef={cardFormRef} />
            )}
            {step === "review" && (
              <ReviewStep
                mode={mode}
                orderData={orderData}
                onBack={goBack}
                onCheckout={handleCheckout}
                isProcessing={isProcessing}
                paymentError={paymentError}
                cardLast4={cardLast4}
                paymentMethod={paymentMethod}
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
  listing: Listing;
  mode: Mode; setMode: (m: Mode) => void;
  quantity: number; setQuantity: (n: number) => void;
  offerPrice: string; setOfferPrice: (s: string) => void;
  offerType: "ga" | "vip"; setOfferType: (t: "ga" | "vip") => void;
  offerQty: number; setOfferQty: (n: number) => void;
  orderData: OrderData;
  onContinue: () => void;
}

function TicketsStep({
  listing, mode, setMode, quantity, setQuantity,
  offerPrice, setOfferPrice, offerType, setOfferType,
  offerQty, setOfferQty, orderData, onContinue,
}: TicketsStepProps) {
  const isVip = listing.ticket_type === "vip";
  const gradientClass = GRADIENT_PALETTE[0];
  const sellerName =
    listing.seller_id.length > 8
      ? listing.seller_id.slice(0, 4) + "..." + listing.seller_id.slice(-4)
      : listing.seller_id;

  return (
    <div>
      <div className="flex border-b border-[#222] mb-6">
        <button
          onClick={() => setMode("buy")}
          className={`flex-1 pb-3 text-sm font-semibold text-center transition-colors ${
            mode === "buy"
              ? "text-[#EA580B] border-b-2 border-[#EA580B]"
              : "text-[#555] hover:text-[#888]"
          }`}
        >
          Comprar Ahora
        </button>
        <button
          onClick={() => setMode("offer")}
          className={`flex-1 pb-3 text-sm font-semibold text-center transition-colors ${
            mode === "offer"
              ? "text-[#EA580B] border-b-2 border-[#EA580B]"
              : "text-[#555] hover:text-[#888]"
          }`}
        >
          Hacer Oferta
        </button>
      </div>

      {mode === "buy" ? (
        <>
          <div className="flex items-center gap-3 mb-6 py-4 border-b border-[#1a1a1a]">
            <div className={`w-10 h-10 bg-gradient-to-br ${gradientClass} shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{sellerName}</div>
              <div className="flex items-center gap-1 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-white fill-white" />
                ))}
                <span className="text-xs text-[#666] ml-1">&middot; 12 ventas</span>
              </div>
              <div className="text-[11px] text-[#555] mt-0.5">Unido en Enero 2024</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] text-[#555]">Compra ahora por</div>
              <div className="text-[26px] font-extrabold leading-tight">
                S/{Math.round(orderData.total)}
              </div>
            </div>
          </div>

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
                onClick={() => setQuantity(Math.min(listing.quantity, quantity + 1))}
                className="w-8 h-8 bg-[#1a1a1a] border border-[#333] text-white text-lg flex items-center justify-center cursor-pointer hover:bg-[#222] transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#888]">
                S/{Math.round(listing.price)} &times; {quantity} boleto{quantity > 1 ? "s" : ""}
              </span>
              <span>S/{Math.round(orderData.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-[#888]">Cargo por servicio</span>
              <span>S/{orderData.fee}</span>
            </div>
            <div className="border-t border-[#222] pt-3 flex justify-between text-base font-bold">
              <span>Total</span>
              <span>S/{Math.round(orderData.total)}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">Tipo de boleto</label>
            <div className="flex gap-2">
              <button
                onClick={() => setOfferType("ga")}
                className={`btn-tag-sm text-xs font-bold px-4 py-1.5 transition-colors ${
                  offerType === "ga"
                    ? "bg-[#3B82F6] text-white"
                    : "bg-[#1a1a1a] text-[#555] hover:text-white"
                }`}
              >
                General (GA)
              </button>
              <button
                onClick={() => setOfferType("vip")}
                className={`btn-tag-sm text-xs font-bold px-4 py-1.5 transition-colors ${
                  offerType === "vip"
                    ? "bg-[#D946EF] text-white"
                    : "bg-[#1a1a1a] text-[#555] hover:text-white"
                }`}
              >
                VIP
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">Precio por boleto</label>
            <div className="flex items-center bg-[#111111] border border-[#333] px-4">
              <span className="text-sm text-[#888] pr-2">S/</span>
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent border-none text-white text-sm py-3.5 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="text-sm font-semibold">Cantidad de boletos</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOfferQty(Math.max(1, offerQty - 1))}
                className="w-8 h-8 bg-[#1a1a1a] border border-[#333] text-white text-lg flex items-center justify-center cursor-pointer hover:bg-[#222] transition-colors"
              >
                &minus;
              </button>
              <span className="text-sm font-bold w-6 text-center">{offerQty}</span>
              <button
                onClick={() => setOfferQty(offerQty + 1)}
                className="w-8 h-8 bg-[#1a1a1a] border border-[#333] text-white text-lg flex items-center justify-center cursor-pointer hover:bg-[#222] transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {orderData.unitPrice > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#888]">
                  S/{orderData.unitPrice} &times; {offerQty} boleto{offerQty > 1 ? "s" : ""}
                </span>
                <span>S/{Math.round(orderData.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-[#888]">Cargo por servicio</span>
                <span>S/{orderData.fee}</span>
              </div>
              <div className="border-t border-[#222] pt-3 flex justify-between text-base font-bold">
                <span>Total</span>
                <span>S/{Math.round(orderData.total)}</span>
              </div>
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

/* ── Delivery step ─────────────────────────────────── */

const COUNTRY_CODES: { code: string; iso: string }[] = [
  { code: "+51", iso: "pe" },
  { code: "+1", iso: "us" },
  { code: "+52", iso: "mx" },
  { code: "+54", iso: "ar" },
  { code: "+55", iso: "br" },
  { code: "+56", iso: "cl" },
  { code: "+57", iso: "co" },
  { code: "+58", iso: "ve" },
  { code: "+593", iso: "ec" },
  { code: "+591", iso: "bo" },
  { code: "+595", iso: "py" },
  { code: "+598", iso: "uy" },
  { code: "+34", iso: "es" },
  { code: "+44", iso: "gb" },
  { code: "+49", iso: "de" },
  { code: "+33", iso: "fr" },
];

function getCountryMatch(phone: string): { iso: string; dialCode: string } | null {
  const trimmed = phone.replace(/\s/g, "");
  const withPlus = trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
  const match = [...COUNTRY_CODES]
    .sort((a, b) => b.code.length - a.code.length)
    .find((c) => withPlus.startsWith(c.code));
  return match ? { iso: match.iso, dialCode: match.code } : null;
}

function DeliveryStep({
  mode,
  email,
  phone,
  setEmail,
  setPhone,
  onBack,
  onContinue,
}: {
  mode: Mode;
  email: string;
  phone: string;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {

  const countryMatch = getCountryMatch(phone);

  return (
    <div>
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="UntzDrop" className="h-6 w-6" />
          <span className="text-sm font-bold">UntzDrop</span>
        </div>
        <div className="text-[#333] text-lg">&times;</div>
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-[#888]" />
          <span className="text-sm font-bold text-[#888]">Vendedor</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@ejemplo.com"
          className="w-full bg-[#111111] border border-[#333] px-4 py-3.5 text-sm text-white outline-none placeholder:text-[#555]"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Número de teléfono</label>
        <div className="flex items-center bg-[#111111] border border-[#333]">
          <div className="pl-4 pr-3 shrink-0 border-r border-[#333] py-3.5 flex items-center gap-2">
            {countryMatch && (
              <img
                src={`https://flagcdn.com/w40/${countryMatch.iso}.png`}
                alt={countryMatch.iso}
                className="w-5 h-3.5 object-cover"
              />
            )}
            <span className="text-xs text-[#888]">
              {countryMatch ? countryMatch.dialCode : "+"}
            </span>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s]/g, ""))}
            placeholder="51 999 999 999"
            className="flex-1 bg-transparent border-none px-3 py-3.5 text-sm text-white outline-none placeholder:text-[#555]"
          />
        </div>
      </div>

      {mode === "buy" ? (
        <div className="flex gap-3 p-4 bg-[#111] border border-[#222] mb-6">
          <Info className="w-5 h-5 text-[#EA580B] shrink-0 mt-0.5" />
          <p className="text-xs text-[#888] leading-relaxed">
            Tu código QR estará disponible después de la compra y será entregado por correo electrónico, mensaje de texto y en la pestaña de pedidos de tu cuenta en UntzDrop.
          </p>
        </div>
      ) : (
        <div className="flex gap-3 p-4 bg-[#111] border border-[#222] mb-6">
          <Info className="w-5 h-5 text-[#EA580B] shrink-0 mt-0.5" />
          <p className="text-xs text-[#888] leading-relaxed">
            Se realizará una autorización temporal en tu método de pago para verificar la disponibilidad de fondos. Si cancelas o tu oferta no es aceptada, la retención se libera de forma inmediata.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="w-1/3 bg-[#2C2C2C] text-white font-semibold py-3.5 text-base cursor-pointer hover:brightness-110 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={onContinue}
          className="flex-1 bg-[#EA580B] hover:bg-[#C74A09] text-white font-bold py-3.5 text-base cursor-pointer transition-colors"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}

/* ── Payment step ──────────────────────────────────── */

function PaymentStep({ mode, onBack, onContinue, method, setMethod, applePayAvailable, cardFormRef }: { mode: Mode; onBack: () => void; onContinue: (last4?: string) => void; method: "card" | "apple"; setMethod: (m: "card" | "apple") => void; applePayAvailable: boolean; cardFormRef: React.RefObject<StripeCardFormRef | null> }) {
  const [saveCard, setSaveCard] = useState(false);
  const [hasSavedCard] = useState(false);
  const [showNewCard, setShowNewCard] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cardError, setCardError] = useState("");

  const showCardForm = !hasSavedCard || showNewCard;

  const handleContinue = async () => {
    if (method === "apple") {
      onContinue();
      return;
    }
    if (!cardFormRef.current) return;
    setVerifying(true);
    setCardError("");
    try {
      const result = await cardFormRef.current.verifyCard();
      if (result.error) {
        setCardError(result.error);
      } else {
        onContinue(result.last4);
      }
    } catch {
      setCardError("Error al verificar la tarjeta");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <h3 className="text-base font-bold mb-6">Detalles de pago</h3>

      {/* Apple Pay toggle — mobile only */}
      {applePayAvailable && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMethod("card")}
            className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors ${
              method === "card"
                ? "bg-[#2C2C2C] text-white"
                : "bg-transparent text-[#555] hover:text-[#888]"
            }`}
          >
            Tarjeta
          </button>
          <button
            onClick={() => setMethod("apple")}
            className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors ${
              method === "apple"
                ? "bg-[#2C2C2C] text-white"
                : "bg-transparent text-[#555] hover:text-[#888]"
            }`}
          >
            Apple Pay
          </button>
        </div>
      )}

      {method === "card" ? (
        <>
          {hasSavedCard && !showNewCard && (
            <div className="mb-6">
              <div className="flex items-center gap-3 p-4 bg-[#111] border border-[#222] mb-3">
                <CreditCard className="w-5 h-5 text-[#888]" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">Tarjeta guardada</div>
                  <div className="text-[11px] text-[#555]">Tarjeta de crédito/débito</div>
                </div>
              </div>
              <button
                onClick={() => setShowNewCard(true)}
                className="text-xs text-[#EA580B] font-semibold cursor-pointer hover:underline"
              >
                + Agregar nueva tarjeta
              </button>
            </div>
          )}

          {showCardForm && (
            <>
              <StripeCardForm ref={cardFormRef} onReady={setCardReady} />

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[#888]">Guardar para uso futuro</span>
                <button
                  onClick={() => setSaveCard(!saveCard)}
                  className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${
                    saveCard ? "bg-[#EA580B]" : "bg-[#333]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      saveCard ? "left-5" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {hasSavedCard && (
                <button
                  onClick={() => setShowNewCard(false)}
                  className="text-xs text-[#888] font-semibold cursor-pointer hover:text-white mb-4 block"
                >
                  Usar tarjeta guardada
                </button>
              )}
            </>
          )}

          <p className="text-xs text-[#555] leading-relaxed mb-4">
            Al proporcionar la información de tu tarjeta, autorizas a UntzDrop a cobrar en tu tarjeta pagos futuros de acuerdo con sus términos.
          </p>

          {mode === "offer" && (
            <div className="flex gap-3 p-4 bg-[#111] border border-[#222] mb-6">
              <Info className="w-5 h-5 text-[#EA580B] shrink-0 mt-0.5" />
              <p className="text-xs text-[#888] leading-relaxed">
                Se realizará una autorización temporal para verificar fondos. Si cancelas o tu oferta no es aceptada, la retención se libera de forma inmediata.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center py-8 mb-6">
          <div className="w-16 h-16 bg-[#111] border border-[#222] flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          </div>
          <p className="text-sm text-[#888] text-center">
            Haz clic en continuar para pagar con Apple Pay
          </p>
        </div>
      )}

      {cardError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {cardError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="w-1/3 bg-[#2C2C2C] text-white font-semibold py-3.5 text-base cursor-pointer hover:brightness-110 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={handleContinue}
          disabled={(method === "card" && showCardForm && !cardReady) || verifying}
          className={`flex-1 font-bold py-3.5 text-base transition-colors flex items-center justify-center gap-2 ${
            (method === "card" && showCardForm && !cardReady) || verifying
              ? "bg-[#6B3D08] text-[#A0602B] cursor-not-allowed"
              : "bg-[#EA580B] hover:bg-[#C74A09] text-white cursor-pointer"
          }`}
        >
          {verifying ? "Verificando..." : "Continuar"}
        </button>
      </div>
    </div>
  );
}

/* ── Review step ───────────────────────────────────── */

function ReviewStep({
  mode,
  orderData,
  onBack,
  onCheckout,
  isProcessing,
  paymentError,
  cardLast4,
  paymentMethod,
}: {
  mode: Mode;
  orderData: OrderData;
  onBack: () => void;
  onCheckout: () => void;
  isProcessing: boolean;
  paymentError: string;
  cardLast4: string;
  paymentMethod: "card" | "apple";
}) {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const ticketLabel = orderData.ticketType === "VIP" ? "VIP" : "Admisión General";

  return (
    <div>
      <h3 className="text-base font-bold mb-6">Resumen de tu {mode === "buy" ? "compra" : "oferta"}</h3>

      {/* Line items */}
      <div className="space-y-4 mb-6">
        <div className="flex items-start justify-between text-sm">
          <div>
            <span className="text-[#888]">{mode === "buy" ? "Comprar Ahora" : "Oferta"}</span>
          </div>
          <div className="text-right">
            <div>{orderData.quantity}x {ticketLabel}</div>
            <div className="text-xs text-[#888] mt-0.5">S/{Math.round(orderData.unitPrice)} c/u</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#888]">Entrega</span>
          <span className="text-xs text-[#888]">UntzDrop enviará tu código QR</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#888]">Pago</span>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#888]" />
            <span className="text-xs tracking-wider">
              {paymentMethod === "apple" ? "Apple Pay" : cardLast4 ? `•••• ${cardLast4}` : "Tarjeta"}
            </span>
          </div>
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
          <span>S/{Math.round(orderData.subtotal + orderData.fee)}</span>
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
              <span className="text-[#888]">S/{orderData.fee}</span>
            </div>
          </div>
        )}

        <div className="border-t border-[#222] pt-3 flex justify-between text-base font-bold">
          <span>Total de la orden</span>
          <span>S/{Math.round(orderData.total)}</span>
        </div>
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1 w-4 h-4 shrink-0 accent-[#EA580B] cursor-pointer"
        />
        <span className="text-xs text-[#888] leading-relaxed">
          Acepto los{" "}
          <a href="/terms" target="_blank" className="text-white underline">Términos y Condiciones</a>{" "}
          y la{" "}
          <a href="/privacy" target="_blank" className="text-white underline">Política de Privacidad</a>{" "}
          de UntzDrop.
        </span>
      </label>

      {/* Error message */}
      {paymentError && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">
          {paymentError}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="w-1/3 bg-[#2C2C2C] text-white font-semibold py-3.5 text-base cursor-pointer hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Atrás
        </button>
        <button
          onClick={onCheckout}
          disabled={!acceptTerms || isProcessing}
          className={`flex-1 font-bold py-3.5 text-base transition-colors flex items-center justify-center gap-2 ${
            acceptTerms && !isProcessing
              ? "bg-[#EA580B] hover:bg-[#C74A09] text-white cursor-pointer"
              : "bg-[#6B3D08] text-[#A0602B] cursor-not-allowed"
          }`}
        >
          {!acceptTerms && <Lock className="w-4 h-4" />}
          {isProcessing ? "Procesando..." : "Completar Compra"}
        </button>
      </div>
    </div>
  );
}
