import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  }
);

// Helper to get auth headers for API calls
export async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

export interface Event {
  id: number;
  name: string;
  date: string;
  venue: string;
  address: string | null;
  image_url: string | null;
  is_trending: boolean;
  created_at: string;
  min_price: number | null;
  listing_count: number;
}

export interface Artist {
  id: number;
  name: string;
  image_url: string | null;
}

/** Check if an event is still active (available until 11:59 PM on event day). */
function isEventActive(dateStr: string): boolean {
  const eventDate = new Date(dateStr);
  const eventEndOfDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 23, 59, 59);
  return new Date() <= eventEndOfDay;
}

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events_with_pricing")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }
  return (data ?? []).filter(e => isEventActive(e.date));
}

export async function getTrendingEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events_with_pricing")
    .select("*")
    .eq("is_trending", true)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching trending events:", error);
    return [];
  }
  return (data ?? []).filter(e => isEventActive(e.date));
}

export function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const day = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();
  const hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${day}, ${monthName} ${dayNum} · ${hour12}${ampm}`;
}

export function calcServiceFee(basePrice: number): number {
  return Math.round(basePrice * 0.10); // 10% service fee
}

export function displayPrice(basePrice: number): number {
  return basePrice + calcServiceFee(basePrice);
}

export function formatPrice(minPrice: number | null): string {
  if (minPrice != null) {
    return `Desde S/${Math.round(minPrice)}`;
  }
  return "Sé el primero en vender";
}

export interface Listing {
  id: number;
  event_id: number;
  seller_id: string;
  price: number;
  currency: string;
  quantity: number;
  status: string;
  ticket_type: "ga" | "vip";
  created_at: string;
  seller_name?: string | null;
}

export async function getEventById(id: number): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events_with_pricing")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    return null;
  }
  if (data && !isEventActive(data.date)) return null;
  return data;
}

async function fetchProfileNames(ids: string[]): Promise<Record<string, string | null>> {
  if (ids.length === 0) return {};
  try {
    const res = await fetch("/api/profile/names", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) return {};
    const json = await res.json();
    return json.names ?? {};
  } catch {
    return {};
  }
}

export async function getListingsByEventId(eventId: number): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("event_id", eventId)
    .eq("status", "active")
    .order("price", { ascending: true });

  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
  const listings = data ?? [];
  if (listings.length === 0) return [];

  const sellerIds = Array.from(new Set(listings.map((l) => l.seller_id)));
  const names = await fetchProfileNames(sellerIds);
  return listings.map((l) => ({ ...l, seller_name: names[l.seller_id] ?? null }));
}

export async function getLineupByEventId(eventId: number): Promise<Artist[]> {
  const { data, error } = await supabase
    .from("event_lineup")
    .select("id, name, image_url")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  if (error) {
    // event_lineup table may not exist yet — silently return empty
    return [];
  }
  return data ?? [];
}

export interface Offer {
  id: number;
  event_id: number;
  buyer_id: string;
  price: number;
  quantity: number;
  ticket_type: "ga" | "vip";
  status: string;
  created_at: string;
  buyer_name?: string | null;
}

export async function getOffersByEventId(eventId: number): Promise<Offer[]> {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("event_id", eventId)
    .eq("status", "active")
    .order("price", { ascending: false });

  if (error) {
    // offers table may not exist yet
    return [];
  }
  const offers = data ?? [];
  if (offers.length === 0) return [];

  const buyerIds = Array.from(new Set(offers.map((o) => o.buyer_id)));
  const names = await fetchProfileNames(buyerIds);
  return offers.map((o) => ({ ...o, buyer_name: names[o.buyer_id] ?? null }));
}

export function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();
  const hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${dayName}, ${monthName} ${dayNum} · ${hour12}${ampm}`;
}
