import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '') as string;
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '') as string;

// Lazy singleton - never throws during import
let _client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabase() {
  if (!_client && SUPABASE_URL && SUPABASE_ANON_KEY) {
    _client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }
  return _client;
}

// Safe API caller - returns fallback data if no client
export async function safeQuery<T>(queryFn: () => Promise<{ data: T | null; error: any }>): Promise<T> {
  try {
    const client = getSupabase();
    if (!client) {
      console.warn('[Supabase] No credentials configured');
      return [] as unknown as T;
    }
    const result = await queryFn();
    if (result.error) throw result.error;
    return (result.data || []) as unknown as T;
  } catch (err) {
    console.warn('[Supabase] Query failed:', err);
    return [] as unknown as T;
  }
}
