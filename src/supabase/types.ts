export interface PriceView {
  product_id: string;
  product_slug: string;
  product_name: string;
  product_brand: string;
  product_image: string | null;
  product_rating: number;
  product_review_count: number;
  product_description: string | null;
  product_specs: unknown;
  category_slug: string;
  category_name_fr: string;
  store_id: string;
  store_name: string;
  store_color: string;
  current_price: number;
  original_price: number;
  savings: number;
  shipping: string | null;
  stock_status: string;
  product_url: string | null;
  price_updated_at: string;
}

export interface CategoryStat {
  category_slug: string;
  category_name_fr: string;
  product_count: number;
}

export interface StoreRow {
  id: string;
  name: string;
  color: string;
  website: string | null;
  created_at: string;
}
