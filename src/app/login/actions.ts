"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";

export type AuthState = { error?: string; info?: string };

export async function authenticate(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const mode = form.get("mode") === "signup" ? "signup" : "signin";
  const fullName = String(form.get("full_name") || "").trim();
  const next = String(form.get("next") || "/");
  if (!email || password.length < 6) return { error: "Enter an email and a password of 6+ characters." };

  const supabase = await createClient();
  if (mode === "signup") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName || email.split("@")[0] } },
    });
    if (error) return { error: error.message };
    if (!data.session) return { info: "Check your inbox to confirm your email, then sign in." };
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
  }
  redirect(safeNext(next));
}
