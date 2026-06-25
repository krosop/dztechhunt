export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          name: string;
          color: string;
          website: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          website?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          website?: string | null;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          name_fr: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          name_fr: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          name_fr?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          brand: string;
          category_slug: string;
          image: string | null;
          rating: number;
          review_count: number;
          description: string | null;
          specs: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          brand: string;
          category_slug: string;
          image?: string | null;
          rating?: number;
          review_count?: number;
          description?: string | null;
          specs?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          brand?: string;
          category_slug?: string;
          image?: string | null;
          rating?: number;
          review_count?: number;
          description?: string | null;
          specs?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      prices: {
        Row: {
          id: string;
          product_id: string;
          store_id: string;
          current_price: number;
          original_price: number;
          shipping: string | null;
          stock_status: string;
          savings: number;
          product_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          store_id: string;
          current_price: number;
          original_price: number;
          shipping?: string | null;
          stock_status?: string;
          savings?: number;
          product_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          store_id?: string;
          current_price?: number;
          original_price?: number;
          shipping?: string | null;
          stock_status?: string;
          savings?: number;
          product_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      price_history: {
        Row: {
          id: string;
          product_id: string;
          store_id: string;
          price: number;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          store_id: string;
          price: number;
          recorded_at?: string;
        };
      };
    };
    Views: {
      product_prices: {
        Row: {
          product_id: string;
          product_slug: string;
          product_name: string;
          product_brand: string;
          product_image: string | null;
          product_rating: number;
          product_review_count: number;
          product_description: string | null;
          product_specs: Json;
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
        };
      };
      category_stats: {
        Row: {
          category_slug: string;
          category_name_fr: string;
          product_count: number;
        };
      };
    };
    Functions: {};
  };
}
