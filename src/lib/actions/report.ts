"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cleanText } from "@/lib/utils";

export type ActionResult = { ok: boolean; error?: string };

export async function createReport(propertyId: string, reason: string, details?: string): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) return { ok: false, error: "Please login to report a listing." };

  const cleanReason = cleanText(reason, 300);
  const cleanDetails = cleanText(details ?? "", 1000);
  if (!cleanReason) return { ok: false, error: "Please provide a reason." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Database is not configured." };

  const { data: property } = await supabase
    .from("properties")
    .select("owner_id")
    .eq("id", propertyId)
    .maybeSingle();

  if (!property) return { ok: false, error: "Property not found." };
  if (property.owner_id === user.id) {
    return { ok: false, error: "You cannot report your own listing." };
  }

  const { error } = await supabase
    .from("reports")
    .insert({
      property_id: propertyId,
      reported_by: user.id,
      reason: cleanReason + (cleanDetails ? `\nDetails: ${cleanDetails}` : ""),
      status: "open",
    });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/reports");
  return { ok: true };
}