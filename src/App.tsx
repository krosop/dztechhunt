import { Routes, Route } from 'react-router-dom';
import DataProvider from '@/components/DataProvider';
import Home from './pages/Home';
import Product from './pages/Product';
import SearchPage from './pages/Search';
import DealsPage from './pages/Deals';
import TrendingPage from './pages/Trending';
import HowItWorksPage from './pages/HowItWorks';

export default function App() {
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/product/:slug" element={<Product />} />
      </Routes>
    </DataProvider>
  );
}
