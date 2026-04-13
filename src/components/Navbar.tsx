"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase, Event, formatEventDate } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, User as UserIcon, CalendarDays, ShoppingBag, TrendingUp, HandCoins, Tag, Info, HelpCircle, Users } from "lucide-react";
import { springs } from "@/lib/animations";
import { useBassDrop } from "@/hooks/useBassDrop";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const bassDrop = useBassDrop();
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Event[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const loadProfileName = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();
    if (data?.full_name) setProfileName(data.full_name);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadProfileName(data.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfileName(session.user.id);
      else setProfileName(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeout = setTimeout(async () => {
      const { data, error } = await supabase
        .from("events_with_pricing")
        .select("*")
        .or(`name.ilike.%${query}%,venue.ilike.%${query}%`)
        .order("date", { ascending: true })
        .limit(6);

      if (!error && data) {
        setResults(data);
        setShowResults(true);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Listen for open-auth-modal events from other components
  useEffect(() => {
    const handler = () => setShowAuth(true);
    document.addEventListener("open-auth-modal", handler);
    return () => document.removeEventListener("open-auth-modal", handler);
  }, []);

  const handleAuthClose = () => {
    setShowAuth(false);
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await supabase.auth.signOut();
  };

  const navLinks = [
    { href: "/", label: "Eventos", active: pathname === "/" || pathname.startsWith("/events") },
    { href: "/about", label: "Nosotros", active: pathname === "/about" },
    { href: "/help", label: "Ayuda", active: pathname === "/help" },
  ];

  const mobileNavLinks = [
    { href: "/profile", label: "Perfil", active: pathname === "/profile", icon: UserIcon },
    { href: "/", label: "Eventos", active: pathname === "/" || pathname.startsWith("/events"), icon: CalendarDays },
    { href: "/dashboard?tab=Ordenes", label: "Ordenes", active: false, icon: ShoppingBag },
    { href: "/dashboard?tab=Ventas", label: "Ventas", active: false, icon: TrendingUp },
    { href: "/dashboard?tab=Ofertas", label: "Ofertas", active: false, icon: HandCoins },
    { href: "/dashboard?tab=Listings", label: "Listings", active: false, icon: Tag },
    { href: "/about", label: "Nosotros", active: pathname === "/about", icon: Info },
    { href: "/help", label: "Ayuda", active: pathname === "/help", icon: HelpCircle },
  ];

  return (
    <>
      {/* Spacer for fixed navbar */}
      <div className="h-[77px]" />
      <motion.nav
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full z-50 flex items-center gap-3 md:gap-6 px-4 md:px-8 lg:px-16 h-[77px] bg-background/95 backdrop-blur-sm max-w-[1440px]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.smooth, delay: 0.05 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <Link href="/" className="flex items-center font-extrabold text-xl text-white" onClick={(e) => { e.preventDefault(); bassDrop.onClick(); }}>
            <motion.img
              src="/logo.png"
              alt="UntzDrop"
              className="h-7 w-7 md:h-8 md:w-8 mr-1"
              animate={bassDrop.isDropping ? { rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 0.9, 1.1, 1] } : {}}
              transition={{ duration: 0.6 }}
            />
            <span>UntzDrop</span>
          </Link>
          {/* Desktop nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hidden md:inline text-sm font-medium transition-colors ${link.active ? "text-white" : "text-text-faint hover:text-white"}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Search — hidden on mobile, shown in mobile menu */}
        <div ref={searchRef} className="flex-1 relative hidden md:block">
          <div className="bg-surface border border-border rounded-none flex items-center gap-2 px-4 h-[45px]">
            <Search className="w-5 h-5 text-muted shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              placeholder="Busca por evento, artista o lugar"
              className="bg-transparent border-none text-white text-[11px] outline-none w-full placeholder:text-muted"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setResults([]); setShowResults(false); }}
                className="text-muted text-sm cursor-pointer bg-transparent border-none hover:text-white"
              >
                &#10005;
              </button>
            )}
          </div>

          <AnimatePresence>
            {showResults && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-2 bg-[#181818] border border-border rounded-none overflow-hidden z-50 shadow-2xl"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={springs.snappy}
              >
                {results.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted">
                    No se encontraron resultados
                  </div>
                ) : (
                  results.map((event, i) => (
                    <motion.div
                      key={event.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] cursor-pointer transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springs.snappy, delay: i * 0.04 }}
                      onClick={() => { setShowResults(false); setQuery(""); router.push(`/events/${event.id}`); }}
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] shrink-0 overflow-hidden">
                        {event.image_url ? (
                          <img src={event.image_url} alt={event.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#2a2040] to-[#2A2A2A]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{event.name}</div>
                        <div className="text-xs text-text-dim truncate">
                          {formatEventDate(event.date)} &middot; {event.venue}
                        </div>
                      </div>
                      {event.min_price != null && (
                        <div className="text-xs font-semibold text-primary shrink-0">
                          S/{Math.round(event.min_price)}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop auth/profile */}
        <div className="hidden md:block">
          {user ? (
            <div ref={profileRef} className="relative shrink-0">
              <motion.button
                onClick={() => setShowProfileMenu((v) => !v)}
                className="w-9 h-9 bg-gradient-to-br from-primary to-[#D946EF] flex items-center justify-center text-white text-sm font-bold cursor-pointer border-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                transition={springs.snappy}
              >
                {profileName ? profileName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
              </motion.button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    className="absolute top-full right-0 mt-2 w-48 bg-[#181818] border border-border rounded-none z-50 shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={springs.snappy}
                  >
                    <button
                      onClick={() => { setShowProfileMenu(false); router.push("/profile"); }}
                      className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#2A2A2A] cursor-pointer bg-transparent border-none transition-colors"
                    >
                      Perfil
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); router.push("/dashboard"); }}
                      className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#2A2A2A] cursor-pointer bg-transparent border-none transition-colors"
                    >
                      Dashboard
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              onClick={() => setShowAuth(true)}
              className="btn-tag bg-primary text-white px-5 py-2 text-sm font-semibold cursor-pointer shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springs.snappy}
            >
              Iniciar Sesión
            </motion.button>
          )}
        </div>

        {/* Mobile hamburger button — left side next to logo */}
        <motion.button
          className="md:hidden -order-1 mr-0 w-8 h-8 flex items-center justify-center text-white bg-transparent border-none cursor-pointer"
          onClick={() => setMobileMenuOpen((v) => !v)}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
            transition={{ duration: 0.1 }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.div>
        </motion.button>
      </motion.nav>

      {/* Mobile dropdown — small popout under navbar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Transparent backdrop to close */}
            <motion.div
              className="fixed inset-0 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            {/* Dropdown */}
            <motion.div
              className="absolute left-4 top-[65px] z-50 md:hidden bg-[#111] border border-[#222] rounded-lg shadow-2xl min-w-[200px]"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <div className="py-2">
                {user ? (
                  <>
                    {mobileNavLinks.map((link) => (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                      >
                        <link.icon className="w-4 h-4 text-[#888]" />
                        {link.label}
                      </Link>
                    ))}
                    <div className="border-t border-[#222] my-1" />
                    <Link href="/profile#referral" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                      <Users className="w-4 h-4" />
                      Invita Amigos →
                    </Link>
                  </>
                ) : (
                  <>
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-5 py-2.5 text-sm font-semibold transition-colors ${
                          link.active ? "text-primary" : "text-white hover:text-primary"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="border-t border-[#222] my-1" />
                    <button onClick={() => { setMobileMenuOpen(false); setShowAuth(true); }} className="block w-full text-left px-5 py-2.5 text-sm font-semibold text-primary bg-transparent border-none cursor-pointer">
                      Iniciar Sesión
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bass drop flash overlay */}
      <AnimatePresence>
        {bassDrop.isDropping && (
          <motion.div
            className="fixed inset-0 z-[10000] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(236,130,23,0.4), transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Easter egg toast */}
      <AnimatePresence>
        {bassDrop.showToast && (
          <motion.div
            className="fixed bottom-8 left-1/2 z-[10001] btn-tag bg-surface border border-primary/30 px-6 py-4 shadow-2xl"
            initial={{ opacity: 0, y: 40, x: "-50%", scale: 0.9, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, x: "-50%", scale: 0.95, filter: "blur(4px)" }}
            transition={springs.bouncy}
            onClick={bassDrop.dismissToast}
          >
            <div className="text-sm font-bold text-primary mb-1">THE DROP</div>
            <div className="text-xs text-muted">You found the hidden bass. You&apos;re one of us now.</div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAuth && <AuthModal onClose={handleAuthClose} />}
    </>
  );
}
