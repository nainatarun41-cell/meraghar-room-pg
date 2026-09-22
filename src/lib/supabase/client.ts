"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Browser Supabase client with real-time auth. Only valid on the client.
 * Returns null when Supabase is not configured.
 */
export function getSupabaseBrowserClient() {
  const env = getPublicEnv();
  if (!env.isSupabaseConfigured) return null;

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
  }
  return browserClient;
}