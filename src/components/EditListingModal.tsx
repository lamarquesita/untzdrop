"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Listing, getAuthHeaders } from "@/lib/supabase";

interface EditListingModalProps {
  listing: Listing;
  onClose: () => void;
  onUpdated: (listing: Listing) => void;
  onDeleted: (listingId: number) => void;
}

export default function EditListingModal({ listing, onClose, onUpdated, onDeleted }: EditListingModalProps) {
  const [price, setPrice] = useState(String(listing.price));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const priceNum = Number(price) || 0;
  const changed = priceNum !== listing.price && priceNum > 0;

  const handleSave = async () => {
    if (!changed || saving) return;
    setSaving(true);
    setError("");
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ price: priceNum }),
      });
      if (res.ok) {
        const { listing: updated } = await res.json();
        onUpdated(updated);
      } else {
        const data = await res.json();
        setError(data.error || "Error al actualizar");
      }
    } catch {
      setError("Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setError("");
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        onDeleted(listing.id);
      } else {
        const data = await res.json();
        setError(data.error || "Error al eliminar");
      }
    } catch {
      setError("Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  const ticketLabel = listing.ticket_type === "vip" ? "VIP" : "GA";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-[400px] bg-[#111111] sm:border border-[#2A2A2A] rounded-t-2xl sm:rounded-none p-6 max-h-[90vh] overflow-y-auto">
        {/* Drag handle mobile */}
        <div className="sm:hidden flex justify-center pb-4 cursor-grab">
          <div className="w-10 h-1 bg-[#444] rounded-full" />
        </div>

        <h3 className="text-base font-bold mb-1">Editar entrada</h3>
        <p className="text-xs text-[#888] mb-5">{listing.quantity}x {ticketLabel}</p>

        {/* Price input */}
        <label className="block text-xs font-semibold text-[#aaa] mb-2">Precio por entrada</label>
        <div className="flex items-center bg-[#1A1A1A] border border-[#2A2A2A] focus-within:border-[#EA580B]/50 transition-colors mb-5">
          <span className="text-sm text-[#888] font-semibold pl-4 pr-1">S/</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="1"
            className="flex-1 bg-transparent border-none text-white text-sm outline-none py-3 pr-4 placeholder:text-[#555] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!changed || saving}
          className={`w-full font-bold py-3 text-sm transition-colors flex items-center justify-center gap-2 border-none mb-3 ${
            changed && !saving
              ? "bg-[#EA580B] hover:bg-[#C74A09] text-white cursor-pointer"
              : "bg-[#2A2A2A] text-[#555] cursor-not-allowed"
          }`}
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar cambios"}
        </button>

        {/* Delete */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-3 text-sm font-semibold text-red-400 hover:text-red-300 bg-transparent border border-[#333] hover:border-red-500/30 cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Eliminar entrada
          </button>
        ) : (
          <div className="border border-red-500/30 p-4">
            <p className="text-xs text-red-300 mb-3">¿Seguro que quieres eliminar esta entrada? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 text-sm font-semibold bg-[#2A2A2A] text-white cursor-pointer border-none"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white cursor-pointer border-none flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
