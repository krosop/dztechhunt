import NavigationBar from '@/components/NavigationBar';
import { useData } from '@/components/DataProvider';
import HeroSection from '@/sections/HeroSection';
import LiveDealsBanner from '@/sections/LiveDealsBanner';
import TrendingProducts from '@/sections/TrendingProducts';
import HowItWorks from '@/sections/HowItWorks';
import { HeroSkeleton } from '@/components/LoadingSkeleton';

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
