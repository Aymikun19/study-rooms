"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";

export async function createRoom(form: FormData) {
  const { supabase } = await requireUser();
  const name = String(form.get("name") || "").trim();
  const topic = String(form.get("topic") || "").trim() || null;
  if (!name) return;
  const { data, error } = await supabase.from("rooms").insert({ name, topic }).select("id").single();
  if (error) throw error;
  redirect(`/r/${data.id}`);
}
