import { Routes, Route } from 'react-router-dom';
import DataProvider from '@/components/DataProvider';
import Home from './pages/Home';
import Product from './pages/Product';
import SearchPage from './pages/Search';

export default function App() {
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:slug" element={<Product />} />
      </Routes>
    </DataProvider>
  );
}
