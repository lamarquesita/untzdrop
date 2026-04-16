import type { Metadata } from "next";
import { Inter, Chakra_Petch } from "next/font/google";
import "./globals.css";
import StripeProvider from "@/components/StripeProvider";
import GlobalEffects from "@/components/effects/GlobalEffects";
import CookieBanner from "@/components/CookieBanner";
import ScrollToTop from "@/components/ScrollToTop";
import { SavedEventsProvider } from "@/hooks/useSavedEvents";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-chakra",
});

export const metadata: Metadata = {
  title: "UntzDrop - Compra o Vende Boletos de Raves & EDM",
  description: "La plataforma donde la escena se conecta. Encuentra tickets o revende los tuyos de forma segura, rápida y entre personas reales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${chakraPetch.variable} font-[family-name:var(--font-chakra)] antialiased`}>
        <StripeProvider>
          <SavedEventsProvider>
            <GlobalEffects />
            <ScrollToTop />
            <div className="max-w-[1440px] mx-auto relative">
              {/* Side grid lines */}
              <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
                {/* Left lines */}
                <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-[#1a1a1a]" />
                <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-[#111]" />
                {/* Right lines */}
                <div className="absolute right-4 top-0 bottom-0 w-[1px] bg-[#1a1a1a]" />
                <div className="absolute right-8 top-0 bottom-0 w-[1px] bg-[#111]" />
              </div>
              <div className="relative z-10">
                {children}
              </div>
            </div>
            <CookieBanner />
          </SavedEventsProvider>
        </StripeProvider>
      </body>
    </html>
  );
}
