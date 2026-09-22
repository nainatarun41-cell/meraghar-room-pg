/**
 * Promote an existing user to admin.
 *
 * Usage:
 *   node --env-file=.env.local scripts/create-admin.mjs user@example.com
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing env vars. Run with: node --env-file=.env.local scripts/create-admin.mjs <email>");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/create-admin.mjs <email>");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function main() {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const user = (data?.users ?? []).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error(`No user found with email ${email}. Create the account first (sign up), then run this script.`);
    process.exit(1);
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", user.id);

  if (updateError) {
    console.error("Could not update profile:", updateError.message);
    process.exit(1);
  }
  console.log(`User ${email} is now an admin.`);
}

main().catch(console.error);