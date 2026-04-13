"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase, getAuthHeaders } from "@/lib/supabase";
import { Order, Sale } from "@/lib/mockDashboard";
import { ShoppingBag, TrendingUp, HandCoins, Tag, Wallet } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrdersTab from "@/components/dashboard/OrdersTab";
import OrderDetailPanel from "@/components/dashboard/OrderDetailPanel";
import SalesTab from "@/components/dashboard/SalesTab";
import SaleDetailPanel from "@/components/dashboard/SaleDetailPanel";
import TicketModal from "@/components/dashboard/TicketModal";
import WalletTab from "@/components/dashboard/WalletTab";

const tabs = ["Ordenes", "Ventas", "Ofertas", "Listings", "Wallet"] as const;
type Tab = (typeof tabs)[number];

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="py-24 flex flex-col items-center gap-4">
      <div className="w-20 h-20 rounded-2xl bg-[#181818] border border-[#2A2A2A] flex items-center justify-center">
        {icon}
      </div>
      <div className="text-lg font-semibold text-[#555]">{title}</div>
      <div className="text-sm text-[#444] max-w-[300px] text-center">{description}</div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 btn-tag bg-primary text-white px-6 py-2.5 text-sm font-semibold cursor-pointer border-none hover:brightness-110 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam ? (tabs.find(t => t.toLowerCase() === tabParam.toLowerCase()) || "Ordenes") : "Ordenes";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setDataLoading(true);
    try {
      const authHeaders = await getAuthHeaders();
      const [ordersRes, salesRes, profileRes] = await Promise.all([
        fetch("/api/orders", { headers: authHeaders }),
        fetch("/api/sales", { headers: authHeaders }),
        fetch("/api/profile", { headers: authHeaders }),
      ]);

      if (ordersRes.ok) {
        const { orders: fetchedOrders } = await ordersRes.json();
        setOrders(fetchedOrders ?? []);
      }
      if (salesRes.ok) {
        const { sales: fetchedSales } = await salesRes.json();
        setSales(fetchedSales ?? []);
      }
      if (profileRes.ok) {
        const { profile: p } = await profileRes.json();
        if (p) setProfile(p);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setDataLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/");
      } else {
        setUser(data.user);
        loadDashboardData();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, loadDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white">
        <Navbar />
        <div className="px-4 md:px-8 lg:px-16 py-12">
          <div className="h-10 w-64 bg-[#1a1a1a] animate-pulse rounded" />
          <div className="h-6 w-48 bg-[#1a1a1a] animate-pulse rounded mt-4" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = profile?.full_name?.split(" ")[0] || user.user_metadata?.name?.split(" ")[0] || "Usuario";

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Navbar />

      <div className="flex-1 px-4 md:px-8 lg:px-16 py-10 max-w-[1440px] mx-auto w-full">
        {/* Mobile: page-style header */}
        <div className="md:hidden">
          <h1 className="text-2xl font-extrabold">{activeTab}</h1>
        </div>

        {/* Desktop: full dashboard header + tabs */}
        <div className="hidden md:block">
          <h1 className="text-3xl font-extrabold">Dashboard de {displayName}</h1>
          <div className="flex mt-8 border-b border-[#222]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-5 text-sm font-semibold text-center transition-colors cursor-pointer bg-transparent border-none whitespace-nowrap ${
                  activeTab === tab
                    ? "text-white border-b-2 border-primary"
                    : "text-[#555] hover:text-[#888]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {dataLoading ? (
            <div className="py-20 text-center">
              <div className="text-[#555] text-lg font-semibold">Cargando...</div>
            </div>
          ) : activeTab === "Ordenes" ? (
            orders.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="w-10 h-10 text-[#333]" />}
                title="No tienes ordenes"
                description="Cuando compres boletos, apareceran aqui"
                actionLabel="Explorar Eventos"
                onAction={() => router.push("/")}
              />
            ) : (
              <OrdersTab orders={orders} onViewDetails={setSelectedOrder} onViewTicket={setTicketOrder} />
            )
          ) : activeTab === "Ventas" ? (
            sales.length === 0 ? (
              <EmptyState
                icon={<TrendingUp className="w-10 h-10 text-[#333]" />}
                title="No tienes ventas"
                description="Cuando vendas boletos, apareceran aqui"
                actionLabel="Vender Boletos"
                onAction={() => router.push("/")}
              />
            ) : (
              <SalesTab sales={sales} onViewDetails={setSelectedSale} />
            )
          ) : activeTab === "Ofertas" ? (
            <EmptyState
              icon={<HandCoins className="w-10 h-10 text-[#333]" />}
              title="No tienes ofertas"
              description="Cuando hagas ofertas por boletos, apareceran aqui"
              actionLabel="Explorar Eventos"
              onAction={() => router.push("/")}
            />
          ) : activeTab === "Listings" ? (
            <EmptyState
              icon={<Tag className="w-10 h-10 text-[#333]" />}
              title="No tienes listings"
              description="Cuando publiques boletos a la venta, apareceran aqui"
              actionLabel="Publicar Boleto"
              onAction={() => router.push("/")}
            />
          ) : (
            <WalletTab />
          )}
        </div>
      </div>



      {selectedOrder && (
        <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} onViewTicket={() => { setTicketOrder(selectedOrder); setSelectedOrder(null); }} />
      )}

      {selectedSale && (
        <SaleDetailPanel sale={selectedSale} onClose={() => setSelectedSale(null)} />
      )}

      {ticketOrder && (
        <TicketModal order={ticketOrder} onClose={() => setTicketOrder(null)} />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DashboardContent />
    </Suspense>
  );
}
