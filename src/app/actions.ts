"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { clampMinutes } from "@/lib/timer";

export type FormState = { error?: string };

export async function createRoom(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireUser();
  const name = String(form.get("name") || "").trim();
  const visibility = form.get("visibility") === "private" ? "private" : "public";
  const password = String(form.get("password") || "");
  if (!name) return { error: "Give the room a name." };
  if (visibility === "private" && password.length < 4) return { error: "Private rooms need a password of at least 4 characters." };
  const { data, error } = await supabase.rpc("create_room", {
    p_name: name,
    p_topic: String(form.get("topic") || ""),
    p_visibility: visibility,
    p_password: visibility === "private" ? password : null,
    p_focus: clampMinutes("focus", Number(form.get("focus") || 25)),
    p_break: clampMinutes("break", Number(form.get("break") || 5)),
  });
  if (error) return { error: error.message };
  redirect(`/r/${data}`);
}

export async function joinRoom(roomId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("join_room", { p_room: roomId, p_password: String(form.get("password") || "") });
  if (error) return { error: error.message };
  if (data === "locked") return { error: "Too many wrong attempts. Try again in 10 minutes." };
  if (data !== "ok") return { error: "That password is not right." };
  redirect(`/r/${roomId}`);
}
