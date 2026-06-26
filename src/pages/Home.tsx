import NavigationBar from '@/components/NavigationBar';
import { useData } from '@/components/DataProvider';
import HeroSection from '@/sections/HeroSection';
import LiveDealsBanner from '@/sections/LiveDealsBanner';
import TrendingProducts from '@/sections/TrendingProducts';
import HowItWorks from '@/sections/HowItWorks';
import { HeroSkeleton } from '@/components/LoadingSkeleton';
import SEO from '@/components/SEO';

export default function Home() {
  const { loading } = useData();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e14]">
        <NavigationBar />
        <main className="h-screen flex items-center justify-center">
          <HeroSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <SEO
        title="DZTechHunt — Compare PC Prices in Algeria"
        description="Compare prices for graphics cards, CPUs, motherboards, RAM, SSDs, monitors & PC parts from top Algerian stores. Find the best deals on RTX 5060, Ryzen, Intel & more."
        keywords="Algeria PC parts, graphics card price Algeria, RTX 5060 price Algeria, buy PC components Algeria, PC build Algeria, GPU price comparison Algeria, CPU price Algeria, motherboard Algeria, RAM price Algeria, SSD Algeria, monitor Algeria, gaming PC Algeria"
        url="https://dztechhunt-v3.vercel.app/"
      />
      <NavigationBar />
      <main>
        <HeroSection />
        <LiveDealsBanner />
        <TrendingProducts />
        <HowItWorks />
      </main>
    </div>
  );
}
