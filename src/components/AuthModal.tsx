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
  // Default: Peru (pinned to top)
  { code: "PE", name: "Perú", dial: "+51", flag: "🇵🇪", minDigits: 9 },
  // All other countries (alphabetical)
  { code: "AF", name: "Afganistán", dial: "+93", flag: "🇦🇫", minDigits: 9 },
  { code: "AL", name: "Albania", dial: "+355", flag: "🇦🇱", minDigits: 9 },
  { code: "DE", name: "Alemania", dial: "+49", flag: "🇩🇪", minDigits: 10 },
  { code: "AD", name: "Andorra", dial: "+376", flag: "🇦🇩", minDigits: 6 },
  { code: "AO", name: "Angola", dial: "+244", flag: "🇦🇴", minDigits: 9 },
  { code: "AI", name: "Anguila", dial: "+1264", flag: "🇦🇮", minDigits: 7 },
  { code: "AG", name: "Antigua y Barbuda", dial: "+1268", flag: "🇦🇬", minDigits: 7 },
  { code: "SA", name: "Arabia Saudita", dial: "+966", flag: "🇸🇦", minDigits: 9 },
  { code: "DZ", name: "Argelia", dial: "+213", flag: "🇩🇿", minDigits: 9 },
  { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷", minDigits: 10 },
  { code: "AM", name: "Armenia", dial: "+374", flag: "🇦🇲", minDigits: 8 },
  { code: "AW", name: "Aruba", dial: "+297", flag: "🇦🇼", minDigits: 7 },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺", minDigits: 9 },
  { code: "AT", name: "Austria", dial: "+43", flag: "🇦🇹", minDigits: 10 },
  { code: "AZ", name: "Azerbaiyán", dial: "+994", flag: "🇦🇿", minDigits: 9 },
  { code: "BS", name: "Bahamas", dial: "+1242", flag: "🇧🇸", minDigits: 7 },
  { code: "BH", name: "Baréin", dial: "+973", flag: "🇧🇭", minDigits: 8 },
  { code: "BD", name: "Bangladés", dial: "+880", flag: "🇧🇩", minDigits: 10 },
  { code: "BB", name: "Barbados", dial: "+1246", flag: "🇧🇧", minDigits: 7 },
  { code: "BE", name: "Bélgica", dial: "+32", flag: "🇧🇪", minDigits: 9 },
  { code: "BZ", name: "Belice", dial: "+501", flag: "🇧🇿", minDigits: 7 },
  { code: "BJ", name: "Benín", dial: "+229", flag: "🇧🇯", minDigits: 8 },
  { code: "BM", name: "Bermudas", dial: "+1441", flag: "🇧🇲", minDigits: 7 },
  { code: "BY", name: "Bielorrusia", dial: "+375", flag: "🇧🇾", minDigits: 9 },
  { code: "BO", name: "Bolivia", dial: "+591", flag: "🇧🇴", minDigits: 8 },
  { code: "BA", name: "Bosnia y Herzegovina", dial: "+387", flag: "🇧🇦", minDigits: 8 },
  { code: "BW", name: "Botsuana", dial: "+267", flag: "🇧🇼", minDigits: 8 },
  { code: "BR", name: "Brasil", dial: "+55", flag: "🇧🇷", minDigits: 10 },
  { code: "BN", name: "Brunéi", dial: "+673", flag: "🇧🇳", minDigits: 7 },
  { code: "BG", name: "Bulgaria", dial: "+359", flag: "🇧🇬", minDigits: 9 },
  { code: "BF", name: "Burkina Faso", dial: "+226", flag: "🇧🇫", minDigits: 8 },
  { code: "BI", name: "Burundi", dial: "+257", flag: "🇧🇮", minDigits: 8 },
  { code: "BT", name: "Bután", dial: "+975", flag: "🇧🇹", minDigits: 8 },
  { code: "CV", name: "Cabo Verde", dial: "+238", flag: "🇨🇻", minDigits: 7 },
  { code: "KH", name: "Camboya", dial: "+855", flag: "🇰🇭", minDigits: 8 },
  { code: "CM", name: "Camerún", dial: "+237", flag: "🇨🇲", minDigits: 9 },
  { code: "CA", name: "Canadá", dial: "+1", flag: "🇨🇦", minDigits: 10 },
  { code: "QA", name: "Catar", dial: "+974", flag: "🇶🇦", minDigits: 8 },
  { code: "TD", name: "Chad", dial: "+235", flag: "🇹🇩", minDigits: 8 },
  { code: "CL", name: "Chile", dial: "+56", flag: "🇨🇱", minDigits: 9 },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳", minDigits: 11 },
  { code: "CY", name: "Chipre", dial: "+357", flag: "🇨🇾", minDigits: 8 },
  { code: "VA", name: "Ciudad del Vaticano", dial: "+379", flag: "🇻🇦", minDigits: 6 },
  { code: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴", minDigits: 10 },
  { code: "KM", name: "Comoras", dial: "+269", flag: "🇰🇲", minDigits: 7 },
  { code: "KP", name: "Corea del Norte", dial: "+850", flag: "🇰🇵", minDigits: 8 },
  { code: "KR", name: "Corea del Sur", dial: "+82", flag: "🇰🇷", minDigits: 9 },
  { code: "CI", name: "Costa de Marfil", dial: "+225", flag: "🇨🇮", minDigits: 10 },
  { code: "CR", name: "Costa Rica", dial: "+506", flag: "🇨🇷", minDigits: 8 },
  { code: "HR", name: "Croacia", dial: "+385", flag: "🇭🇷", minDigits: 9 },
  { code: "CU", name: "Cuba", dial: "+53", flag: "🇨🇺", minDigits: 8 },
  { code: "CW", name: "Curazao", dial: "+599", flag: "🇨🇼", minDigits: 7 },
  { code: "DK", name: "Dinamarca", dial: "+45", flag: "🇩🇰", minDigits: 8 },
  { code: "DM", name: "Dominica", dial: "+1767", flag: "🇩🇲", minDigits: 7 },
  { code: "EC", name: "Ecuador", dial: "+593", flag: "🇪🇨", minDigits: 9 },
  { code: "EG", name: "Egipto", dial: "+20", flag: "🇪🇬", minDigits: 10 },
  { code: "SV", name: "El Salvador", dial: "+503", flag: "🇸🇻", minDigits: 8 },
  { code: "AE", name: "Emiratos Árabes Unidos", dial: "+971", flag: "🇦🇪", minDigits: 9 },
  { code: "ER", name: "Eritrea", dial: "+291", flag: "🇪🇷", minDigits: 7 },
  { code: "SK", name: "Eslovaquia", dial: "+421", flag: "🇸🇰", minDigits: 9 },
  { code: "SI", name: "Eslovenia", dial: "+386", flag: "🇸🇮", minDigits: 8 },
  { code: "ES", name: "España", dial: "+34", flag: "🇪🇸", minDigits: 9 },
  { code: "US", name: "Estados Unidos", dial: "+1", flag: "🇺🇸", minDigits: 10 },
  { code: "EE", name: "Estonia", dial: "+372", flag: "🇪🇪", minDigits: 8 },
  { code: "ET", name: "Etiopía", dial: "+251", flag: "🇪🇹", minDigits: 9 },
  { code: "PH", name: "Filipinas", dial: "+63", flag: "🇵🇭", minDigits: 10 },
  { code: "FI", name: "Finlandia", dial: "+358", flag: "🇫🇮", minDigits: 9 },
  { code: "FJ", name: "Fiyi", dial: "+679", flag: "🇫🇯", minDigits: 7 },
  { code: "FR", name: "Francia", dial: "+33", flag: "🇫🇷", minDigits: 9 },
  { code: "GA", name: "Gabón", dial: "+241", flag: "🇬🇦", minDigits: 7 },
  { code: "GM", name: "Gambia", dial: "+220", flag: "🇬🇲", minDigits: 7 },
  { code: "GE", name: "Georgia", dial: "+995", flag: "🇬🇪", minDigits: 9 },
  { code: "GH", name: "Ghana", dial: "+233", flag: "🇬🇭", minDigits: 9 },
  { code: "GI", name: "Gibraltar", dial: "+350", flag: "🇬🇮", minDigits: 8 },
  { code: "GD", name: "Granada", dial: "+1473", flag: "🇬🇩", minDigits: 7 },
  { code: "GR", name: "Grecia", dial: "+30", flag: "🇬🇷", minDigits: 10 },
  { code: "GL", name: "Groenlandia", dial: "+299", flag: "🇬🇱", minDigits: 6 },
  { code: "GP", name: "Guadalupe", dial: "+590", flag: "🇬🇵", minDigits: 9 },
  { code: "GU", name: "Guam", dial: "+1671", flag: "🇬🇺", minDigits: 7 },
  { code: "GT", name: "Guatemala", dial: "+502", flag: "🇬🇹", minDigits: 8 },
  { code: "GF", name: "Guayana Francesa", dial: "+594", flag: "🇬🇫", minDigits: 9 },
  { code: "GG", name: "Guernsey", dial: "+44", flag: "🇬🇬", minDigits: 10 },
  { code: "GN", name: "Guinea", dial: "+224", flag: "🇬🇳", minDigits: 9 },
  { code: "GQ", name: "Guinea Ecuatorial", dial: "+240", flag: "🇬🇶", minDigits: 9 },
  { code: "GW", name: "Guinea-Bisáu", dial: "+245", flag: "🇬🇼", minDigits: 9 },
  { code: "GY", name: "Guyana", dial: "+592", flag: "🇬🇾", minDigits: 7 },
  { code: "HT", name: "Haití", dial: "+509", flag: "🇭🇹", minDigits: 8 },
  { code: "HN", name: "Honduras", dial: "+504", flag: "🇭🇳", minDigits: 8 },
  { code: "HK", name: "Hong Kong", dial: "+852", flag: "🇭🇰", minDigits: 8 },
  { code: "HU", name: "Hungría", dial: "+36", flag: "🇭🇺", minDigits: 9 },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳", minDigits: 10 },
  { code: "ID", name: "Indonesia", dial: "+62", flag: "🇮🇩", minDigits: 10 },
  { code: "IQ", name: "Irak", dial: "+964", flag: "🇮🇶", minDigits: 10 },
  { code: "IR", name: "Irán", dial: "+98", flag: "🇮🇷", minDigits: 10 },
  { code: "IE", name: "Irlanda", dial: "+353", flag: "🇮🇪", minDigits: 9 },
  { code: "IM", name: "Isla de Man", dial: "+44", flag: "🇮🇲", minDigits: 10 },
  { code: "IS", name: "Islandia", dial: "+354", flag: "🇮🇸", minDigits: 7 },
  { code: "KY", name: "Islas Caimán", dial: "+1345", flag: "🇰🇾", minDigits: 7 },
  { code: "CK", name: "Islas Cook", dial: "+682", flag: "🇨🇰", minDigits: 5 },
  { code: "FO", name: "Islas Feroe", dial: "+298", flag: "🇫🇴", minDigits: 6 },
  { code: "FK", name: "Islas Malvinas", dial: "+500", flag: "🇫🇰", minDigits: 5 },
  { code: "MP", name: "Islas Marianas del Norte", dial: "+1670", flag: "🇲🇵", minDigits: 7 },
  { code: "MH", name: "Islas Marshall", dial: "+692", flag: "🇲🇭", minDigits: 7 },
  { code: "SB", name: "Islas Salomón", dial: "+677", flag: "🇸🇧", minDigits: 7 },
  { code: "TC", name: "Islas Turcas y Caicos", dial: "+1649", flag: "🇹🇨", minDigits: 7 },
  { code: "VG", name: "Islas Vírgenes Británicas", dial: "+1284", flag: "🇻🇬", minDigits: 7 },
  { code: "VI", name: "Islas Vírgenes de EE.UU.", dial: "+1340", flag: "🇻🇮", minDigits: 7 },
  { code: "IL", name: "Israel", dial: "+972", flag: "🇮🇱", minDigits: 9 },
  { code: "IT", name: "Italia", dial: "+39", flag: "🇮🇹", minDigits: 10 },
  { code: "JM", name: "Jamaica", dial: "+1876", flag: "🇯🇲", minDigits: 7 },
  { code: "JP", name: "Japón", dial: "+81", flag: "🇯🇵", minDigits: 10 },
  { code: "JE", name: "Jersey", dial: "+44", flag: "🇯🇪", minDigits: 10 },
  { code: "JO", name: "Jordania", dial: "+962", flag: "🇯🇴", minDigits: 9 },
  { code: "KZ", name: "Kazajistán", dial: "+7", flag: "🇰🇿", minDigits: 10 },
  { code: "KE", name: "Kenia", dial: "+254", flag: "🇰🇪", minDigits: 10 },
  { code: "KG", name: "Kirguistán", dial: "+996", flag: "🇰🇬", minDigits: 9 },
  { code: "KI", name: "Kiribati", dial: "+686", flag: "🇰🇮", minDigits: 5 },
  { code: "KW", name: "Kuwait", dial: "+965", flag: "🇰🇼", minDigits: 8 },
  { code: "LA", name: "Laos", dial: "+856", flag: "🇱🇦", minDigits: 9 },
  { code: "LS", name: "Lesoto", dial: "+266", flag: "🇱🇸", minDigits: 8 },
  { code: "LV", name: "Letonia", dial: "+371", flag: "🇱🇻", minDigits: 8 },
  { code: "LB", name: "Líbano", dial: "+961", flag: "🇱🇧", minDigits: 7 },
  { code: "LR", name: "Liberia", dial: "+231", flag: "🇱🇷", minDigits: 8 },
  { code: "LY", name: "Libia", dial: "+218", flag: "🇱🇾", minDigits: 9 },
  { code: "LI", name: "Liechtenstein", dial: "+423", flag: "🇱🇮", minDigits: 7 },
  { code: "LT", name: "Lituania", dial: "+370", flag: "🇱🇹", minDigits: 8 },
  { code: "LU", name: "Luxemburgo", dial: "+352", flag: "🇱🇺", minDigits: 9 },
  { code: "MO", name: "Macao", dial: "+853", flag: "🇲🇴", minDigits: 8 },
  { code: "MK", name: "Macedonia del Norte", dial: "+389", flag: "🇲🇰", minDigits: 8 },
  { code: "MG", name: "Madagascar", dial: "+261", flag: "🇲🇬", minDigits: 9 },
  { code: "MY", name: "Malasia", dial: "+60", flag: "🇲🇾", minDigits: 9 },
  { code: "MW", name: "Malaui", dial: "+265", flag: "🇲🇼", minDigits: 9 },
  { code: "MV", name: "Maldivas", dial: "+960", flag: "🇲🇻", minDigits: 7 },
  { code: "ML", name: "Malí", dial: "+223", flag: "🇲🇱", minDigits: 8 },
  { code: "MT", name: "Malta", dial: "+356", flag: "🇲🇹", minDigits: 8 },
  { code: "MA", name: "Marruecos", dial: "+212", flag: "🇲🇦", minDigits: 9 },
  { code: "MQ", name: "Martinica", dial: "+596", flag: "🇲🇶", minDigits: 9 },
  { code: "MU", name: "Mauricio", dial: "+230", flag: "🇲🇺", minDigits: 7 },
  { code: "MR", name: "Mauritania", dial: "+222", flag: "🇲🇷", minDigits: 8 },
  { code: "YT", name: "Mayotte", dial: "+262", flag: "🇾🇹", minDigits: 9 },
  { code: "MX", name: "México", dial: "+52", flag: "🇲🇽", minDigits: 10 },
  { code: "FM", name: "Micronesia", dial: "+691", flag: "🇫🇲", minDigits: 7 },
  { code: "MD", name: "Moldavia", dial: "+373", flag: "🇲🇩", minDigits: 8 },
  { code: "MC", name: "Mónaco", dial: "+377", flag: "🇲🇨", minDigits: 8 },
  { code: "MN", name: "Mongolia", dial: "+976", flag: "🇲🇳", minDigits: 8 },
  { code: "ME", name: "Montenegro", dial: "+382", flag: "🇲🇪", minDigits: 8 },
  { code: "MS", name: "Montserrat", dial: "+1664", flag: "🇲🇸", minDigits: 7 },
  { code: "MZ", name: "Mozambique", dial: "+258", flag: "🇲🇿", minDigits: 9 },
  { code: "MM", name: "Myanmar", dial: "+95", flag: "🇲🇲", minDigits: 9 },
  { code: "NA", name: "Namibia", dial: "+264", flag: "🇳🇦", minDigits: 9 },
  { code: "NR", name: "Nauru", dial: "+674", flag: "🇳🇷", minDigits: 7 },
  { code: "NP", name: "Nepal", dial: "+977", flag: "🇳🇵", minDigits: 10 },
  { code: "NI", name: "Nicaragua", dial: "+505", flag: "🇳🇮", minDigits: 8 },
  { code: "NE", name: "Níger", dial: "+227", flag: "🇳🇪", minDigits: 8 },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬", minDigits: 10 },
  { code: "NU", name: "Niue", dial: "+683", flag: "🇳🇺", minDigits: 4 },
  { code: "NO", name: "Noruega", dial: "+47", flag: "🇳🇴", minDigits: 8 },
  { code: "NC", name: "Nueva Caledonia", dial: "+687", flag: "🇳🇨", minDigits: 6 },
  { code: "NZ", name: "Nueva Zelanda", dial: "+64", flag: "🇳🇿", minDigits: 9 },
  { code: "OM", name: "Omán", dial: "+968", flag: "🇴🇲", minDigits: 8 },
  { code: "NL", name: "Países Bajos", dial: "+31", flag: "🇳🇱", minDigits: 9 },
  { code: "PK", name: "Pakistán", dial: "+92", flag: "🇵🇰", minDigits: 10 },
  { code: "PW", name: "Palaos", dial: "+680", flag: "🇵🇼", minDigits: 7 },
  { code: "PS", name: "Palestina", dial: "+970", flag: "🇵🇸", minDigits: 9 },
  { code: "PA", name: "Panamá", dial: "+507", flag: "🇵🇦", minDigits: 8 },
  { code: "PG", name: "Papúa Nueva Guinea", dial: "+675", flag: "🇵🇬", minDigits: 8 },
  { code: "PY", name: "Paraguay", dial: "+595", flag: "🇵🇾", minDigits: 9 },
  { code: "PF", name: "Polinesia Francesa", dial: "+689", flag: "🇵🇫", minDigits: 8 },
  { code: "PL", name: "Polonia", dial: "+48", flag: "🇵🇱", minDigits: 9 },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹", minDigits: 9 },
  { code: "PR", name: "Puerto Rico", dial: "+1", flag: "🇵🇷", minDigits: 10 },
  { code: "GB", name: "Reino Unido", dial: "+44", flag: "🇬🇧", minDigits: 10 },
  { code: "CF", name: "República Centroafricana", dial: "+236", flag: "🇨🇫", minDigits: 8 },
  { code: "CZ", name: "República Checa", dial: "+420", flag: "🇨🇿", minDigits: 9 },
  { code: "CD", name: "República Democrática del Congo", dial: "+243", flag: "🇨🇩", minDigits: 9 },
  { code: "DO", name: "República Dominicana", dial: "+1", flag: "🇩🇴", minDigits: 10 },
  { code: "CG", name: "República del Congo", dial: "+242", flag: "🇨🇬", minDigits: 9 },
  { code: "RE", name: "Reunión", dial: "+262", flag: "🇷🇪", minDigits: 9 },
  { code: "RW", name: "Ruanda", dial: "+250", flag: "🇷🇼", minDigits: 9 },
  { code: "RO", name: "Rumanía", dial: "+40", flag: "🇷🇴", minDigits: 9 },
  { code: "RU", name: "Rusia", dial: "+7", flag: "🇷🇺", minDigits: 10 },
  { code: "EH", name: "Sahara Occidental", dial: "+212", flag: "🇪🇭", minDigits: 9 },
  { code: "WS", name: "Samoa", dial: "+685", flag: "🇼🇸", minDigits: 6 },
  { code: "AS", name: "Samoa Americana", dial: "+1684", flag: "🇦🇸", minDigits: 7 },
  { code: "BL", name: "San Bartolomé", dial: "+590", flag: "🇧🇱", minDigits: 9 },
  { code: "KN", name: "San Cristóbal y Nieves", dial: "+1869", flag: "🇰🇳", minDigits: 7 },
  { code: "SM", name: "San Marino", dial: "+378", flag: "🇸🇲", minDigits: 10 },
  { code: "MF", name: "San Martín", dial: "+590", flag: "🇲🇫", minDigits: 9 },
  { code: "PM", name: "San Pedro y Miquelón", dial: "+508", flag: "🇵🇲", minDigits: 6 },
  { code: "VC", name: "San Vicente y las Granadinas", dial: "+1784", flag: "🇻🇨", minDigits: 7 },
  { code: "SH", name: "Santa Elena", dial: "+290", flag: "🇸🇭", minDigits: 4 },
  { code: "LC", name: "Santa Lucía", dial: "+1758", flag: "🇱🇨", minDigits: 7 },
  { code: "ST", name: "Santo Tomé y Príncipe", dial: "+239", flag: "🇸🇹", minDigits: 7 },
  { code: "SN", name: "Senegal", dial: "+221", flag: "🇸🇳", minDigits: 9 },
  { code: "RS", name: "Serbia", dial: "+381", flag: "🇷🇸", minDigits: 9 },
  { code: "SC", name: "Seychelles", dial: "+248", flag: "🇸🇨", minDigits: 7 },
  { code: "SL", name: "Sierra Leona", dial: "+232", flag: "🇸🇱", minDigits: 8 },
  { code: "SG", name: "Singapur", dial: "+65", flag: "🇸🇬", minDigits: 8 },
  { code: "SX", name: "Sint Maarten", dial: "+1721", flag: "🇸🇽", minDigits: 7 },
  { code: "SY", name: "Siria", dial: "+963", flag: "🇸🇾", minDigits: 9 },
  { code: "SO", name: "Somalia", dial: "+252", flag: "🇸🇴", minDigits: 8 },
  { code: "LK", name: "Sri Lanka", dial: "+94", flag: "🇱🇰", minDigits: 9 },
  { code: "SZ", name: "Suazilandia", dial: "+268", flag: "🇸🇿", minDigits: 8 },
  { code: "ZA", name: "Sudáfrica", dial: "+27", flag: "🇿🇦", minDigits: 9 },
  { code: "SD", name: "Sudán", dial: "+249", flag: "🇸🇩", minDigits: 9 },
  { code: "SS", name: "Sudán del Sur", dial: "+211", flag: "🇸🇸", minDigits: 9 },
  { code: "SE", name: "Suecia", dial: "+46", flag: "🇸🇪", minDigits: 9 },
  { code: "CH", name: "Suiza", dial: "+41", flag: "🇨🇭", minDigits: 9 },
  { code: "SR", name: "Surinam", dial: "+597", flag: "🇸🇷", minDigits: 6 },
  { code: "TH", name: "Tailandia", dial: "+66", flag: "🇹🇭", minDigits: 9 },
  { code: "TW", name: "Taiwán", dial: "+886", flag: "🇹🇼", minDigits: 9 },
  { code: "TZ", name: "Tanzania", dial: "+255", flag: "🇹🇿", minDigits: 9 },
  { code: "TJ", name: "Tayikistán", dial: "+992", flag: "🇹🇯", minDigits: 9 },
  { code: "TL", name: "Timor Oriental", dial: "+670", flag: "🇹🇱", minDigits: 7 },
  { code: "TG", name: "Togo", dial: "+228", flag: "🇹🇬", minDigits: 8 },
  { code: "TK", name: "Tokelau", dial: "+690", flag: "🇹🇰", minDigits: 4 },
  { code: "TO", name: "Tonga", dial: "+676", flag: "🇹🇴", minDigits: 5 },
  { code: "TT", name: "Trinidad y Tobago", dial: "+1868", flag: "🇹🇹", minDigits: 7 },
  { code: "TN", name: "Túnez", dial: "+216", flag: "🇹🇳", minDigits: 8 },
  { code: "TM", name: "Turkmenistán", dial: "+993", flag: "🇹🇲", minDigits: 8 },
  { code: "TR", name: "Turquía", dial: "+90", flag: "🇹🇷", minDigits: 10 },
  { code: "TV", name: "Tuvalu", dial: "+688", flag: "🇹🇻", minDigits: 5 },
  { code: "UA", name: "Ucrania", dial: "+380", flag: "🇺🇦", minDigits: 9 },
  { code: "UG", name: "Uganda", dial: "+256", flag: "🇺🇬", minDigits: 9 },
  { code: "UY", name: "Uruguay", dial: "+598", flag: "🇺🇾", minDigits: 8 },
  { code: "UZ", name: "Uzbekistán", dial: "+998", flag: "🇺🇿", minDigits: 9 },
  { code: "VU", name: "Vanuatu", dial: "+678", flag: "🇻🇺", minDigits: 5 },
  { code: "VE", name: "Venezuela", dial: "+58", flag: "🇻🇪", minDigits: 10 },
  { code: "VN", name: "Vietnam", dial: "+84", flag: "🇻🇳", minDigits: 9 },
  { code: "WF", name: "Wallis y Futuna", dial: "+681", flag: "🇼🇫", minDigits: 6 },
  { code: "YE", name: "Yemen", dial: "+967", flag: "🇾🇪", minDigits: 9 },
  { code: "DJ", name: "Yibuti", dial: "+253", flag: "🇩🇯", minDigits: 8 },
  { code: "ZM", name: "Zambia", dial: "+260", flag: "🇿🇲", minDigits: 9 },
  { code: "ZW", name: "Zimbabue", dial: "+263", flag: "🇿🇼", minDigits: 9 },
];

function PhoneStep({ phone, setPhone, onNext }: { phone: string; setPhone: (v: string) => void; onNext: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [country, setCountry] = useState(countries[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const filteredCountries = countrySearch.trim()
    ? countries.filter((c) =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.dial.includes(countrySearch)
      )
    : countries;

  const handleSubmit = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < country.minDigits) {
      setError("Ingresa un número de teléfono válido");
      return;
    }

    setLoading(true);
    setError("");

    const fullPhone = `${country.dial}${digits}`;

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
    });

    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    // Store the full E.164 phone so VerifyStep can use it directly
    setPhone(fullPhone);
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
            placeholder="Número de teléfono"
            className="flex-1 bg-transparent border-none text-muted text-sm py-3.5 px-3 outline-none font-[family-name:var(--font-chakra)] placeholder:text-muted-dark"
          />
        </div>
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#111111] border border-[#333] rounded-xl max-h-[300px] overflow-hidden z-20 shadow-2xl flex flex-col">
            <div className="p-2 border-b border-[#222] sticky top-0 bg-[#111111]">
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Buscar país..."
                autoFocus
                className="w-full bg-[#1a1a1a] border border-[#333] text-white text-sm px-3 py-2 outline-none placeholder:text-muted-dark"
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredCountries.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted">No se encontró el país</div>
              ) : (
                filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => { setCountry(c); setShowDropdown(false); setPhone(""); setCountrySearch(""); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#1a1a1a] cursor-pointer bg-transparent border-none text-left transition-colors"
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-muted text-xs">{c.dial}</span>
                  </button>
                ))
              )}
            </div>
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
      phone,
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
      phone,
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
