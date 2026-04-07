"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

const legalPages = [
  { href: "/user-agreement", label: "Acuerdo de Usuario" },
  { href: "/terms", label: "Términos para Vendedores" },
  { href: "/privacy", label: "Política de Privacidad" },
  { href: "/cookies", label: "Política de Cookies" },
];

export default function LegalLayout({
  title,
  subtitle,
  date,
  children,
}: {
  title: string;
  subtitle: string;
  date: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <article className="border-[#1a1a1a] mx-auto w-full max-w-[72.625rem] border-x min-h-screen">
        <div className="px-5 sm:px-8 md:px-12 pt-10 pb-16 md:pt-16">

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#888] hover:text-primary transition-colors mb-8 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Inicio
          </Link>

          {/* Header */}
          <header className="mb-8 pb-8 border-b border-[#1a1a1a]">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 font-[family-name:var(--font-chakra)]">
              {title}
            </h1>
            <p className="text-[#888] text-base md:text-lg mb-6">
              {subtitle}
            </p>
            <div className="text-sm text-[#666]">
              Última actualización: {date}
            </div>
          </header>

          {/* Legal nav */}
          <nav className="flex flex-wrap gap-2 mb-10">
            {legalPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  pathname === page.href
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-[#1a1a1a] text-[#666] hover:text-white hover:border-[#333]"
                }`}
              >
                {page.label}
              </Link>
            ))}
          </nav>

          {/* Content */}
          <div className="prose-dark max-w-none font-[family-name:var(--font-chakra)] space-y-6 text-sm text-[#ccc] leading-relaxed
            [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:pt-6 [&_h2]:pb-2 [&_h2]:tracking-tight [&_h2]:font-[family-name:var(--font-chakra)] [&_h2]:border-b [&_h2]:border-[#1a1a1a] [&_h2]:mb-4
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:font-[family-name:var(--font-chakra)]
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5
            [&_a]:text-primary [&_a]:hover:underline
            [&_strong]:text-white
            [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse
            [&_th]:text-left [&_th]:py-2 [&_th]:pr-4 [&_th]:text-white [&_th]:font-semibold [&_th]:border-b [&_th]:border-[#333]
            [&_td]:py-2 [&_td]:pr-4 [&_td]:border-b [&_td]:border-[#1a1a1a]
            [&_p.legal-caps]:uppercase [&_p.legal-caps]:font-semibold [&_p.legal-caps]:text-[#aaa]
          ">
            {children}
          </div>

        </div>
      </article>
      <Footer />
    </main>
  );
}
