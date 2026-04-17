"use client";

import { Pencil } from "lucide-react";
import { Listing, displayPrice } from "@/lib/supabase";

const GRADIENT_PALETTE = [
  "from-[#EA580B] to-[#D946EF]",
  "from-[#D946EF] to-[#F06529]",
  "from-[#06B6D4] to-[#EA580B]",
  "from-[#F06529] to-[#FBBF24]",
  "from-[#10B981] to-[#06B6D4]",
  "from-[#EA580B] to-[#F06529]",
];

interface ListingRowProps {
  listing: Listing;
  index: number;
  onSelect: (listing: Listing) => void;
  isOwn?: boolean;
  onEdit?: (listing: Listing) => void;
}

export default function ListingRow({ listing, index, onSelect, isOwn, onEdit }: ListingRowProps) {
  const gradient = GRADIENT_PALETTE[index % GRADIENT_PALETTE.length];
  const sellerName = listing.seller_name?.trim().split(" ")[0] || "Vendedor anónimo";

  const ticketLabel = listing.quantity === 1
    ? "1 entrada"
    : `1-${listing.quantity} entradas`;

  const isVip = listing.ticket_type === "vip";
  const color = isVip ? "#D946EF" : "#3B82F6";
  const typeLabel = isVip ? "VIP" : "GA";

  return isOwn ? (
      <div className="py-4 border-t border-b border-[#EA580B]/30 my-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold px-2 py-0.5 text-white" style={{ backgroundColor: color }}>
            {typeLabel}
          </span>
          <span className="text-xs text-[#888]">{ticketLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${gradient} shrink-0`} />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-[#888]">Tu listing</div>
            <div className="text-base font-bold">S/{displayPrice(listing.price)}</div>
          </div>
          <button
            onClick={() => onEdit?.(listing)}
            className="text-xs font-semibold text-[#EA580B] bg-[#EA580B]/10 px-4 py-2 cursor-pointer border border-[#EA580B]/30 hover:bg-[#EA580B]/20 transition-colors"
          >
            Editar
          </button>
        </div>
      </div>
    ) : (
      <div className="flex items-center gap-4 py-4 border-b border-[#1a1a1a]">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{ticketLabel}</div>
          <div className="text-xs text-[#888]">{sellerName}</div>
        </div>
        <button
          onClick={() => onSelect(listing)}
          className="btn-tag-sm p-[2px] shrink-0 cursor-pointer hover:brightness-110 transition-all border-none"
          style={{ backgroundColor: color }}
        >
          <div className="btn-tag-sm bg-background flex items-stretch">
            <div className="text-white text-xs font-bold px-3 flex items-center" style={{ backgroundColor: color }}>
              {typeLabel}
            </div>
            <div className="text-white text-xs font-bold px-3 py-1.5 flex items-center">
              S/{displayPrice(listing.price)} cu
            </div>
          </div>
        </button>
      </div>
    );
}
