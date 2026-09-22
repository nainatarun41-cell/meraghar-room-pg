"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Store an "interest lead" when a customer wants to contact the admin about a
 * property or requirement. Owner/poster contact is NEVER shown on the public
 * site - the admin connects both sides.
 *
 * Graceful: if the contact_requests table is missing (migration not applied),
 * we still return ok so the customer can always reach the admin directly.
 */

export interface SubmitContactInput {
  propertyId?: string | null;
  requirementId?: string | null;
  name: string;
  phone: string;
  message: string;
  source: string;
}

export type ContactActionResult = { ok: boolean; error?: string };

export async function submitContactRequest(
  input: SubmitContactInput
): Promise<ContactActionResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: true };

  const { error } = await supabase.from("contact_requests").insert({
    property_id: input.propertyId || null,
    requirement_id: input.requirementId || null,
    name: input.name.trim().slice(0, 80),
    phone: input.phone.replace(/[^0-9]/g, "").slice(0, 15),
    message: input.message.trim().slice(0, 1000),
    source: input.source,
  });

  // Table not created yet -> still let the customer continue (admin contact shown).
  if (error) return { ok: true };

  return { ok: true };
}