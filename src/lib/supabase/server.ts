import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicEnv, getServerEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Server client bound to the visiting user's session (cookies).
 * RLS policies apply. Returns null when Supabase is not configured
 * so pages can render a graceful fallback.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient<Database> | null> {
  const env = getPublicEnv();
  if (!env.isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component. Safe to ignore because the
          // session is refreshed in proxy.ts for the next request.
        }
      },
    },
  });
}

/**
 * Server-only admin client that bypasses RLS via the service role key.
 * NEVER import this from a Client Component or expose it to the browser.
 */
export function createSupabaseAdminClient(): SupabaseClient<Database> | null {
  const env = getServerEnv();
  if (!env.isSupabaseConfigured || !env.hasServiceRoleKey) return null;
  return createClient<Database>(env.supabaseUrl, env.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type { SupabaseClient };