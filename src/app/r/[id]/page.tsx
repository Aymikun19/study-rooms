import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/supabase/config";
import { Room } from "./Room";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/r/${id}`)}`);
  const [{ data: room }, { data: messages }] = await Promise.all([
    supabase.from("rooms").select("*").eq("id", id).maybeSingle(),
    supabase.from("messages").select("*").eq("room_id", id).order("created_at", { ascending: false }).limit(80),
  ]);
  if (!room) notFound();
  const me = { id: user.id, name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Student" };
  return <Room room={room} initialMessages={(messages ?? []).reverse()} me={me} link={`${SITE_URL}/r/${id}`} />;
}
