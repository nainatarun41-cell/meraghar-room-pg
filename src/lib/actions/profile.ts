"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cleanText } from "@/lib/utils";
import { validateProfileForm } from "@/lib/validation";

export type ActionResult = { ok: boolean; error?: string };

export async function updateProfile(input: {
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
}): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) return { ok: false, error: "Not logged in." };

  const name = cleanText(input.name, 60);
  const phone = cleanText(input.phone, 15);
  const avatarUrl = input.avatarUrl ? cleanText(input.avatarUrl, 500) : user.profile?.avatar_url ?? null;

  const errors = validateProfileForm({
    name,
    phone,
    email: input.email ?? user.email,
  });
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: Object.values(errors)[0] };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Database is not configured." };

  const { error } = await supabase
    .from("profiles")
    .update({ name, phone, avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/");
  return { ok: true };
}

export async function updateAvatarFile(): Promise<ActionResult> {
  return { ok: false, error: "Upload avatar through the profile page image picker." };
}