import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('❌ VITE_SUPABASE_URL no está definida');
}

if (!supabaseAnonKey) {
  throw new Error('❌ VITE_SUPABASE_ANON_KEY no está definida');
}

// Crear una única instancia de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'quicknote-auth-storage', // Clave única para evitar conflictos
    storage: localStorage, // Usar localStorage explícitamente
  },
});

export type SupabaseClient = typeof supabase;