"use client";

import { Heart } from "lucide-react";
import { Event, formatEventDate, formatPrice } from "@/lib/supabase";
import { useSavedEvents } from "@/hooks/useSavedEvents";

interface EventRowProps {
  event: Event;
}

export default function EventRow({ event }: EventRowProps) {
  const priceLabel = formatPrice(event.min_price);
  const hasPrice = event.min_price != null;
  const { savedIds, toggle, isLoggedIn } = useSavedEvents();
  const isSaved = savedIds.has(event.id);

  return (
    <div className="flex gap-3.5 py-3.5 border-b border-border-subtle items-center last:border-b-0">
      <div className="w-20 h-20 rounded-xl bg-[#1a1a1a] shrink-0 overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#2a2040] to-[#2A2A2A]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-bold mb-0.5">{event.name}</div>
        <div className="text-xs text-text-dim leading-snug">
          {formatEventDate(event.date)}
          <br />
          {event.venue}
        </div>
        <div className={`text-[13px] font-semibold mt-0.5 ${hasPrice ? "text-text-faint" : "text-text-dim"}`}>
          {priceLabel}
        </div>
      </div>
      <button
        onClick={() => { if (isLoggedIn) toggle(event.id); }}
        className={`shrink-0 cursor-pointer border-none bg-transparent transition-all hover:scale-110 ${
          isSaved ? "text-red-500" : "text-muted-dark"
        }`}
      >
        <Heart className={`w-5 h-5 ${isSaved ? "fill-red-500" : ""}`} />
      </button>
    </div>
  );
}
