export interface RetailerPrice {
  retailer: string;
  color: string;
  current: number;
  original: number;
  shipping: string;
  stock: string;
  savings: number;
  url: string;
}

export interface DZProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  description: string;
  specs: string[];
  prices: RetailerPrice[];
}

export interface DZCategory {
  slug: string;
  name: string;
  count: number;
}
