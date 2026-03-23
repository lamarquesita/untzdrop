import TopBanner from "@/components/TopBanner";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrendingEvents from "@/components/TrendingEvents";
import BrowseEvents from "@/components/BrowseEvents";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <TopBanner />
      <Navbar />
      <Hero />
      <TrendingEvents />
      <BrowseEvents />
      <Footer />
    </main>
  );
}
