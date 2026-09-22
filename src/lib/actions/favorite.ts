"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string };

export async function toggleFavorite(propertyId: string): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) return { ok: false, error: "Please login to save properties." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Database is not configured." };

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: user.id, property_id: propertyId });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/favorites");
  return { ok: true };
}