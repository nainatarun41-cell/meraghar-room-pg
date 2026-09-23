"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { cleanText } from "@/lib/utils";
import type { PropertyStatus } from "@/types";

export type ActionResult = { ok: boolean; error?: string };

async function guardAdmin(): Promise<{ ok: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) return { ok: false, error: "Not logged in." };
  if (user.profile?.role !== "admin") return { ok: false, error: "Admin access required." };
  return { ok: true };
}

export async function adminSetPropertyStatus(id: string, status: string): Promise<ActionResult> {
  const guard = await guardAdmin();
  if (!guard.ok) return guard;

  const allowed = ["pending", "approved", "rejected", "rented", "sold"];
  if (!allowed.includes(status)) return { ok: false, error: "Invalid status." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Database is not configured." };
  const { error } = await supabase.from("properties").update({ status: status as PropertyStatus }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/properties");
  return { ok: true };
}

export async function adminToggleVerified(id: string, isVerified: boolean): Promise<ActionResult> {
  const guard = await guardAdmin();
  if (!guard.ok) return guard;

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Database is not configured." };
  const { error } = await admin.from("properties").update({ is_verified: isVerified }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}

export async function adminToggleFeatured(id: string, isFeatured: boolean): Promise<ActionResult> {
  const guard = await guardAdmin();
  if (!guard.ok) return guard;

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Database is not configured." };
  const featured_until = isFeatured
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    : null;
  const { error } = await admin
    .from("properties")
    .update({ is_featured: isFeatured, featured_until })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminDeleteProperty(id: string): Promise<ActionResult> {
  const guard = await guardAdmin();
  if (!guard.ok) return guard;

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Database is not configured." };
  const { error } = await admin.from("properties").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}

export async function adminUpdateReportStatus(id: string, status: string): Promise<ActionResult> {
  const guard = await guardAdmin();
  if (!guard.ok) return guard;

  if (!["open", "resolved", "dismissed"].includes(status)) {
    return { ok: false, error: "Invalid status." };
  }
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Database is not configured." };
  const { error } = await admin
    .from("reports")
    .update({ status: status as "open" | "resolved" | "dismissed" })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function adminAddLocality(city: string, locality: string): Promise<ActionResult> {
  const guard = await guardAdmin();
  if (!guard.ok) return guard;

  const c = cleanText(city, 40);
  const l = cleanText(locality, 60);
  if (!c || !l) return { ok: false, error: "City and locality are required." };

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Database is not configured." };
  const { error } = await admin.from("localities").upsert({ city: c, locality: l }, { onConflict: "city,locality" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/localities");
  return { ok: true };
}

export async function adminDeleteLocality(id: string): Promise<ActionResult> {
  const guard = await guardAdmin();
  if (!guard.ok) return guard;

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Database is not configured." };
  const { error } = await admin.from("localities").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/localities");
  return { ok: true };
}

export interface LocationInput {
  id?: string;
  name: string;
  slug?: string;
  state: string;
  country?: string;
  type: "city" | "town" | "area";
  parentSlug?: string;
  nearby?: string | string[];
  areas?: string | string[];
  isActive?: boolean;
}

function splitList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40);
}

export async function adminUpsertLocation(input: LocationInput): Promise<ActionResult> {
  const guard = await guardAdmin();
  if (!guard.ok) return guard;

  const name = cleanText(input.name, 60);
  if (!name) return { ok: false, error: "Location name is required." };

  const slug = cleanText(input.slug || slugifyLocation(name), 80).toLowerCase();
  if (!slug) return { ok: false, error: "A slug is required." };

  const payload = {
    name,
    slug,
    state: cleanText(input.state, 60),
    country: cleanText(input.country || "India", 60) || "India",
    type: input.type,
    parent_slug: input.parentSlug ? cleanText(input.parentSlug, 80).toLowerCase() : null,
    nearby: splitList(input.nearby),
    areas: splitList(input.areas),
    is_active: input.isActive !== false,
  };

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Database is not configured." };

  let error: { message: string } | null = null;
  if (input.id) {
    const res = await admin.from("locations").update(payload).eq("id", input.id);
    error = res.error;
  } else {
    const res = await admin.from("locations").upsert(payload, { onConflict: "slug" });
    error = res.error;
  }
  if (error) {
    if (/duplicate/i.test(error.message)) return { ok: false, error: "A location with this slug already exists." };
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/locations");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  return { ok: true };
}

export async function adminDeleteLocation(id: string): Promise<ActionResult> {
  const guard = await guardAdmin();
  if (!guard.ok) return guard;

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Database is not configured." };
  const { error } = await admin.from("locations").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/locations");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  return { ok: true };
}

function slugifyLocation(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['".,!?;:()\[\]{}]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function adminToggleUserRole(userId: string, role: "user" | "admin"): Promise<ActionResult> {
  const guard = await guardAdmin();
  if (!guard.ok) return guard;

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Database is not configured." };
  const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/users");
  return { ok: true };
}