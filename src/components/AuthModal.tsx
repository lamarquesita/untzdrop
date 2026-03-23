"use client";

import { useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type Step = "phone" | "verify" | "name" | "email" | "avatar";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-[520px] bg-[#111111] border border-border rounded-[20px] p-10 pt-12 overflow-hidden">
        {/* Top glow */}
        <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[300px] h-[120px] bg-[radial-gradient(ellipse,rgba(236,130,23,0.3),transparent_70%)] pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-[22px] text-muted cursor-pointer z-10 hover:text-white"
        >
          &#10005;
        </button>

        {/* Bolt */}
        <div className="text-center mb-5 relative z-10">
          <img src="/logo.svg" alt="UntzDrop" className="h-14 w-14" />
        </div>

        {step === "phone" && <PhoneStep phone={phone} setPhone={setPhone} onNext={() => setStep("verify")} />}
        {step === "verify" && <VerifyStep phone={phone} onNext={async () => {
          // Check if user already has a profile (returning user)
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", user.id)
              .maybeSingle();
            if (profile?.full_name) {
              // Returning user — skip signup steps
              onClose();
              return;
            }
          }
          setStep("name");
        }} />}
        {step === "name" && (
          <NameStep
            firstName={firstName}
            lastName={lastName}
            setFirstName={setFirstName}
            setLastName={setLastName}
            onNext={() => setStep("email")}
          />
        )}
        {step === "email" && (
          <EmailStep
            email={email}
            setEmail={setEmail}
            onNext={() => setStep("avatar")}
          />
        )}
        {step === "avatar" && (
          <AvatarStep
            firstName={firstName}
            lastName={lastName}
            email={email}
            onDone={onClose}
          />
        )}
      </div>
    </div>
  );
}

function formatPhoneE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return `+1${digits}`;
}

function PhoneStep({ phone, setPhone, onNext }: { phone: string; setPhone: (v: string) => void; onNext: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Ingresa un número de teléfono válido");
      return;
    }

    setLoading(true);
    setError("");

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: formatPhoneE164(phone),
    });

    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    onNext();
  };

  return (
    <>
      <h2 className="text-center text-2xl font-bold mb-2 relative z-10 font-[family-name:var(--font-chakra)]">
        Bienvenido a UntzDrop
      </h2>
      <p className="text-center text-sm text-muted mb-8 relative z-10 font-[family-name:var(--font-chakra)]">
        Inicia sesión o regístrate
      </p>

      <label className="block text-sm font-semibold mb-2.5">Número de Teléfono</label>
      <div className="flex items-center bg-[#111111] border border-[#333] rounded-xl px-4 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-white pr-3 py-3.5 border-r border-[#333] shrink-0">
          <span className="text-lg">&#127482;&#127480;</span>
          +1 <span className="text-[10px] text-muted">&#9660;</span>
        </div>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(123) 456-7890"
          className="flex-1 bg-transparent border-none text-muted text-sm py-3.5 px-3 outline-none font-[family-name:var(--font-chakra)] placeholder:text-muted-dark"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs mb-3 font-[family-name:var(--font-chakra)]">{error}</p>
      )}

      <p className="text-xs text-muted leading-relaxed mb-0 font-[family-name:var(--font-chakra)]">
        Al continuar, aceptas nuestros{" "}
        <a href="/terms" target="_blank" className="text-primary no-underline">Términos</a>,{" "}
        <a href="/privacy" target="_blank" className="text-primary no-underline">Política de Privacidad</a>, y das tu consentimiento para recibir mensajes de texto. Responde STOP para cancelar y AYUDA para obtener ayuda.
      </p>

      <div className="min-h-[140px]" />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-[#888] text-black py-4 text-base font-semibold cursor-pointer font-[family-name:var(--font-chakra)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <Spinner />}
        Enviar
      </button>
    </>
  );
}

function VerifyStep({ phone, onNext }: { phone: string; onNext: () => void }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setRef = useCallback((index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const token = otp.join("");
    if (token.length < 6) {
      setError("Ingresa el código completo de 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: formatPhoneE164(phone),
      token,
      type: "sms",
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    onNext();
  };

  const handleResend = async () => {
    setResending(true);
    setError("");

    const { error: resendError } = await supabase.auth.signInWithOtp({
      phone: formatPhoneE164(phone),
    });

    setResending(false);

    if (resendError) {
      setError(resendError.message);
    }
  };

  const displayPhone = phone || "(561) 345-2342";
  return (
    <>
      <h2 className="text-center text-2xl font-bold mb-2 relative z-10 font-[family-name:var(--font-chakra)]">
        Verifica tu número
      </h2>
      <p className="text-center text-sm text-muted mb-8 relative z-10 font-[family-name:var(--font-chakra)]">
        Ingresa el código que enviamos al {displayPhone}
      </p>

      <div className="flex gap-3 justify-center mb-5">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={setRef(i)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className="w-16 h-[72px] bg-[#111111] border border-[#333] rounded-xl text-center text-2xl text-white font-[family-name:var(--font-chakra)] outline-none focus:border-primary"
          />
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-xs text-center mb-3 font-[family-name:var(--font-chakra)]">{error}</p>
      )}

      <p className="text-center text-sm text-muted mb-0 font-[family-name:var(--font-chakra)]">
        ¿No recibiste el código?{" "}
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-white underline bg-transparent border-none cursor-pointer font-[family-name:var(--font-chakra)] text-sm disabled:opacity-50"
        >
          {resending ? "Reenviando..." : "Reenviar"}
        </button>
      </p>

      <div className="min-h-[140px]" />
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-[#888] text-black py-4 text-base font-semibold cursor-pointer font-[family-name:var(--font-chakra)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <Spinner />}
        Verificar
      </button>
    </>
  );
}

function NameStep({
  firstName,
  lastName,
  setFirstName,
  setLastName,
  onNext,
}: {
  firstName: string;
  lastName: string;
  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
  onNext: () => void;
}) {
  return (
    <>
      <h2 className="text-center text-2xl font-bold mb-2 relative z-10 font-[family-name:var(--font-chakra)]">
        ¿Cómo te llamas?
      </h2>
      <p className="text-center text-sm text-muted mb-4 relative z-10 font-[family-name:var(--font-chakra)]">
        Que la escena sepa quién eres
      </p>
      <p className="text-center text-xs text-muted-dark mb-6 relative z-10 font-[family-name:var(--font-chakra)]">
        Paso 1 de 3
      </p>

      <label className="block text-sm font-semibold mb-2.5">Nombre</label>
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="Ingresa tu nombre"
        className="w-full bg-[#111111] border border-[#333] rounded-xl px-4 py-3.5 text-sm text-white mb-4 outline-none font-[family-name:var(--font-chakra)] placeholder:text-muted-dark"
      />

      <label className="block text-sm font-semibold mb-2.5">Apellido</label>
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Ingresa tu apellido"
        className="w-full bg-[#111111] border border-[#333] rounded-xl px-4 py-3.5 text-sm text-white mb-4 outline-none font-[family-name:var(--font-chakra)] placeholder:text-muted-dark"
      />

      <div className="min-h-[80px]" />
      <button onClick={onNext} className="w-full bg-[#888] text-black py-4 text-base font-semibold cursor-pointer font-[family-name:var(--font-chakra)]">
        Continuar
      </button>
    </>
  );
}

function EmailStep({
  email,
  setEmail,
  onNext,
}: {
  email: string;
  setEmail: (email: string) => void;
  onNext: () => void;
}) {
  return (
    <>
      <h2 className="text-center text-2xl font-bold mb-2 relative z-10 font-[family-name:var(--font-chakra)]">
        Agrega tu correo
      </h2>
      <p className="text-center text-sm text-muted mb-4 relative z-10 font-[family-name:var(--font-chakra)]">
        Lo usaremos para recibos y recuperación de cuenta
      </p>
      <p className="text-center text-xs text-muted-dark mb-6 relative z-10 font-[family-name:var(--font-chakra)]">
        Paso 2 de 3
      </p>

      <label className="block text-sm font-semibold mb-2.5">Correo Electrónico</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@ejemplo.com"
        className="w-full bg-[#111111] border border-[#333] rounded-xl px-4 py-3.5 text-sm text-white mb-4 outline-none font-[family-name:var(--font-chakra)] placeholder:text-muted-dark"
      />

      <div className="min-h-[140px]" />
      <button onClick={onNext} className="w-full bg-[#888] text-black py-4 text-base font-semibold cursor-pointer font-[family-name:var(--font-chakra)]">
        Continuar
      </button>
    </>
  );
}

function AvatarStep({
  firstName,
  lastName,
  email,
  onDone,
}: {
  firstName: string;
  lastName: string;
  email: string;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check for referral code
        const referralCode = typeof window !== 'undefined' ? localStorage.getItem('untzdrop_referral') : null;

        // Upsert profile in database (insert if trigger didn't create it)
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: `${firstName} ${lastName}`.trim(),
            email: email,
            phone: user.phone,
          });

        if (error) {
          console.error('Error updating profile:', error);
          alert('Error saving profile information');
        } else {
          // Process referral if exists
          if (referralCode) {
            try {
              const { getAuthHeaders } = await import('@/lib/supabase');
              const headers = await getAuthHeaders();
              await fetch('/api/referral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify({ referral_code: referralCode }),
              });
              localStorage.removeItem('untzdrop_referral');
            } catch (e) {
              console.error('Referral error:', e);
            }
          }
          onDone();
        }
      }
    } catch (error) {
      console.error('Error completing registration:', error);
      alert('Error completing registration');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <h2 className="text-center text-2xl font-bold mb-2 relative z-10 font-[family-name:var(--font-chakra)]">
        Agrega una foto de perfil
      </h2>
      <p className="text-center text-sm text-muted mb-4 relative z-10 font-[family-name:var(--font-chakra)]">
        Ayuda a que te reconozcan en los eventos
      </p>
      <p className="text-center text-xs text-muted-dark mb-6 relative z-10 font-[family-name:var(--font-chakra)]">
        Paso 3 de 3
      </p>

      <div className="w-[120px] h-[120px] rounded-full bg-border-subtle border-2 border-dashed border-[#333] mx-auto mb-4 flex items-center justify-center flex-col gap-1.5 cursor-pointer hover:border-primary/50">
        <span className="text-[28px] text-muted-dark">&#128247;</span>
        <span className="text-[11px] text-muted-dark">Subir foto</span>
      </div>
      <p className="text-center text-xs text-muted-dark mb-0">
        JPG, PNG o GIF &middot; Máx 5MB
      </p>

      <div className="min-h-[140px]" />
      <div className="flex gap-3">
        <button
          onClick={handleComplete}
          disabled={loading}
          className="flex-1 bg-transparent border border-[#333] text-muted py-4 text-base font-semibold cursor-pointer font-[family-name:var(--font-chakra)] disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Omitir"}
        </button>
        <button
          onClick={handleComplete}
          disabled={loading}
          className="flex-1 bg-[#888] text-black py-4 text-base font-semibold cursor-pointer font-[family-name:var(--font-chakra)] disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Completar"}
        </button>
      </div>
    </>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
