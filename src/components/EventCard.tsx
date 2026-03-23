"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Event, formatEventDate, formatPrice } from "@/lib/supabase";
import { scaleFade, springs } from "@/lib/animations";
import { useTilt } from "@/hooks/useTilt";
import { useSavedEvents } from "@/hooks/useSavedEvents";

interface EventCardProps {
  event: Event;
  index?: number;
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const priceLabel = formatPrice(event.min_price);
  const hasPrice = event.min_price != null;
  const tilt = useTilt(6);
  const { savedIds, toggle, isLoggedIn } = useSavedEvents();
  const isSaved = savedIds.has(event.id);

  return (
    <motion.div
      variants={scaleFade}
      transition={springs.smooth}
      onMouseMove={tilt.handleMouseMove}
      onMouseLeave={tilt.handleMouseLeave}
      style={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        transformPerspective: 800,
      }}
      whileHover={{ y: -6 }}
    >
      {/* Desktop: vertical card */}
      <Link href={`/events/${event.id}`} className="cursor-pointer group hidden md:block">
        <div className="w-full aspect-[1.5] bg-[#1a1a1a] mb-2.5 relative overflow-hidden">
          {event.image_url ? (
            <img src={event.image_url} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#2a2040] to-[#2A2A2A]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (isLoggedIn) toggle(event.id); }}
            className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm cursor-pointer border-none transition-all hover:scale-110 ${isSaved ? "text-red-500" : "text-white"}`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500" : ""}`} />
          </button>
        </div>
        <div className="text-sm font-bold mb-0.5">{event.name}</div>
        <div className="text-[11px] text-text-dim leading-[16px]">{formatEventDate(event.date)}<br />{event.venue}</div>
        <div className={`text-[13px] font-semibold mt-0.5 ${hasPrice ? "text-text-faint" : "text-text-dim"}`}>{priceLabel}</div>
      </Link>

      {/* Mobile: card style row */}
      <Link href={`/events/${event.id}`} className="cursor-pointer group flex gap-3 md:hidden items-center bg-[#111] border border-[#1e1e1e] p-3">
        <div className="w-[70px] h-[70px] shrink-0 bg-[#1a1a1a] relative overflow-hidden">
          {event.image_url ? (
            <img src={event.image_url} alt={event.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#2a2040] to-[#2A2A2A]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{event.name}</div>
          <div className="text-[11px] text-text-dim mt-0.5">{formatEventDate(event.date)}</div>
          <div className="text-[11px] text-text-dim">{event.venue}</div>
          <div className={`text-[12px] font-semibold mt-1 ${hasPrice ? "text-primary" : "text-text-dim"}`}>{priceLabel}</div>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (isLoggedIn) toggle(event.id); }}
          className={`shrink-0 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center cursor-pointer border-none ${isSaved ? "text-red-500" : "text-white"}`}
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-red-500" : ""}`} />
        </button>
      </Link>
    </motion.div>
  );
}
