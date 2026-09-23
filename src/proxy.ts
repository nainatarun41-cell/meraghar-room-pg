import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";

const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password"];

/** Auth-protected routes for logged-in users. */
const PROTECTED_PATHS = [
  "/dashboard",
  "/add-property",
  "/edit-property",
  "/favorites",
  "/post-requirement",
];

/** Admin-only route prefix. */
const ADMIN_PREFIX = "/admin";

export async function proxy(request: NextRequest) {
  const env = getPublicEnv();

  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });
  supabaseResponse.headers.set("x-pathname", pathname);

  if (!env.isSupabaseConfigured) {
    return supabaseResponse;
  }

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        supabaseResponse.headers.set("x-pathname", pathname);
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the auth session on every request - do NOT run on static assets.
const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

// Redirect logged-in users away from auth pages.
  if (user && PUBLIC_PATHS.some((p) => pathname === p)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Require login for protected routes.
  if (!user && (isProtected || pathname.startsWith(ADMIN_PREFIX))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
"/((?!_next/static|[\\w-]+\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|map|webmanifest)|favicon.ico).*)",
  ],
};
