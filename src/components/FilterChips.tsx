"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, MapPin, ArrowUpDown, X } from "lucide-react";

export type DateFilter = "all" | "today" | "tomorrow" | "this_week" | string; // string = "custom:YYYY-MM-DD"
export type SortOrder = "date_asc" | "date_desc";

interface FilterChipsProps {
  venues: string[];
  dateFilter: DateFilter;
  selectedVenues: string[];
  sortOrder: SortOrder;
  onDateChange: (v: DateFilter) => void;
  onVenuesChange: (v: string[]) => void;
  onSortChange: (v: SortOrder) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

const presetOptions: { value: DateFilter; label: string }[] = [
  { value: "all", label: "Todas las fechas" },
  { value: "today", label: "Hoy" },
  { value: "tomorrow", label: "Mañana" },
  { value: "this_week", label: "Esta semana" },
];

const sortOptions: { value: SortOrder; label: string }[] = [
  { value: "date_asc", label: "Fecha más próxima" },
  { value: "date_desc", label: "Fecha más lejana" },
];

function getDateLabel(filter: DateFilter): string {
  const preset = presetOptions.find((o) => o.value === filter);
  if (preset) return preset.value === "all" ? "Fecha" : preset.label;
  const dateStr = filter.replace("custom:", "");
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es", { day: "numeric", month: "short" });
}

function TagBorder({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  const clipPath = "polygon(0% 0%, calc(100% - 1.05em) 0%, 100% 1.05em, 100% 100%, 1.05em 100%, 0% calc(100% - 1.05em))";
  return (
    <div className="relative">
      {/* Border layer */}
      <div
        className="absolute inset-[-1px]"
        style={{ clipPath, backgroundColor: color }}
      />
      {/* Content layer */}
      <div className="relative" style={{ clipPath }}>
        {children}
      </div>
    </div>
  );
}

export default function FilterChips({
  venues,
  dateFilter,
  selectedVenues,
  sortOrder,
  onDateChange,
  onVenuesChange,
  onSortChange,
  onClearAll,
  hasActiveFilters,
}: FilterChipsProps) {
  const [openDropdown, setOpenDropdown] = useState<"fecha" | "lugar" | "orden" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleDropdown = (name: "fecha" | "lugar" | "orden") => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const toggleVenue = (venue: string) => {
    if (selectedVenues.includes(venue)) {
      onVenuesChange(selectedVenues.filter((v) => v !== venue));
    } else {
      onVenuesChange([...selectedVenues, venue]);
    }
  };

  const dateLabel = getDateLabel(dateFilter);
  const isDateActive = dateFilter !== "all";
  const venueLabel = selectedVenues.length > 0 ? selectedVenues.join(", ") : "Lugar";
  const sortLabel = sortOrder === "date_asc" ? "Más próxima" : "Más lejana";

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2 md:gap-2.5 mb-6 relative items-center">
      {/* Fecha */}
      <div className="relative shrink-0">
        <TagBorder color={isDateActive ? "var(--color-primary)" : "#333"}>
          <button
            onClick={() => toggleDropdown("fecha")}
            className={`btn-tag flex items-center gap-1.5 px-3 md:px-4 py-2 text-[12px] md:text-[13px] font-semibold cursor-pointer transition-colors ${
              isDateActive
                ? "text-primary bg-[#1f1510]"
                : "text-white bg-surface"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" /> {dateLabel}
          </button>
        </TagBorder>

        {openDropdown === "fecha" && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-[#181818] border border-border rounded-xl overflow-hidden z-50 shadow-2xl">
            {presetOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onDateChange(opt.value);
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-4 py-3 text-sm cursor-pointer transition-colors border-none ${
                  dateFilter === opt.value
                    ? "text-primary bg-primary/10"
                    : "text-white hover:bg-[#2A2A2A] bg-transparent"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <div className="border-t border-border">
              <button
                onClick={() => dateInputRef.current?.showPicker()}
                className={`w-full text-left px-4 py-3 text-sm cursor-pointer transition-colors border-none relative ${
                  dateFilter.startsWith("custom:")
                    ? "text-primary bg-primary/10"
                    : "text-white hover:bg-[#2A2A2A] bg-transparent"
                }`}
              >
                Elegir fecha...
                <input
                  ref={dateInputRef}
                  type="date"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.value) {
                      onDateChange(`custom:${e.target.value}`);
                      setOpenDropdown(null);
                    }
                  }}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lugar */}
      <div className="relative shrink-0">
        <TagBorder color={selectedVenues.length > 0 ? "var(--color-primary)" : "#333"}>
          <button
            onClick={() => toggleDropdown("lugar")}
            className={`btn-tag flex items-center gap-1.5 px-3 md:px-4 py-2 text-[12px] md:text-[13px] font-semibold cursor-pointer transition-colors max-w-[200px] md:max-w-[280px] ${
              selectedVenues.length > 0
                ? "text-primary bg-[#1f1510]"
                : "text-white bg-surface"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{venueLabel}</span>
          </button>
        </TagBorder>

        {openDropdown === "lugar" && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-[#181818] border border-border rounded-xl overflow-hidden z-50 shadow-2xl">
            {venues.length === 0 ? (
              <div className="px-4 py-4 text-sm text-muted">Sin lugares disponibles</div>
            ) : (
              venues.map((venue) => (
                <button
                  key={venue}
                  type="button"
                  onClick={() => toggleVenue(venue)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] cursor-pointer transition-colors w-full text-left bg-transparent border-none"
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      selectedVenues.includes(venue)
                        ? "border-primary bg-primary"
                        : "border-[#555] bg-transparent"
                    }`}
                  >
                    {selectedVenues.includes(venue) && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-white truncate">{venue}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Ordenar por */}
      <div className="relative shrink-0">
        <TagBorder color="#333">
          <button
            onClick={() => toggleDropdown("orden")}
            className="btn-tag flex items-center gap-1.5 px-3 md:px-4 py-2 text-[12px] md:text-[13px] font-semibold text-white bg-surface cursor-pointer transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 shrink-0" /> <span className="hidden sm:inline">Ordenar por:</span> {sortLabel}
          </button>
        </TagBorder>

        {openDropdown === "orden" && (
          <div className="absolute top-full left-0 mt-2 w-52 bg-[#181818] border border-border rounded-xl overflow-hidden z-50 shadow-2xl">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSortChange(opt.value);
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-4 py-3 text-sm cursor-pointer transition-colors border-none ${
                  sortOrder === opt.value
                    ? "text-primary bg-primary/10"
                    : "text-white hover:bg-[#2A2A2A] bg-transparent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Borrar filtros */}
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 md:px-4 py-2 text-[12px] md:text-[13px] font-semibold text-red-400 cursor-pointer bg-transparent border-none hover:text-red-300 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" /> Borrar
        </button>
      )}
    </div>
  );
}
