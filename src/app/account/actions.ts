"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";

export type AccountState = { error?: string; ok?: string };

export async function updateName(_prev: AccountState, form: FormData): Promise<AccountState> {
  const { supabase } = await requireUser();
  const name = String(form.get("full_name") || "").trim();
  if (name.length < 2 || name.length > 60) return { error: "Use 2 to 60 characters." };
  const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: "Name updated." };
}

export async function updatePassword(_prev: AccountState, form: FormData): Promise<AccountState> {
  const { supabase } = await requireUser();
  const password = String(form.get("password") || "");
  const confirm = String(form.get("confirm") || "");
  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (password !== confirm) return { error: "The two passwords do not match." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { ok: "Password changed." };
}

export async function signOutEverywhere() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/login");
}
