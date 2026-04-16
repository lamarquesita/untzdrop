"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Upload, FileText, Trash2, AlertTriangle } from "lucide-react";
import { Order } from "@/lib/mockDashboard";

const issueTypes = [
  { value: "invalid_ticket", label: "Entrada inválida o no funcionó" },
  { value: "wrong_ticket", label: "Entrada incorrecta recibida" },
  { value: "not_received", label: "Nunca recibí la entrada" },
  { value: "duplicate", label: "Entrada duplicada o ya usada" },
  { value: "wrong_quantity", label: "Cantidad incorrecta de entradas" },
  { value: "event_cancelled", label: "Evento cancelado" },
  { value: "other", label: "Otro problema" },
];

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  preview?: string;
}

export default function DisputeModal({
  order,
  onClose,
  onSubmit,
}: {
  order: Order;
  onClose: () => void;
  onSubmit: (data: {
    issueType: string;
    ticketQuantity: number;
    description: string;
    files: UploadedFile[];
  }) => void;
}) {
  const [issueType, setIssueType] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleSubmit = () => {
    const issueLabel = issueTypes.find((t) => t.value === issueType)?.label ?? issueType;
    const subject = encodeURIComponent(`Reporte de Problema — Orden ${order.orderNumber}`);
    const body = encodeURIComponent(
      `Orden: ${order.orderNumber}\n` +
      `Evento: ${order.event.name}\n` +
      `Tipo de problema: ${issueLabel}\n` +
      `Entradas afectadas: ${ticketQuantity}\n\n` +
      `Descripción:\n${description}\n\n` +
      (files.length > 0 ? `[${files.length} archivo(s) adjunto(s) — por favor responda a este correo para enviar la evidencia]\n` : "")
    );
    window.open(`mailto:ayuda@untzdrop.com?subject=${subject}&body=${body}`, "_self");
    onSubmit({ issueType, ticketQuantity, description, files });
    setSubmitted(true);
  };

  const isValid = issueType && description.trim().length >= 10;

  function formatBytes(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full h-full sm:h-auto sm:max-w-[500px] bg-[#111111] sm:border border-[#2A2A2A] overflow-hidden sm:max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2A] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/15 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <h2 className="text-base font-bold">Reportar un Problema</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center  hover:bg-[#2A2A2A] cursor-pointer bg-transparent border-none text-[#888] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="px-6 py-12 text-center">
            <div className="w-14 h-14 bg-green-500/15 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Reporte Enviado</h3>
            <p className="text-sm text-[#888] mb-1">Se abrió un correo dirigido a <span className="text-white">ayuda@untzdrop.com</span> con los detalles de tu reporte.</p>
            <p className="text-sm text-[#888] mb-1">Si tienes archivos de evidencia, adjúntalos al correo antes de enviarlo.</p>
            <p className="text-xs text-[#666] mb-6">Nuestro equipo revisará tu caso dentro de las próximas 48 horas.</p>
            <button
              onClick={onClose}
              className="btn-tag-sm bg-[#2A2A2A] hover:bg-[#333] text-white text-sm font-semibold px-6 py-2.5 cursor-pointer border-none transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          /* Form */
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {/* Order context */}
            <div className="bg-[#1A1A1A]  px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10  bg-gradient-to-br from-[#2a2040] to-[#2A2A2A] shrink-0 overflow-hidden">
                {order.event.image_url && (
                  <img src={order.event.image_url} alt={order.event.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{order.event.name}</div>
                <div className="text-xs text-[#666]">Orden: {order.orderNumber}</div>
              </div>
            </div>

            {/* Issue type */}
            <div>
              <label className="block text-xs font-semibold text-[#aaa] mb-2">Tipo de problema</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A]  px-4 py-3 text-sm text-white outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="" disabled>Selecciona un problema</option>
                {issueTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Ticket quantity */}
            <div>
              <label className="block text-xs font-semibold text-[#aaa] mb-2">Cantidad de entradas afectadas</label>
              <select
                value={ticketQuantity}
                onChange={(e) => setTicketQuantity(Number(e.target.value))}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A]  px-4 py-3 text-sm text-white outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
              >
                {Array.from({ length: order.ticketQuantity }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} entrada{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#aaa] mb-2">Cuéntanos qué pasó</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el problema con el mayor detalle posible..."
                rows={4}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A]  px-4 py-3 text-sm text-white outline-none focus:border-primary/50 transition-colors resize-none placeholder:text-[#555]"
              />
              <div className="text-xs text-[#555] mt-1 text-right">{description.length} caracteres</div>
            </div>

            {/* File upload */}
            <div>
              <label className="block text-xs font-semibold text-[#aaa] mb-1">Subir evidencia</label>
              <p className="text-xs text-[#555] mb-3">
                Sube pruebas de esta transacción — ej. mensajes del vendedor, recibo de la entrada, o comprobante de compra en el venue.
              </p>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed  px-4 py-6 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-primary/50 bg-primary/5"
                    : "border-[#2A2A2A] hover:border-[#444] bg-[#1A1A1A]"
                }`}
              >
                <Upload className="w-6 h-6 text-[#555] mx-auto mb-2" />
                <p className="text-xs text-[#888]">
                  <span className="text-primary font-semibold">Buscar archivos</span> o arrastra y suelta
                </p>
                <p className="text-[10px] text-[#555] mt-1">PNG, JPG, PDF — máx. 10MB</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />

              {/* Uploaded files list */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#1A1A1A]  px-3 py-2">
                      {file.preview ? (
                        <img src={file.preview} alt={file.name} className="w-8 h-8 object-cover shrink-0" />
                      ) : (
                        <FileText className="w-5 h-5 text-[#555] shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white truncate">{file.name}</div>
                        <div className="text-[10px] text-[#555]">{formatBytes(file.size)}</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        className="w-6 h-6 flex items-center justify-center hover:bg-red-500/15 cursor-pointer bg-transparent border-none text-[#555] hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer buttons */}
        {!submitted && (
          <div className="px-6 py-4 border-t border-[#2A2A2A] flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="btn-tag-sm text-sm text-[#888] hover:text-white font-semibold cursor-pointer bg-transparent border border-[#333] px-5 py-2.5 transition-colors hover:border-[#555]"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`btn-tag-sm text-sm text-white font-semibold cursor-pointer border-none px-5 py-2.5 transition-all ${
                isValid
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-[#333] text-[#666] cursor-not-allowed"
              }`}
            >
              Enviar Reporte
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
