import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * OAuth / magic-link / reset-password callback.
 * Exchanges the auth code for a session cookie, then redirects.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next ?? "/dashboard"}`);
        }
        if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next ?? "/dashboard"}`);
        }
        return NextResponse.redirect(`${origin}${next ?? "/dashboard"}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=invalid-link`);
}