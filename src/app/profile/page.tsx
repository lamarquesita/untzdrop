"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase, getAuthHeaders } from "@/lib/supabase";
import {
  Star,
  Copy,
  Share2,
  ChevronRight,
  DollarSign,
  CreditCard,
  ArrowDownToLine,
  X as XIcon,
  Camera,
  Plus,
  Bookmark,
  Users,
  LogOut,
  Repeat2,
  ShoppingBag,
  Tag,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ProfileData {
  displayName: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  referral_code: string | null;
  created_at: string;
}

interface Stats {
  rating: number;
  totalRatings: number;
  exchanges: number;
  reviewCount: number;
}

interface Wallet {
  balance: number;
  siteCredit: number;
  payoutsYTD: number;
}

interface Review {
  id: number;
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface Highlight {
  id: number;
  name: string;
  image_url: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<Stats>({ rating: 0, totalRatings: 0, exchanges: 0, reviewCount: 0 });
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, siteCredit: 0, payoutsYTD: 0 });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [payoutProcessing, setPayoutProcessing] = useState(false);
  const [connectStatus, setConnectStatus] = useState<{ connected: boolean; onboarded: boolean; payoutsEnabled: boolean }>({ connected: false, onboarded: false, payoutsEnabled: false });
  const [copied, setCopied] = useState(false);
  const [mobileWalletTab, setMobileWalletTab] = useState<"wallet" | "payout">("wallet");
  const [mobileWalletDetail, setMobileWalletDetail] = useState<"balance" | "credit" | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const authHeaders = await getAuthHeaders();
      const [profileRes, connectRes] = await Promise.all([
        fetch("/api/profile", { headers: authHeaders }),
        fetch("/api/connect/status", { headers: authHeaders }),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.profile);
        setStats(data.stats);
        setWallet(data.wallet);
        setReviews(data.reviews);
        setHighlights(data.highlights);
        setSavedEvents(data.savedEvents);
        if (data.profile?.avatar_url) {
          setPhotos([data.profile.avatar_url]);
        }
      }
      if (connectRes.ok) {
        const data = await connectRes.json();
        setConnectStatus(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/");
      } else {
        setUser(data.user);
        loadProfile();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, loadProfile]);

  const handleConnectOnboard = async () => {
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/connect/onboard", {
        method: "POST",
        headers: authHeaders,
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      } else {
        const data = await res.json();
        alert(data.error || "Error al configurar pagos");
      }
    } catch {
      alert("Error al configurar pagos");
    }
  };

  const handleRequestPayout = async () => {
    if (payoutProcessing || wallet.balance <= 0) return;
    setPayoutProcessing(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/payouts/request", {
        method: "POST",
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        alert(`¡Pago de S/${data.amount} en proceso!`);
        setPayoutRequested(true);
        loadProfile(); // Refresh data
      } else {
        const data = await res.json();
        alert(data.error || "Error al solicitar pago");
      }
    } catch {
      alert("Error al solicitar pago");
    }
    setPayoutProcessing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const referralCode = profile?.referral_code || "------";

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://untzdrop.com/ref/${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddPhoto = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const authHeaders = await getAuthHeaders();
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/profile/avatar", {
          method: "POST",
          headers: authHeaders,
          body: formData,
        });
        if (res.ok) {
          const { avatar_url } = await res.json();
          setPhotos([avatar_url]);
        }
      } catch {
        console.error("Error uploading photo");
      }
    };
    input.click();
  };

  const removePhoto = async (idx: number) => {
    // For now just remove from UI — avatar stays until replaced
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white">
        <Navbar />
        <div className="px-4 md:px-8 lg:px-16 py-12">
          <div className="h-10 w-64 bg-[#1a1a1a] animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = profile?.displayName || user.user_metadata?.name || user.phone?.slice(-4) || "Usuario";
  const joinDate = new Date(profile?.created_at || user.created_at);
  const joinStr = joinDate.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
  const displayReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Navbar />

      {/* ═══════════════════════════════════════════════════ */}
      {/* ═══ MOBILE LAYOUT — app-style single column ═══ */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="md:hidden flex-1">
        {/* Profile header */}
        <div className="px-4 pt-6 pb-5 text-center">
          <div className="grid grid-cols-2 gap-3 max-w-[176px] mx-auto mb-3">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-[#D946EF] flex items-center justify-center text-white text-2xl font-bold">
              {displayName.charAt(0)}
            </div>
            {[0, 1, 2].map((i) => (
              photos[i] ? (
                <div key={i} className="relative w-20 h-20 bg-[#181818] overflow-hidden group">
                  <img src={photos[i]} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none">
                    <XIcon className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ) : (
                <button key={i} onClick={handleAddPhoto} className="w-20 h-20 bg-[#181818] border border-dashed border-[#2A2A2A] flex items-center justify-center cursor-pointer">
                  <Plus className="w-5 h-5 text-[#555]" />
                </button>
              )
            ))}
          </div>
          <h1 className="text-xl font-extrabold">{displayName}</h1>
          <div className="text-xs text-[#666] mt-1">Miembro desde {joinStr}</div>
          {profile?.bio ? (
            <p className="text-sm text-[#888] mt-2 leading-relaxed">{profile.bio}</p>
          ) : (
            <p className="text-sm text-[#555] mt-2">Agrega una bio...</p>
          )}
          <div className="flex items-center justify-center gap-5 mt-3">
            <div className="text-center">
              <div className="text-lg font-bold">{stats.exchanges}</div>
              <div className="text-[10px] text-[#666] uppercase tracking-wide">Intercambios</div>
            </div>
            <div className="w-px h-8 bg-[#222]" />
            <div className="text-center">
              <div className="text-lg font-bold flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                {stats.rating || "—"}
              </div>
              <div className="text-[10px] text-[#666] uppercase tracking-wide">Rating</div>
            </div>
            <div className="w-px h-8 bg-[#222]" />
            <div className="text-center">
              <div className="text-lg font-bold">{stats.reviewCount}</div>
              <div className="text-[10px] text-[#666] uppercase tracking-wide">Reseñas</div>
            </div>
          </div>
        </div>

        {/* Add photo button — next to avatar */}

        {/* Wallet & Payout tabs */}
        <div className="px-4 mb-6">
          {/* Tab headers */}
          <div className="flex border-b border-[#222] mb-4">
            <button
              onClick={() => setMobileWalletTab("wallet")}
              className={`flex-1 pb-3 text-sm font-semibold text-center cursor-pointer bg-transparent border-none transition-colors ${
                mobileWalletTab === "wallet" ? "text-white border-b-2 border-primary" : "text-[#555]"
              }`}
            >
              Wallet
            </button>
            <button
              onClick={() => setMobileWalletTab("payout")}
              className={`flex-1 pb-3 text-sm font-semibold text-center cursor-pointer bg-transparent border-none transition-colors ${
                mobileWalletTab === "payout" ? "text-white border-b-2 border-primary" : "text-[#555]"
              }`}
            >
              Payout
            </button>
          </div>

          {mobileWalletTab === "wallet" ? (
            <div>
              {/* Balance card — clickable */}
              <button
                onClick={() => setMobileWalletDetail(mobileWalletDetail === "balance" ? null : "balance")}
                className="w-full bg-[#181818] border border-[#2A2A2A] p-4 mb-2 cursor-pointer text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#888] font-semibold uppercase tracking-wide mb-1">Balance</div>
                    <div className="text-xl font-extrabold text-green-400">S/{wallet.balance}</div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-[#555] transition-transform ${mobileWalletDetail === "balance" ? "rotate-90" : ""}`} />
                </div>
              </button>
              {mobileWalletDetail === "balance" && (
                <div className="bg-[#111] border border-[#2A2A2A] p-4 mb-2 space-y-3">
                  <a onClick={handleConnectOnboard} className="text-xs text-[#888] underline cursor-pointer hover:text-white transition-colors block mb-4">
                    {connectStatus.onboarded ? "Editar Cuenta Bancaria" : "Agregar Cuenta Bancaria"}
                  </a>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRequestPayout}
                      disabled={payoutProcessing || wallet.balance <= 0 || payoutRequested}
                      className="flex-1 btn-tag bg-green-500/15 text-green-400 text-xs font-semibold py-3 cursor-pointer border-none disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {payoutProcessing ? "Procesando..." : "Solicitar Pago"}
                    </button>
                    <button
                      disabled={!payoutRequested}
                      className="flex-1 btn-tag bg-red-500/10 text-red-400 text-xs font-semibold py-3 cursor-pointer border-none disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Cancelar Solicitud
                    </button>
                  </div>
                </div>
              )}

              {/* Site Credit card — clickable */}
              <button
                onClick={() => setMobileWalletDetail(mobileWalletDetail === "credit" ? null : "credit")}
                className="w-full bg-[#181818] border border-[#2A2A2A] p-4 cursor-pointer text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#888] font-semibold uppercase tracking-wide mb-1">Crédito del Sitio</div>
                    <div className="text-xl font-extrabold text-primary">S/{wallet.siteCredit}</div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-[#555] transition-transform ${mobileWalletDetail === "credit" ? "rotate-90" : ""}`} />
                </div>
              </button>
              {mobileWalletDetail === "credit" && (
                <div className="bg-[#111] border border-[#2A2A2A] p-5 mt-2 space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1 bg-[#181818] p-3">
                      <div className="text-[10px] text-[#888] font-semibold uppercase tracking-wide mb-1">Total Ganado</div>
                      <div className="text-lg font-bold">S/{wallet.payoutsYTD}</div>
                    </div>
                    <div className="flex-1 bg-[#181818] p-3">
                      <div className="text-[10px] text-[#888] font-semibold uppercase tracking-wide mb-1">Completado</div>
                      <div className="text-lg font-bold">{stats.exchanges}</div>
                    </div>
                  </div>
                  <a className="text-xs text-[#888] underline cursor-pointer hover:text-white transition-colors">
                    Exportar Historial de Balance
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Payout tab content */}
              <div className="bg-[#181818] border border-[#2A2A2A] divide-y divide-[#2A2A2A]">
                {connectStatus.onboarded ? (
                  <div className="flex items-center justify-between px-4 py-4">
                    <div>
                      <div className="text-sm font-semibold">Stripe Connect</div>
                      <div className="text-xs text-[#666] mt-0.5">
                        {connectStatus.payoutsEnabled ? "Pagos habilitados" : "Verificación en proceso"}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-green-400 bg-green-500/15 px-2 py-0.5 rounded-full">Conectado</span>
                  </div>
                ) : (
                  <button onClick={handleConnectOnboard} className="w-full text-left px-4 py-4 flex items-center gap-2 text-primary text-sm font-semibold cursor-pointer bg-transparent border-none">
                    <Plus className="w-4 h-4" /> Configurar cuenta de pagos
                  </button>
                )}
                <div className="flex items-center justify-between px-4 py-4">
                  <span className="text-sm font-semibold">Pagos YTD</span>
                  <span className="text-sm font-bold">S/{wallet.payoutsYTD}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-4">
                  <span className="text-sm font-semibold">Ventas Totales</span>
                  <span className="text-sm font-bold">{stats.exchanges}</span>
                </div>
              </div>
            </div>
          )}
        </div>





        {/* Saved Events */}
        <div id="mobile-saved-events" className="px-4 mb-6">
          <h3 className="text-xs font-bold text-[#aaa] uppercase tracking-wide mb-3">Eventos Guardados</h3>
          {savedEvents.length > 0 ? (
            <div className="space-y-2">
              {savedEvents.map((event: any) => (
                <Link key={event.id} href={`/events/${event.id}`} className="flex items-center gap-3 bg-[#181818] border border-[#2A2A2A] p-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2a2040] to-[#2A2A2A] shrink-0 overflow-hidden">
                    {event.image_url && <img src={event.image_url} alt={event.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{event.name}</div>
                    <div className="text-xs text-[#666]">{event.venue}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#555]" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-[#181818] border border-[#2A2A2A] p-6 text-center">
              <p className="text-sm text-[#555]">No tienes eventos guardados</p>
            </div>
          )}
        </div>



        {/* Referral */}
        <div className="px-4 mb-6">
          <div className="bg-[#181818] border border-[#2A2A2A] p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold">Invita amigos, gana S/15</span>
            </div>
            <p className="text-xs text-[#888] leading-relaxed mb-3">
              Comparte tu código con amigos. Por cada amigo que complete su primera compra o venta, recibes S/15 en créditos.
            </p>
            <div className="flex gap-2">
              <button onClick={handleCopyReferral} className="flex-1 btn-tag bg-[#2A2A2A] text-white text-xs font-semibold py-2 cursor-pointer border-none flex items-center justify-center gap-1.5">
                <Copy className="w-3 h-3" /> {copied ? "Copiado" : "Copiar Código"}
              </button>
              <button className="flex-1 btn-tag bg-primary/15 text-primary text-xs font-semibold py-2 cursor-pointer border-none flex items-center justify-center gap-1.5">
                <Share2 className="w-3 h-3" /> Compartir
              </button>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="px-4 pb-10">
          <button onClick={handleLogout} className="flex items-center justify-center gap-1.5 text-red-400 text-xs cursor-pointer bg-transparent border-none hover:text-red-300 transition-colors mx-auto">
            <LogOut className="w-3 h-3" /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* ═══ DESKTOP LAYOUT — original 2-column grid  ═══ */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="hidden md:block flex-1 px-4 md:px-8 lg:px-16 py-10 max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-[1fr_1.4fr] gap-12">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-8">

            {/* Profile Photos */}
            <div>
              <h3 className="text-sm font-bold text-[#aaa] mb-3">Fotos de Perfil</h3>
              <div className="grid grid-cols-3 md:grid-cols-2 gap-3">
                {photos.map((url, i) => (
                  <div key={i} className="relative aspect-square bg-[#181818] rounded-none overflow-hidden group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                    >
                      <XIcon className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {photos.length < 4 && (
                  <button
                    onClick={handleAddPhoto}
                    className="aspect-square bg-[#181818] border border-dashed border-[#2A2A2A] rounded-none flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-[#555]" />
                    <span className="text-[10px] text-[#555]">Agregar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Profile Preview Card */}
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-none p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-[#D946EF] flex items-center justify-center text-white text-lg font-bold shrink-0">
                  {displayName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-base">{displayName}</div>
                  <div className="text-xs text-[#666] mt-0.5">Miembro desde {joinStr}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{stats.rating || "—"}</span>
                  {stats.totalRatings > 0 && (
                    <span className="text-[#666]">({stats.totalRatings})</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[#888]">
                  <Repeat2 className="w-4 h-4" />
                  <span>{stats.exchanges} intercambios</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-[#888]">
                <span>{stats.reviewCount} reseñas</span>
              </div>

              {profile?.bio && (
                <p className="text-sm text-[#888] mt-3 leading-relaxed">{profile.bio}</p>
              )}
            </div>

            {/* Highlights */}
            <div>
              <h3 className="text-sm font-bold text-[#aaa] mb-2">Highlights</h3>
              <p className="text-xs text-[#555] mb-3">
                Automaticamente mostramos las fotos de eventos a los que has asistido
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {highlights.length > 0 ? highlights.map((h) => (
                  <div key={h.id} className="aspect-square rounded-none bg-gradient-to-br from-[#2a2040] to-[#2A2A2A] overflow-hidden">
                    {h.image_url && <img src={h.image_url} alt={h.name} className="w-full h-full object-cover" />}
                  </div>
                )) : (
                  <div className="col-span-4 text-center py-6 text-xs text-[#555]">
                    Asiste a eventos para ver tus highlights aquí
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#aaa]">Reseñas</h3>
                {reviews.length > 2 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="text-xs text-primary font-semibold cursor-pointer bg-transparent border-none hover:underline"
                  >
                    {showAllReviews ? "Ver menos" : "Ver todas"}
                  </button>
                )}
              </div>
              {reviews.length === 0 ? (
                <div className="bg-[#181818] border border-[#2A2A2A] rounded-none p-6 text-center">
                  <p className="text-sm text-[#555]">Aún no tienes reseñas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayReviews.map((review) => (
                    <div key={review.id} className="bg-[#181818] border border-[#2A2A2A] rounded-none p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D946EF] to-[#EA580B] flex items-center justify-center text-[10px] font-bold text-white">
                          {review.author.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold">{review.author}</span>
                        <div className="flex items-center gap-0.5 ml-auto">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#888] leading-relaxed">{review.text}</p>
                      <div className="text-[10px] text-[#444] mt-2">
                        {new Date(review.date).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-8">

            {/* Earnings / Wallet */}
            <div>
              <h2 className="text-xl font-extrabold mb-5">Ganancias</h2>
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-5">
                <div className="bg-[#181818] border border-[#2A2A2A] rounded-none p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-[10px] md:text-xs text-[#888] font-semibold uppercase tracking-wide">Balance</span>
                  </div>
                  <div className="text-xl md:text-2xl font-extrabold">S/{wallet.balance}</div>
                </div>
                <div className="bg-[#181818] border border-[#2A2A2A] rounded-none p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="text-[10px] md:text-xs text-[#888] font-semibold uppercase tracking-wide">Crédito</span>
                  </div>
                  <div className="text-xl md:text-2xl font-extrabold">S/{wallet.siteCredit}</div>
                </div>
              </div>

              {/* Payout actions */}
              <div className="flex gap-3 mb-5">
                {!connectStatus.onboarded ? (
                  <button
                    onClick={handleConnectOnboard}
                    className="btn-tag-sm bg-primary/15 text-primary text-xs font-semibold px-4 py-2.5 cursor-pointer border-none hover:bg-primary/25 transition-colors"
                  >
                    Configurar Pagos
                  </button>
                ) : payoutRequested ? (
                  <button
                    disabled
                    className="btn-tag-sm bg-green-500/10 text-green-400/60 text-xs font-semibold px-4 py-2.5 border-none cursor-not-allowed"
                  >
                    Pago Solicitado ✓
                  </button>
                ) : (
                  <button
                    onClick={handleRequestPayout}
                    disabled={payoutProcessing || wallet.balance <= 0}
                    className="btn-tag-sm bg-green-500/15 text-green-400 text-xs font-semibold px-4 py-2.5 cursor-pointer border-none hover:bg-green-500/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {payoutProcessing ? "Procesando..." : "Solicitar Pago"}
                  </button>
                )}
                <button className="btn-tag-sm bg-[#2A2A2A] text-white text-xs font-semibold px-4 py-2.5 cursor-pointer border-none hover:bg-[#2A2A2A] transition-colors flex items-center gap-1.5">
                  <ArrowDownToLine className="w-3 h-3" />
                  Exportar Historial
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#181818] border border-[#2A2A2A] rounded-none p-4">
                  <div className="text-xs text-[#888] font-semibold uppercase tracking-wide mb-1">Pagos YTD</div>
                  <div className="text-lg font-bold">S/{wallet.payoutsYTD}</div>
                </div>
                <div className="bg-[#181818] border border-[#2A2A2A] rounded-none p-4">
                  <div className="text-xs text-[#888] font-semibold uppercase tracking-wide mb-1">Ventas Totales</div>
                  <div className="text-lg font-bold">{stats.exchanges}</div>
                </div>
              </div>
            </div>

            {/* Account & Payouts */}
            <div>
              <h3 className="text-sm font-bold text-[#aaa] mb-3">Cuenta y Pagos</h3>
              <div className="bg-[#181818] border border-[#2A2A2A] rounded-none divide-y divide-[#2A2A2A]">
                {connectStatus.onboarded ? (
                  <div className="flex items-center justify-between px-5 py-4">
                    <div>
                      <div className="text-sm font-semibold">Stripe Connect</div>
                      <div className="text-xs text-[#666] mt-0.5">
                        {connectStatus.payoutsEnabled ? "Pagos habilitados" : "Verificación en proceso"}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-green-400 bg-green-500/15 px-2 py-0.5 rounded-full">
                      Conectado
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectOnboard}
                    className="w-full text-left px-5 py-4 flex items-center gap-2 text-primary text-sm font-semibold cursor-pointer bg-transparent border-none hover:bg-[#2A2A2A] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Configurar cuenta de pagos
                  </button>
                )}
              </div>
            </div>

            {/* Saved Events */}
            <div>
              <h3 className="text-sm font-bold text-[#aaa] mb-3">Eventos Guardados</h3>
              {savedEvents.length > 0 ? (
                <div className="space-y-2">
                  {savedEvents.map((event: any) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="flex items-center gap-3 bg-[#181818] border border-[#2A2A2A] rounded-none p-3 hover:bg-[#2A2A2A] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-none bg-gradient-to-br from-[#2a2040] to-[#2A2A2A] shrink-0 overflow-hidden">
                        {event.image_url && <img src={event.image_url} alt={event.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{event.name}</div>
                        <div className="text-xs text-[#666]">{event.venue}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#555]" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-[#181818] border border-[#2A2A2A] rounded-none p-6 text-center">
                  <Bookmark className="w-8 h-8 text-[#333] mx-auto mb-3" />
                  <p className="text-sm text-[#555] mb-4">
                    Cuando guardes eventos, vuelve aquí para encontrarlos
                  </p>
                  <Link
                    href="/"
                    className="btn-tag bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:brightness-110 transition-all inline-block"
                  >
                    Explorar Eventos
                  </Link>
                </div>
              )}
            </div>

            {/* Refer Friends */}
            <div>
              <h3 className="text-sm font-bold text-[#aaa] mb-3">Invita Amigos, Gana $</h3>
              <div className="bg-[#181818] border border-[#2A2A2A] rounded-none p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-none bg-primary/15 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-[#888] flex-1">
                    Gana <span className="text-white font-bold">S/5 en créditos</span> por cada amigo que complete una transacción
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#111111] border border-[#2A2A2A] rounded-none px-4 py-3 mb-4">
                  <span className="text-sm text-[#888] flex-1 font-mono truncate">
                    untzdrop.com/ref/{referralCode}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCopyReferral}
                    className="flex-1 btn-tag-sm bg-[#2A2A2A] text-white text-xs font-semibold py-2.5 cursor-pointer border-none hover:bg-[#2A2A2A] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                  <button className="flex-1 btn-tag-sm bg-primary/15 text-primary text-xs font-semibold py-2.5 cursor-pointer border-none hover:bg-primary/25 transition-colors flex items-center justify-center gap-1.5">
                    <Share2 className="w-3 h-3" />
                    Compartir Invitación
                  </button>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-[#181818] border border-[#2A2A2A] rounded-none py-4 text-red-400 text-sm font-semibold cursor-pointer hover:bg-red-500/10 hover:border-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>


    </div>
  );
}
