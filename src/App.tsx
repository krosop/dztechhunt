import { Routes, Route } from 'react-router-dom';
import DataProvider from '@/components/DataProvider';
import Home from './pages/Home';
import Product from './pages/Product';

export default function App() {
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:slug" element={<Product />} />
      </Routes>
    </DataProvider>
  );
}
