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
          <img src="/logo.png" alt="UntzDrop" className="h-14 w-14" />
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

const countries = [
  { code: "PE", name: "Perú", dial: "+51", flag: "🇵🇪", placeholder: "987 654 321", minDigits: 9 },
  { code: "US", name: "Estados Unidos", dial: "+1", flag: "🇺🇸", placeholder: "(123) 456-7890", minDigits: 10 },
  { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷", placeholder: "11 1234-5678", minDigits: 10 },
  { code: "CL", name: "Chile", dial: "+56", flag: "🇨🇱", placeholder: "9 1234 5678", minDigits: 9 },
  { code: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴", placeholder: "300 123 4567", minDigits: 10 },
  { code: "MX", name: "México", dial: "+52", flag: "🇲🇽", placeholder: "55 1234 5678", minDigits: 10 },
  { code: "EC", name: "Ecuador", dial: "+593", flag: "🇪🇨", placeholder: "99 123 4567", minDigits: 9 },
  { code: "BO", name: "Bolivia", dial: "+591", flag: "🇧🇴", placeholder: "7123 4567", minDigits: 8 },
  { code: "ES", name: "España", dial: "+34", flag: "🇪🇸", placeholder: "612 34 56 78", minDigits: 9 },
];

function PhoneStep({ phone, setPhone, onNext }: { phone: string; setPhone: (v: string) => void; onNext: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [country, setCountry] = useState(countries[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSubmit = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < country.minDigits) {
      setError("Ingresa un número de teléfono válido");
      return;
    }

    setLoading(true);
    setError("");

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: `${country.dial}${digits}`,
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
      <div className="relative mb-4">
        <div className="flex items-center bg-[#111111] border border-[#333] rounded-xl px-4">
          <button
            type="button"
            onClick={() => setShowDropdown((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-white pr-3 py-3.5 border-r border-[#333] shrink-0 bg-transparent border-y-0 border-l-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-lg">{country.flag}</span>
            {country.dial} <span className="text-[10px] text-muted">&#9660;</span>
          </button>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={country.placeholder}
            className="flex-1 bg-transparent border-none text-muted text-sm py-3.5 px-3 outline-none font-[family-name:var(--font-chakra)] placeholder:text-muted-dark"
          />
        </div>
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#111111] border border-[#333] rounded-xl max-h-[260px] overflow-y-auto z-20 shadow-2xl">
            {countries.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => { setCountry(c); setShowDropdown(false); setPhone(""); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#1a1a1a] cursor-pointer bg-transparent border-none text-left transition-colors"
              >
                <span className="text-lg">{c.flag}</span>
                <span className="flex-1">{c.name}</span>
                <span className="text-muted text-xs">{c.dial}</span>
              </button>
            ))}
          </div>
        )}
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no puede ser mayor a 5MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleComplete = async () => {
    if (!avatarFile) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Upload avatar to Supabase storage
        let avatarUrl: string | null = null;
        const fileExt = avatarFile.name.split(".").pop();
        const filePath = `${user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
          avatarUrl = urlData.publicUrl;
        }

        // Check for referral code
        const referralCode = typeof window !== 'undefined' ? localStorage.getItem('untzdrop_referral') : null;

        // Upsert profile
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: `${firstName} ${lastName}`.trim(),
            email: email,
            phone: user.phone,
            ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
          });

        if (error) {
          console.error('Error updating profile:', error);
          alert('Error saving profile information');
        } else {
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
          // Send welcome email
          if (email) {
            try {
              const { getAuthHeaders } = await import('@/lib/supabase');
              const headers = await getAuthHeaders();
              fetch('/api/welcome-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify({ name: `${firstName} ${lastName}`.trim(), email }),
              }).catch(() => {}); // fire and forget
            } catch {}
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
        Tu foto es requerida para crear tu cuenta
      </p>
      <p className="text-center text-xs text-muted-dark mb-6 relative z-10 font-[family-name:var(--font-chakra)]">
        Paso 3 de 3
      </p>

      <label className="block w-[120px] h-[120px] rounded-full bg-border-subtle border-2 border-dashed border-[#333] mx-auto mb-4 flex items-center justify-center flex-col gap-1.5 cursor-pointer hover:border-primary/50 overflow-hidden">
        {avatarPreview ? (
          <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <>
            <span className="text-[28px] text-muted-dark">&#128247;</span>
            <span className="text-[11px] text-muted-dark">Subir foto</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      <p className="text-center text-xs text-muted-dark mb-0">
        {avatarPreview ? (
          <button
            onClick={() => { setAvatarPreview(null); setAvatarFile(null); }}
            className="text-primary cursor-pointer bg-transparent border-none text-xs hover:underline"
          >
            Cambiar foto
          </button>
        ) : (
          <>JPG, PNG o GIF &middot; Máx 5MB</>
        )}
      </p>

      <div className="min-h-[140px]" />
      <button
        onClick={handleComplete}
        disabled={loading || !avatarFile}
        className={`w-full py-4 text-base font-semibold cursor-pointer font-[family-name:var(--font-chakra)] disabled:opacity-50 border-none ${
          avatarFile
            ? "bg-primary text-white"
            : "bg-[#333] text-[#666] cursor-not-allowed"
        }`}
      >
        {loading ? "Guardando..." : "Completar"}
      </button>
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
