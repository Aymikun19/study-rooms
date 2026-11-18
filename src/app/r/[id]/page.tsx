import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/supabase/config";
import { JoinRoom } from "./JoinRoom";
import { Room } from "./Room";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/r/${id}`)}`);
  const { data: room } = await supabase.from("rooms").select("*").eq("id", id).maybeSingle();
  if (!room) notFound();
  const { data: allowed } = await supabase.rpc("can_access", { p_room: id });
  if (!allowed) return <JoinRoom roomId={id} name={room.name} />;
  const { data: messages } = await supabase.from("messages").select("*").eq("room_id", id).order("created_at", { ascending: false }).limit(80);
  const me = { id: user.id, name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Student", v: user.user_metadata?.avatar_v ?? null };
  return <Room room={room} initialMessages={(messages ?? []).reverse()} me={me} link={`${SITE_URL}/r/${id}`} />;
}
