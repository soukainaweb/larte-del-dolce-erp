import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const isConfigured = Boolean(supabaseUrl && supabasePublishableKey);

if (!isConfigured) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. ' +
      'Add them to your .env file. Supabase features will be unavailable until configured.'
  );
}

/**
 * Shared Supabase browser client (publishable/anon key only — never service_role).
 * Returns null when environment variables are missing.
 */
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Verify Supabase connectivity against the `properties` table.
 * Safe to call during app startup or from the browser console.
 *
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function testSupabaseConnection() {
  if (!supabase) {
    const message =
      'Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env';
    console.error('[Supabase]', message);
    return { ok: false, error: message };
  }

  try {
    const { error } = await supabase.from('properties').select('id').limit(1);

    if (error) {
      console.error('[Supabase] Connection test failed:', error.message, error);
      return { ok: false, error: error.message };
    }

    console.info('[Supabase] Connection successful.');
    return { ok: true };
  } catch (err) {
    const message = err?.message || 'Unknown Supabase connection error';
    console.error('[Supabase] Connection test failed:', message, err);
    return { ok: false, error: message };
  }
}

export default supabase;
