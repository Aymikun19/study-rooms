"use server";

import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/supabase/config";

export type ForgotState = { error?: string; sent?: boolean };

export async function sendReset(_prev: ForgotState, form: FormData): Promise<ForgotState> {
  const email = String(form.get("email") || "").trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter the email you signed up with." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${SITE_URL}/auth/callback?next=/account?reset=1` });
  // Same answer whether or not the account exists, so the form can't be used to discover who has signed up.
  return { sent: true };
}
