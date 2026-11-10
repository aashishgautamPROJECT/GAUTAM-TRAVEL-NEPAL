import { createClient } from '@supabase/supabase-js';

// Read from env vars or localStorage configuration
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('mj_supabase_url') : null;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('mj_supabase_anon_key') : null;

export const supabaseUrl = envUrl || localUrl || '';
export const supabaseAnonKey = envAnonKey || localKey || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Only initialize the client if real keys exist
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

export function setCustomSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mj_supabase_url', url.trim());
    localStorage.setItem('mj_supabase_anon_key', key.trim());
    window.location.reload();
  }
}

export function clearCustomSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mj_supabase_url');
    localStorage.removeItem('mj_supabase_anon_key');
    window.location.reload();
  }
}

