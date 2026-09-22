"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cleanText } from "@/lib/utils";
import { validateRequirementForm } from "@/lib/validation";

export type ActionResult = { ok: boolean; error?: string; requirementId?: string };

export async function createRequirement(input: {
  title?: string;
  city: string;
  locality: string;
  property_type: string;
  purpose: string;
  budget_min?: string;
  budget_max?: string;
  bhk?: string;
  description: string;
  contact_preference: string;
}): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) return { ok: false, error: "Please login to post a requirement." };

  const errors = validateRequirementForm(input as Record<string, string>);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: Object.values(errors)[0] };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Database is not configured." };

  const title = cleanText(input.title ?? "", 80) || buildTitle(input);

  const { data, error } = await supabase
    .from("requirements")
    .insert({
      user_id: user.id,
      title,
      city: cleanText(input.city, 40),
      locality: cleanText(input.locality, 60),
      property_type: cleanText(input.property_type, 40),
      purpose: input.purpose as "rent" | "sale",
      budget_min: input.budget_min ? Number(input.budget_min) : null,
      budget_max: input.budget_max ? Number(input.budget_max) : null,
      bhk: cleanText(input.bhk ?? "", 10),
      description: cleanText(input.description, 2000),
      contact_preference: (["call", "whatsapp", "both"].includes(input.contact_preference)
        ? input.contact_preference
        : "both") as "call" | "whatsapp" | "both",
      status: "open",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/requirements");
  revalidatePath("/admin");
  revalidatePath("/admin/requirements");
  return { ok: true, requirementId: data.id };
}

function buildTitle(input: {
  city: string;
  locality?: string;
  property_type?: string;
  purpose?: string;
}): string {
  const intent = input.purpose === "sale" ? "Looking to buy" : "Looking for";
  const what = input.property_type ? input.property_type : "a property";
  const where = input.locality ? ` in ${input.locality}, ${input.city}` : ` in ${input.city}`;
  return `${intent} ${what}${where}`;
}

export async function closeRequirement(id: string): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) return { ok: false, error: "Not logged in." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Database is not configured." };

  const { error } = await supabase
    .from("requirements")
    .update({ status: "closed" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/requirements");
  return { ok: true };
}