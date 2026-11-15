import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { Room } from "./Room";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const [{ data: room }, { data: messages }] = await Promise.all([
    supabase.from("rooms").select("*").eq("id", id).maybeSingle(),
    supabase.from("messages").select("*").eq("room_id", id).order("created_at", { ascending: false }).limit(50),
  ]);
  if (!room) notFound();
  const me = { id: user.id, name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Student" };
  return <Room room={room} initialMessages={(messages ?? []).reverse()} me={me} />;
}
