import { createClient } from '@supabase/supabase-js';

/**
 * Initializes and configures the Supabase client.
 * 
 * - Reads environment variables for Supabase URL and Anon Key.
 * - Enables session persistence and automatic token refresh.
 * - Uses localStorage to store authentication tokens.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase client instance
 * 
 * @constant
 * @type {SupabaseClient}
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage, // Ensure localStorage is used for persistence
    storageKey: 'supabase.auth.token'
  }
});
