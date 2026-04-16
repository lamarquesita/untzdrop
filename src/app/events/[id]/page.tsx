"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Bell, MapPin, ExternalLink, Ticket, HandCoins, Tag, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingRow from "@/components/ListingRow";
import PurchaseModal from "@/components/PurchaseModal";
import SellModal, { Buyer, SellOrderData } from "@/components/SellModal";
import PriceAlertModal from "@/components/PriceAlertModal";
import NotifyModal from "@/components/NotifyModal";
import {
  Event,
  Artist,
  Listing,
  getEventById,
  getListingsByEventId,
  getLineupByEventId,
  getOffersByEventId,
  getAuthHeaders,
  formatFullDate,
  displayPrice,
} from "@/lib/supabase";

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [lineup, setLineup] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<"sellers" | "buyers">("sellers");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [extraListings, setExtraListings] = useState<Listing[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [alertSet, setAlertSet] = useState(false);

  // Check if alert is already set for this event
  useEffect(() => {
    const eventId = Number(params.id);
    if (!isNaN(eventId)) {
      const alerts = JSON.parse(localStorage.getItem("price-alerts") || "{}");
      setAlertSet(!!alerts[eventId]);
    }
  }, [params.id]);

  const handleAlertSet = () => {
    const eventId = Number(params.id);
    const alerts = JSON.parse(localStorage.getItem("price-alerts") || "{}");
    alerts[eventId] = true;
    localStorage.setItem("price-alerts", JSON.stringify(alerts));
    setAlertSet(true);
  };

  const handleCancelAlert = () => {
    const eventId = Number(params.id);
    const alerts = JSON.parse(localStorage.getItem("price-alerts") || "{}");
    delete alerts[eventId];
    localStorage.setItem("price-alerts", JSON.stringify(alerts));
    setAlertSet(false);
  };

  useEffect(() => {
    const id = Number(params.id);
    if (isNaN(id)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    Promise.all([
      getEventById(id),
      getListingsByEventId(id),
      getLineupByEventId(id),
      getOffersByEventId(id),
    ]).then(([eventData, listingsData, lineupData, offersData]) => {
      if (!eventData) {
        setNotFound(true);
      } else {
        setEvent(eventData);
        setListings(listingsData);
        setLineup(lineupData);
        // Map offers to Buyer format
        setBuyers(offersData.map((o) => ({
          id: o.id,
          name: o.buyer_name?.trim().split(" ")[0] || "Comprador anónimo",
          quantity: o.quantity,
          price: o.price,
          ticket_type: o.ticket_type,
        })));
      }
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen md:h-screen bg-background text-white flex flex-col md:overflow-hidden">
        <Navbar />
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10 px-4 md:px-8 lg:px-16 py-4 md:py-10 flex-1 md:min-h-0 max-w-[1440px] mx-auto w-full">
          <div className="w-full md:w-[45%] lg:w-1/2 shrink-0 md:overflow-y-auto no-scrollbar">
            <div className="aspect-[6/5] bg-[#1a1a1a] animate-pulse" />
          </div>
          <div className="flex-1 md:overflow-y-auto no-scrollbar space-y-4">
            <div className="h-10 w-3/4 bg-[#1a1a1a] animate-pulse" />
            <div className="h-5 w-1/2 bg-[#1a1a1a] animate-pulse" />
            <div className="h-5 w-1/3 bg-[#1a1a1a] animate-pulse" />
            <div className="flex gap-3 mt-6">
              <div className="h-12 flex-1 bg-[#1a1a1a] animate-pulse" />
              <div className="h-12 flex-1 bg-[#1a1a1a] animate-pulse" />
            </div>
            <div className="mt-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[#1a1a1a] animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-background text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Ticket className="w-14 h-14 text-[#555]" />
          <h1 className="text-2xl font-bold">Evento no encontrado</h1>
          <p className="text-[#888]">El evento que buscas no existe o fue removido.</p>
          <Link
            href="/"
            className="btn-tag bg-primary text-white px-6 py-3 font-semibold hover:brightness-110 transition-all"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const displayListings = [...listings, ...extraListings];
  const highestBid = buyers.length > 0 ? Math.max(...buyers.map((b) => b.price)) : 0;
  const rawMin = event.min_price != null ? event.min_price : (displayListings.length > 0 ? displayListings[0].price : 0);
  const minPrice = rawMin > 0 ? `S/${displayPrice(rawMin)}` : "—";
  const mapsQuery = encodeURIComponent(event.address || event.venue);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const hasListings = displayListings.length > 0;

  return (
    <div className="min-h-screen md:h-screen bg-background text-white flex flex-col md:overflow-hidden">
      <Navbar />

      {/* ═══ MOBILE LAYOUT ═══ */}
      <div className="md:hidden">
        {/* Full-width event image with overlay action icons */}
        <div className="relative w-full aspect-[16/10] bg-[#1a1a1a] overflow-hidden">
          {event.image_url ? (
            <img src={event.image_url} alt={event.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#2a2040] to-[#2A2A2A]" />
          )}
          {/* Subtle gradient for icon contrast */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          <div className="absolute top-4 right-4 flex gap-2">
            {lineup.length > 0 && (
              <button
                onClick={() => document.getElementById("event-lineup")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                className="w-10 h-10 bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-pointer border-none text-white hover:bg-black/80 transition-colors"
                aria-label="Ver artistas"
              >
                <Users className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => alertSet ? handleCancelAlert() : hasListings ? setShowPriceAlert(true) : setShowNotifyModal(true)}
              className={`w-10 h-10 backdrop-blur-sm flex items-center justify-center cursor-pointer border-none transition-colors ${
                alertSet ? "bg-primary text-white" : "bg-black/60 text-white hover:bg-black/80"
              }`}
              aria-label={alertSet ? "Cancelar alerta" : "Establecer alerta"}
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Event info */}
        <div className="px-4 pt-4">
          <h1 className="text-2xl font-extrabold leading-tight">{event.name}</h1>
          <div className="text-[#888] text-sm mt-2">{formatFullDate(event.date)}</div>
          <div className="flex items-center gap-1 text-[#888] text-sm mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-white transition-colors inline-flex items-center gap-1"
            >
              {event.venue}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Buy / Sell buttons */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => {
                if (displayListings.length > 0) setSelectedListing(displayListings[0]);
                else { setActiveTab("buyers"); }
              }}
              className="btn-tag flex-1 bg-[#16A34A] text-white font-bold py-3 text-sm border-none cursor-pointer"
            >
              Comprar | {minPrice}
            </button>
            <button
              onClick={() => setShowSellModal(true)}
              className="btn-tag flex-1 bg-white text-black font-bold py-3 text-sm border-none cursor-pointer"
            >
              Vender | S/{highestBid}
            </button>
          </div>
        </div>

        {/* Lineup */}
        {lineup.length > 0 && (
          <div id="event-lineup" className="px-4 mt-5 scroll-mt-20">
            <div className="text-xs font-bold text-[#888] uppercase tracking-wide mb-2">Lineup</div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {lineup.map((artist) => (
                <div key={artist.id} className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1a1a1a]">
                    {artist.image_url ? (
                      <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#2a2040] to-[#2A2A2A]" />
                    )}
                  </div>
                  <span className="text-[10px] text-center font-medium w-14 truncate">{artist.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-4 mt-5">
          <div className="flex border-b border-[#222]">
            <button
              onClick={() => setActiveTab("sellers")}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center transition-colors cursor-pointer bg-transparent border-none ${
                activeTab === "sellers" ? "text-white border-b-2 border-primary" : "text-[#555]"
              }`}
            >
              Boletos ({displayListings.length})
            </button>
            <button
              onClick={() => setActiveTab("buyers")}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center transition-colors cursor-pointer bg-transparent border-none ${
                activeTab === "buyers" ? "text-white border-b-2 border-primary" : "text-[#555]"
              }`}
            >
              Compradores ({buyers.length})
            </button>
          </div>

          {/* Tab content */}
          <div className="mt-2">
            {activeTab === "sellers" ? (
              displayListings.length === 0 ? (
                <div className="text-center py-10 text-sm text-[#555]">No hay boletos disponibles</div>
              ) : (
                displayListings.map((listing, idx) => (
                  <ListingRow key={listing.id} listing={listing} index={idx} onSelect={setSelectedListing} />
                ))
              )
            ) : (
              buyers.length === 0 ? (
                <div className="text-center py-10 text-sm text-[#555]">No hay compradores aún</div>
              ) : (
                buyers.map((buyer, idx) => {
                  const gradient = ["from-[#06B6D4] to-[#EA580B]", "from-[#D946EF] to-[#F06529]", "from-[#10B981] to-[#06B6D4]"][idx % 3];
                  const isVip = buyer.ticket_type === "vip";
                  const color = isVip ? "#D946EF" : "#3B82F6";
                  const typeLabel = isVip ? "VIP" : "GA";
                  return (
                    <div key={buyer.id} className="flex items-center gap-3 py-3 border-b border-[#1a1a1a]">
                      <div className={`w-8 h-8 bg-gradient-to-br ${gradient} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold">{buyer.quantity === 1 ? "1 entrada" : `1-${buyer.quantity} entradas`}</div>
                        <div className="text-[10px] text-[#888]">{buyer.name}</div>
                      </div>
                      <button
                        onClick={() => setShowSellModal(true)}
                        className="btn-tag-sm p-[2px] shrink-0 cursor-pointer hover:brightness-110 transition-all border-none"
                        style={{ backgroundColor: color }}
                      >
                        <div className="btn-tag-sm bg-background flex items-stretch">
                          <div className="text-white text-[10px] font-bold px-2 flex items-center" style={{ backgroundColor: color }}>
                            {typeLabel}
                          </div>
                          <div className="text-white text-[10px] font-bold px-2.5 py-1 flex items-center">
                            S/{displayPrice(buyer.price)}
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

      </div>

      {/* ═══ DESKTOP LAYOUT ═══ */}
      <div className="hidden md:flex gap-6 lg:gap-10 px-4 md:px-8 lg:px-16 py-8 flex-1 min-h-0 max-w-[1440px] mx-auto w-full">
        {/* Left column */}
        <div className="w-[45%] lg:w-1/2 shrink-0 overflow-y-auto no-scrollbar">
          <div className="relative aspect-[6/5] overflow-hidden bg-[#1a1a1a]">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#2a2040] to-[#2A2A2A]" />
            )}
            <button
              onClick={() => alertSet ? handleCancelAlert() : hasListings ? setShowPriceAlert(true) : setShowNotifyModal(true)}
              className={`btn-tag absolute top-4 right-4 flex items-center gap-2 backdrop-blur-sm text-sm font-medium px-5 py-2.5 transition-colors ${
                alertSet
                  ? "bg-primary/80 text-white hover:bg-primary/60"
                  : "bg-black/60 text-white hover:bg-black/80"
              }`}
            >
              <Bell className="w-4 h-4" />
              {alertSet ? "Cancelar Alerta" : hasListings ? "Alerta de precio" : "Avisame cuando haya entradas"}
            </button>
          </div>

          {/* Venue + address */}
          <div className="mt-6 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-base">{event.venue}</div>
              {event.address && (
                <div className="text-xs text-[#888] mt-0.5">{event.address}</div>
              )}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-tag mt-2 text-xs text-primary font-semibold bg-primary/10 hover:bg-primary/20 px-5 py-2 transition-colors inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3 h-3" /> Abrir en Mapa
              </a>
            </div>
          </div>

          {/* Lineup — only if exists */}
          {lineup.length > 0 && (
            <div className="mt-6 pb-4">
              <div className="text-sm font-bold mb-3">Lineup</div>
              <div className="flex flex-wrap gap-3">
                {lineup.map((artist) => (
                  <div key={artist.id} className="flex flex-col items-center gap-1.5 w-20">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-[#1a1a1a] shrink-0">
                      {artist.image_url ? (
                        <img
                          src={artist.image_url}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#2a2040] to-[#2A2A2A]" />
                      )}
                    </div>
                    <span className="text-xs text-center font-medium leading-tight truncate w-full">
                      {artist.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex-1 min-w-0 md:overflow-y-auto no-scrollbar">
          <h1 className="text-[36px] font-extrabold leading-tight">{event.name}</h1>
          <div className="text-[#888] text-sm mt-2">
            {formatFullDate(event.date)} &middot; {event.venue}
          </div>
          <div className="flex items-center gap-1.5 text-[#888] text-sm mt-1">
            <MapPin className="w-3.5 h-3.5" /> Lima, Peru
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 mt-5 md:mt-6">
            <button
              onClick={() => {
                if (displayListings.length > 0) {
                  setSelectedListing(displayListings[0]);
                } else {
                  setActiveTab("buyers");
                  alert("No hay boletos disponibles aún. ¡Publica una oferta!");
                }
              }}
              className="btn-tag flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-3.5 px-4 text-base transition-colors"
            >
              Comprar | {minPrice}
            </button>
            <button
              onClick={() => setShowSellModal(true)}
              className="btn-tag flex-1 bg-white hover:bg-gray-100 text-black font-bold py-3.5 px-4 text-base transition-colors"
            >
              Vender | S/{highestBid}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mt-8 border-b border-[#222]">
            <button
              onClick={() => setActiveTab("sellers")}
              className={`flex-1 pb-3 text-sm font-semibold text-center transition-colors ${
                activeTab === "sellers"
                  ? "text-white border-b-2 border-primary"
                  : "text-[#555] hover:text-[#888]"
              }`}
            >
              Boletos Disponibles
            </button>
            <button
              onClick={() => setActiveTab("buyers")}
              className={`flex-1 pb-3 text-sm font-semibold text-center transition-colors ${
                activeTab === "buyers"
                  ? "text-white border-b-2 border-primary"
                  : "text-[#555] hover:text-[#888]"
              }`}
            >
              Compradores Interesados
            </button>
          </div>

          {/* Tab content */}
          <div className="mt-2 pb-4">
            {activeTab === "sellers" ? (
              displayListings.map((listing, idx) => (
                <ListingRow key={listing.id} listing={listing} index={idx} onSelect={setSelectedListing} />
              ))
            ) : (
              buyers.map((buyer, idx) => {
                const gradient = [
                  "from-[#06B6D4] to-[#EA580B]",
                  "from-[#D946EF] to-[#F06529]",
                  "from-[#10B981] to-[#06B6D4]",
                ][idx % 3];
                const isVip = buyer.ticket_type === "vip";
                const color = isVip ? "#D946EF" : "#3B82F6";
                const typeLabel = isVip ? "VIP" : "GA";
                return (
                  <div key={buyer.id} className="flex items-center gap-4 py-4 border-b border-[#1a1a1a]">
                    <div className={`w-10 h-10 bg-gradient-to-br ${gradient} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{buyer.quantity === 1 ? "1 entrada" : `1-${buyer.quantity} entradas`}</div>
                      <div className="text-xs text-[#888]">{buyer.name}</div>
                    </div>
                    <button
                      onClick={() => setShowSellModal(true)}
                      className="btn-tag-sm p-[2px] shrink-0 cursor-pointer hover:brightness-110 transition-all border-none"
                      style={{ backgroundColor: color }}
                    >
                      <div className="btn-tag-sm bg-background flex items-stretch">
                        <div className="text-white text-xs font-bold px-3 flex items-center" style={{ backgroundColor: color }}>
                          {typeLabel}
                        </div>
                        <div className="text-white text-xs font-bold px-3 py-1.5 flex items-center">
                          S/{displayPrice(buyer.price)} cu
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {selectedListing && (
        <PurchaseModal
          event={event}
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}

      {showSellModal && (
        <SellModal
          event={event}
          buyers={buyers}
          onClose={() => setShowSellModal(false)}
          onComplete={async (order: SellOrderData, ticketFile: File | null) => {
            if (order.mode === "list" && ticketFile) {
              try {
                // Create FormData for the API call
                const formData = new FormData();
                formData.append('event_id', event.id.toString());
                formData.append('price', order.unitPrice.toString());
                formData.append('quantity', order.quantity.toString());
                formData.append('ticket_type', order.ticketType === "VIP" ? "vip" : "ga");
                formData.append('ticket_file', ticketFile);

                const authHeaders = await getAuthHeaders();
                const response = await fetch('/api/listings', {
                  method: 'POST',
                  headers: authHeaders,
                  body: formData,
                });

                if (response.ok) {
                  const { listing } = await response.json();
                  setExtraListings((prev) => [...prev, listing]);
                  return { ok: true };
                } else {
                  const error = await response.json();
                  return { ok: false, error: error.error || 'Failed to create listing' };
                }
              } catch (error) {
                console.error('Error creating listing:', error);
                return { ok: false, error: 'Error creating listing' };
              }
            } else if (order.mode === "sell" && ticketFile) {
              // "Vender Ahora" — create listing + upload ticket (same API)
              try {
                const formData = new FormData();
                formData.append('event_id', event.id.toString());
                formData.append('price', order.unitPrice.toString());
                formData.append('quantity', order.quantity.toString());
                formData.append('ticket_type', order.ticketType === "VIP" ? "vip" : "ga");
                formData.append('ticket_file', ticketFile);

                const authHeaders = await getAuthHeaders();
                const response = await fetch('/api/listings', {
                  method: 'POST',
                  headers: authHeaders,
                  body: formData,
                });

                if (response.ok) {
                  // Remove/reduce the matched buyer from local state
                  const gaBuyers = buyers.filter((b) => b.ticket_type === "ga");
                  const highest = gaBuyers.reduce((best, b) => (b.price > best.price ? b : best), gaBuyers[0]);
                  if (highest) {
                    const remaining = highest.quantity - order.quantity;
                    setBuyers((prev) =>
                      remaining > 0
                        ? prev.map((b) => b.id === highest.id ? { ...b, quantity: remaining } : b)
                        : prev.filter((b) => b.id !== highest.id)
                    );
                  }
                  return { ok: true };
                } else {
                  const error = await response.json();
                  return { ok: false, error: error.error || 'Error al crear la venta' };
                }
              } catch (error) {
                console.error('Error processing instant sell:', error);
                return { ok: false, error: 'Error al procesar la venta' };
              }
            }
            return { ok: false, error: 'Falta el archivo de la entrada' };
          }}
        />
      )}

      {showPriceAlert && event && (
        <PriceAlertModal
          eventName={event.name}
          onClose={() => setShowPriceAlert(false)}
          onAlertSet={handleAlertSet}
        />
      )}

      {showNotifyModal && event && (
        <NotifyModal
          eventName={event.name}
          onClose={() => setShowNotifyModal(false)}
          onAlertSet={handleAlertSet}
        />
      )}
    </div>
  );
}
