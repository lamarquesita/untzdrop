"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 md:p-0">
      <div className="max-w-[1440px] mx-auto md:px-8 md:pb-6">
        <div className="bg-[#111111] border border-[#2A2A2A] px-5 py-4 md:px-6 md:py-5 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-2xl shadow-black/50">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#ccc] leading-relaxed">
              Usamos cookies y tecnologías similares para mejorar tu experiencia.
              Al continuar navegando, aceptas nuestro uso de cookies.{" "}
              <Link href="/cookies" className="text-primary hover:underline">
                Política de Cookies
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={decline}
              className="text-xs text-[#888] hover:text-white font-semibold cursor-pointer bg-transparent border border-[#333] px-4 py-2 transition-colors hover:border-[#555]"
            >
              Rechazar
            </button>
            <button
              onClick={accept}
              className="text-xs text-white font-semibold cursor-pointer bg-primary hover:brightness-110 border-none px-5 py-2 transition-all"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
