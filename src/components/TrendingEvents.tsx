"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { Event, getTrendingEvents, formatEventDate, formatPrice } from "@/lib/supabase";
import { fadeUpBlur, springs } from "@/lib/animations";
import { useSavedEvents } from "@/hooks/useSavedEvents";

export default function TrendingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const { savedIds, toggle, isLoggedIn } = useSavedEvents();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mobileSlide, setMobileSlide] = useState(0);
  const animationRef = useRef<number | null>(null);
  const scrollPos = useRef(0);

  useEffect(() => {
    getTrendingEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (events.length === 0 || loading) return;

    const el = scrollRef.current;
    if (!el) return;

    const speed = 0.5;

    const animate = () => {
      if (!paused && el) {
        scrollPos.current += speed;
        const singleSetWidth = events.length * 416;
        if (scrollPos.current >= singleSetWidth) {
          scrollPos.current -= singleSetWidth;
        }
        el.scrollLeft = scrollPos.current;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [events, loading, paused]);

  // Mobile slideshow auto-cycle
  useEffect(() => {
    if (events.length <= 1) return;
    const timer = setInterval(() => {
      setMobileSlide((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [events.length]);

  if (loading) {
    return (
      <div className="px-4 md:px-8 lg:px-16 pt-5 pb-10">
        <h2 className="text-2xl font-medium mb-5 tracking-[-1.4px]">
          Eventos Populares
        </h2>
        <div className="flex gap-4 pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shrink-0 w-[280px] md:w-[400px]">
              <div className="w-full h-[200px] md:h-[260px] bg-[#1a1a1a] animate-pulse mb-2.5" />
              <div className="h-4 w-3/4 bg-[#1a1a1a] rounded animate-pulse mb-2" />
              <div className="h-3 w-1/2 bg-[#1a1a1a] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) return null;

  const displayEvents = [...events, ...events];

  return (
    <div className="px-4 md:px-8 lg:px-16 pt-5 pb-0 relative" style={{ overflow: "visible" }}>
      <motion.h2
        className="text-xl md:text-2xl font-medium mb-5 tracking-[-1.4px]"
        initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={springs.smooth}
      >
        Eventos Populares
      </motion.h2>

      {/* ═══ MOBILE: Auto-cycling slideshow ═══ */}
      <div className="md:hidden overflow-hidden relative" style={{ background: "linear-gradient(180deg, rgba(236,130,23,0.15) 0%, rgba(236,130,23,0.10) 50%, rgba(236,130,23,0.18) 100%)" }}>
        <div className="p-3 relative h-[220px]">
          <AnimatePresence mode="wait">
            {events[mobileSlide] && (
              <motion.div
                key={events[mobileSlide].id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-3"
              >
                <Link href={`/events/${events[mobileSlide].id}`} className="block h-full">
                  <div className="w-full h-[180px] relative overflow-hidden bg-[#1a1a1a] mb-2">
                    {events[mobileSlide].image_url ? (
                      <img src={events[mobileSlide].image_url} alt={events[mobileSlide].name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#2a2040] to-[#2A2A2A]" />
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (isLoggedIn) toggle(events[mobileSlide].id); }}
                      className={`absolute bottom-2 right-2 w-7 h-7 bg-black/50 flex items-center justify-center backdrop-blur-sm cursor-pointer border-none ${savedIds.has(events[mobileSlide].id) ? "text-red-500" : "text-white"}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${savedIds.has(events[mobileSlide].id) ? "fill-red-500" : ""}`} />
                    </button>
                  </div>
                  <div className="text-[14px] font-bold truncate">{events[mobileSlide].name}</div>
                  <div className="text-xs text-text-dim">{formatEventDate(events[mobileSlide].date)} · {events[mobileSlide].venue}</div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-1.5 pb-3">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => setMobileSlide(i)}
              className={`w-1.5 h-1.5 rounded-full border-none cursor-pointer transition-colors ${i === mobileSlide ? "bg-primary" : "bg-[#333]"}`}
            />
          ))}
        </div>
      </div>

      {/* ═══ DESKTOP: Scrolling marquee ═══ */}
      <div
        className="hidden md:block overflow-hidden"
        style={{ background: "linear-gradient(180deg, rgba(236,130,23,0.15) 0%, rgba(236,130,23,0.10) 50%, rgba(236,130,23,0.18) 100%)" }}
      >
      <motion.div
        ref={scrollRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="flex gap-4 overflow-x-hidden p-5"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...springs.gentle, delay: 0.1 }}
      >
        {displayEvents.map((event, idx) => {
          const priceLabel = formatPrice(event.min_price);
          const hasPrice = event.min_price != null;

          return (
            <Link key={`${event.id}-${idx}`} href={`/events/${event.id}`} className="shrink-0 cursor-pointer group w-[260px] sm:w-[320px] md:w-[400px] block">
              <div className="w-full h-[180px] sm:h-[220px] md:h-[260px] relative overflow-hidden bg-[#1a1a1a] mb-2.5">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#2a2040] to-[#2A2A2A]" />
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isLoggedIn) toggle(event.id);
                  }}
                  className={`absolute bottom-2.5 right-2.5 w-8 h-8 bg-black/50 flex items-center justify-center backdrop-blur-sm cursor-pointer border-none transition-all hover:scale-110 ${
                    savedIds.has(event.id) ? "text-red-500" : "text-white"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${savedIds.has(event.id) ? "fill-red-500" : ""}`} />
                </button>
              </div>
              <div className="text-[14px] md:text-[16px] font-bold mb-0.5">{event.name}</div>
              <div className="text-xs text-text-dim leading-relaxed">
                {formatEventDate(event.date)}
                <br />
                {event.venue}
              </div>
              <div className={`text-[13px] font-semibold mt-0.5 ${hasPrice ? "text-text-faint" : "text-text-dim"}`}>
                {priceLabel}
              </div>
            </Link>
          );
        })}
      </motion.div>
      </div>

      {/* ─── Ceiling spotlight ─── */}
      <motion.div
        className="relative pointer-events-none"
        style={{ height: 0, overflow: "visible", zIndex: 10 }}
        variants={fadeUpBlur}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0 }}
        transition={springs.smooth}
      >
        {/* Wide wash */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[400px] h-[180px] md:w-[1200px] md:h-[300px]"
          style={{ top: 0, background: "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(236,130,23,0.30) 0%, rgba(236,130,23,0.08) 40%, transparent 70%)" }}
        />
        {/* Main cone */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[300px] h-[150px] md:w-[900px] md:h-[280px]"
          style={{ top: 0, background: "radial-gradient(ellipse 45% 75% at 50% 0%, rgba(255,150,30,0.40) 0%, rgba(236,130,23,0.10) 45%, transparent 70%)" }}
        />
        {/* Bright center */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[200px] h-[120px] md:w-[600px] md:h-[220px]"
          style={{ top: 0, background: "radial-gradient(ellipse 70% 40% at 50% 5%, rgba(255,180,60,0.45) 0%, rgba(236,130,23,0.06) 50%, transparent 70%)" }}
        />
      </motion.div>
    </div>
  );
}
