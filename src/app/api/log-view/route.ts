import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { clientIp, rateLimited } from "@/lib/rate-limit";

/**
 * POST /api/log-view
 * Logs one property detail view. The client only sends the property id;
 * the server decides device type (user-agent), the signed-in user id and a
 * salted visitor hash (no raw IP is ever stored). Ops are fire-and-forget
 * so page rendering is never blocked.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VISITOR_COOKIE = "mg_visitor";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const logViewSchema = z.object({
  propertyId: z.string(),
});

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  if (rateLimited(`log-view:${ip}`, 120, 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
  }

  let propertyId: string;
  try {
    const body = await req.json();
    propertyId = logViewSchema.parse(body).propertyId;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  const cookieStore = req.cookies;
  let visitorId = cookieStore.get(VISITOR_COOKIE)?.value;
  const response = NextResponse.json({ ok: true });

  if (!visitorId) {
    visitorId = randomUUID();
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
  }

  let viewerId: string | null = null;
  try {
    viewerId = (await getAuthUser())?.id ?? null;
  } catch {
    // session helpers can fail on odd requests - still record the view
  }

  const salt = process.env.VISITOR_HASH_SALT || "meraghar-visitor-salt";
  const visitorHash = createHash("sha256")
    .update(`${visitorId}|${salt}`)
    .digest("hex");

  const deviceType = detectDeviceType(req.headers.get("user-agent") ?? "");

  try {
    const admin = createSupabaseAdminClient();
    if (admin) {
      await admin.rpc("record_property_view", {
        p_property_id: propertyId,
        p_viewer_id: viewerId,
        p_visitor_hash: visitorHash,
        p_device_type: deviceType,
      });
    }
  } catch {
    // view logging must never fail a request
  }

  return response;
}

function detectDeviceType(ua: string): "mobile" | "tablet" | "desktop" {
  if (!ua) return "desktop";
  if (/ipad|tablet|playbook|silk|kindle/i.test(ua)) return "tablet";
  if (/mobi|iphone|android|ipod|opera mini|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}