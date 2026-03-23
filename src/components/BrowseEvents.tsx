"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import EventCard from "./EventCard";
import FilterChips, { DateFilter, SortOrder } from "./FilterChips";
import { Event, getEvents } from "@/lib/supabase";
import { fadeUpBlur, staggerContainer, springs } from "@/lib/animations";

function getTopVenues(events: Event[]): string[] {
  const counts: Record<string, number> = {};
  for (const e of events) {
    counts[e.venue] = (counts[e.venue] || 0) + 1;
  }

  const entries = Object.entries(counts);
  const hasRepeats = entries.some(([, count]) => count > 1);

  if (hasRepeats) {
    return entries
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 4)
      .map(([venue]) => venue);
  }

  return entries
    .map(([venue]) => venue)
    .sort((a, b) => a.localeCompare(b));
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function filterByDate(events: Event[], filter: DateFilter): Event[] {
  if (filter === "all") return events;

  const now = new Date();
  const today = startOfDay(now);

  if (filter === "today") {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return events.filter((e) => {
      const d = new Date(e.date);
      return d >= today && d < tomorrow;
    });
  }

  if (filter === "tomorrow") {
    const tomorrowStart = new Date(today);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    return events.filter((e) => {
      const d = new Date(e.date);
      return d >= tomorrowStart && d < dayAfter;
    });
  }

  if (filter === "this_week") {
    const dayOfWeek = now.getDay();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - dayOfWeek));
    return events.filter((e) => {
      const d = new Date(e.date);
      return d >= today && d < endOfWeek;
    });
  }

  if (filter.startsWith("custom:")) {
    const dateStr = filter.replace("custom:", "");
    const customDay = startOfDay(new Date(dateStr + "T00:00:00"));
    const nextDay = new Date(customDay);
    nextDay.setDate(nextDay.getDate() + 1);
    return events.filter((e) => {
      const d = new Date(e.date);
      return d >= customDay && d < nextDay;
    });
  }

  return events;
}

export default function BrowseEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("date_asc");
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  const hasActiveFilters = dateFilter !== "all" || selectedVenues.length > 0;

  const handleClearAll = () => {
    setDateFilter("all");
    setSelectedVenues([]);
  };

  useEffect(() => {
    getEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  const venues = useMemo(() => getTopVenues(events), [events]);

  const filtered = useMemo(() => {
    let result = filterByDate(events, dateFilter);

    if (selectedVenues.length > 0) {
      result = result.filter((e) => selectedVenues.includes(e.venue));
    }

    result = [...result].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === "date_asc" ? da - db : db - da;
    });

    return result;
  }, [events, dateFilter, selectedVenues, sortOrder]);

  return (
    <div id="browse-events" ref={sectionRef} className="px-4 md:px-8 lg:px-16 pt-20 md:pt-36 pb-10 relative">

      <motion.h2
        className="text-xl md:text-2xl font-medium text-center mb-5 tracking-[-1.4px] relative z-10"
        variants={fadeUpBlur}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={springs.smooth}
      >
        Todos los eventos
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ ...springs.smooth, delay: 0.1 }}
      >
        <FilterChips
          venues={venues}
          dateFilter={dateFilter}
          selectedVenues={selectedVenues}
          sortOrder={sortOrder}
          onDateChange={setDateFilter}
          onVenuesChange={setSelectedVenues}
          onSortChange={setSortOrder}
          onClearAll={handleClearAll}
          hasActiveFilters={hasActiveFilters}
        />
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-3 md:gap-y-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <div className="w-full aspect-[1.5] bg-[#1a1a1a] animate-pulse mb-2.5" />
              <div className="h-4 w-3/4 bg-[#1a1a1a] rounded animate-pulse mb-2" />
              <div className="h-3 w-1/2 bg-[#1a1a1a] rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-text-dim py-16">No hay eventos disponibles</div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-3 md:gap-y-5"
          variants={staggerContainer(0.06, 0.15)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {filtered.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
