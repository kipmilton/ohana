import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from env or local storage
export const getStoredSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('ohana_supabase_url') : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('ohana_supabase_anon_key') : '';

  const url = storedUrl || envUrl;
  const anonKey = storedKey || envKey;

  return {
    url,
    anonKey,
    isValid: Boolean(url && anonKey && url !== 'https://your-project.supabase.co' && !url.includes('placeholder'))
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ohana_supabase_url', url.trim());
    localStorage.setItem('ohana_supabase_anon_key', anonKey.trim());
    cachedClient = null; // Reset cache so new client is instantiated
  }
};

let cachedClient: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const { url, anonKey, isValid } = getStoredSupabaseConfig();
  if (!isValid) return null;

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return cachedClient;
};

export const isSupabaseConfigured = Boolean(getStoredSupabaseConfig().isValid);
export const supabase = getSupabase();
