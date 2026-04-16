"use client";

import { useState, useEffect } from "react";
import { X, Building2, ExternalLink, Trash2, Loader2, Shield } from "lucide-react";
import { getAuthHeaders } from "@/lib/supabase";

interface BankAccount {
  id: string;
  bank: string;
  last4: string;
  type: string;
  primary: boolean;
}

export default function BankAccountModal({
  accounts: initialAccounts,
  onClose,
}: {
  accounts: BankAccount[];
  onClose: () => void;
}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [loading, setLoading] = useState(false);
  const [connectStatus, setConnectStatus] = useState<"unknown" | "onboarded" | "not_onboarded">("unknown");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Check Stripe Connect status on mount
  useEffect(() => {
    async function checkConnect() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/connect/status", { headers });
        if (res.ok) {
          const data = await res.json();
          setConnectStatus(data.onboarded ? "onboarded" : "not_onboarded");
        } else {
          setConnectStatus("not_onboarded");
        }
      } catch {
        setConnectStatus("not_onboarded");
      }
    }
    checkConnect();
  }, []);

  const handleManageInStripe = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/connect/onboard", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al conectar con Stripe");
      } else if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      setError("Error de conexión");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full h-full sm:h-auto sm:max-w-[440px] bg-[#111111] sm:border border-[#2A2A2A] overflow-hidden sm:max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2A] shrink-0">
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold">Cuentas Bancarias</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-[#2A2A2A] cursor-pointer bg-transparent border-none text-[#888] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Existing accounts */}
          <div>
            <label className="block text-xs font-semibold text-[#aaa] mb-3">Cuentas Vinculadas</label>
            {accounts.length > 0 ? (
              <div className="space-y-2">
                {accounts.map((acc) => (
                  <div key={acc.id} className="bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-[#555]" />
                      <div>
                        <div className="text-sm font-semibold">{acc.bank} <span className="text-[#888] font-normal">****{acc.last4}</span></div>
                        <div className="text-[10px] text-[#666]">{acc.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {acc.primary && (
                        <span className="text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5">Principal</span>
                      )}
                      <button className="w-6 h-6 flex items-center justify-center hover:bg-red-500/15 cursor-pointer bg-transparent border-none text-[#555] hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-6 text-center">
                <Building2 className="w-8 h-8 text-[#333] mx-auto mb-2" />
                <p className="text-xs text-[#666]">No tienes cuentas bancarias vinculadas</p>
              </div>
            )}
          </div>

          {/* Stripe Connect info */}
          <div className="border-t border-[#2A2A2A] pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#888]" />
              <span className="text-xs font-semibold text-[#aaa]">Stripe Connect</span>
            </div>
            <p className="text-xs text-[#666] mb-4">
              Tus cuentas bancarias y pagos son gestionados de forma segura por Stripe. Para agregar, editar o eliminar cuentas bancarias, accede a tu panel de Stripe Connect.
            </p>

            {connectStatus === "onboarded" && (
              <p className="text-[10px] text-green-400 mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 inline-block" />
                Cuenta de Stripe Connect activa
              </p>
            )}
            {connectStatus === "not_onboarded" && (
              <p className="text-[10px] text-yellow-400 mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-yellow-400 inline-block" />
                Configuración de pagos pendiente
              </p>
            )}

            {error && (
              <p className="text-[10px] text-red-400 mb-3">{error}</p>
            )}

            <button
              onClick={handleManageInStripe}
              disabled={loading}
              className={`btn-tag-sm text-sm font-semibold px-5 py-2.5 cursor-pointer border-none transition-all w-full flex items-center justify-center gap-2 ${
                loading ? "bg-[#333] text-[#666] cursor-not-allowed" : "bg-primary hover:brightness-110 text-white"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Conectando...
                </>
              ) : connectStatus === "onboarded" ? (
                <>
                  Administrar en Stripe <ExternalLink className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Configurar Pagos con Stripe <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Security note */}
          <p className="text-[10px] text-[#555] leading-relaxed">
            UntzDrop no almacena tu información bancaria directamente. Todos los datos financieros son procesados y almacenados de forma segura por Stripe, que cumple con los estándares PCI DSS nivel 1.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2A2A2A] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="btn-tag-sm text-sm text-[#888] hover:text-white font-semibold cursor-pointer bg-transparent border border-[#333] px-5 py-2.5 transition-colors hover:border-[#555]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
