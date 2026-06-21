import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Lazy Supabase client.
 *
 * We intentionally do NOT throw at module import time, because Next.js
 * statically prerenders pages (like `/_not-found`) during `next build`,
 * and any top-level throw breaks the build in environments where the
 * env vars are injected only at runtime.
 *
 * Instead, we throw the first time someone actually tries to USE the
 * client without env vars configured.
 */
function createMissingEnvProxy(): SupabaseClient {
  const message =
    'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.';

  return new Proxy({} as SupabaseClient, {
    get() {
      throw new Error(message);
    },
    apply() {
      throw new Error(message);
    },
  });
}

export const supabase: SupabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : createMissingEnvProxy();
