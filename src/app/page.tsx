import { ArrowRight, DoorOpen, Lock, MessagesSquare, Timer } from "lucide-react";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { isRunning } from "@/lib/timer";
import { Landing } from "@/components/kit/Landing";
import { EmptyState } from "@/components/kit/Stat";
import { CreateRoomForm } from "./CreateRoomForm";
import { RoomSearch } from "./RoomSearch";

type R = {
  id: string; name: string; topic: string | null; visibility: "public" | "private"; focus_minutes: number; break_minutes: number;
  timer_started_at: string | null; timer_duration_sec: number; created_at: string; created_by: string;
};

export default async function Lobby({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { supabase, user } = await getUser();
  if (!user) return <Landing />;
  let query = supabase
    .from("rooms")
    .select("id, name, topic, visibility, focus_minutes, break_minutes, timer_started_at, timer_duration_sec, created_at, created_by")
    .order("created_at", { ascending: false })
    .limit(60);
  const term = q.replace(/[%_,()]/g, " ").trim();
  if (term) query = query.or(`name.ilike.%${term}%,topic.ilike.%${term}%`);
  const [{ data }, { data: mine }] = await Promise.all([query, supabase.from("room_members").select("room_id")]);
  const rooms = (data ?? []) as R[];
  const member = new Set((mine ?? []).map((m) => m.room_id));
  const ids = rooms.filter((r) => r.visibility === "public" || member.has(r.id)).map((r) => r.id);
  const { data: counts } = ids.length
    ? await supabase.from("messages").select("room_id").in("room_id", ids).limit(5000)
    : { data: [] as { room_id: string }[] };
  const count = (id: string) => (counts ?? []).filter((m) => m.room_id === id).length;

  return (
    <div className="grid gap-8">
      <div>
        <p className="eyebrow">Lobby</p>
        <h1 className="page-title mt-1">Study rooms</h1>
      </div>
      <CreateRoomForm />
      <RoomSearch q={q} />
      {rooms.length === 0 ? (
        <EmptyState icon={DoorOpen} title={q ? "No rooms match" : "No rooms yet"} text={q ? "Try another search." : "Create the first room above."} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r) => {
            const locked = r.visibility === "private" && !member.has(r.id) && r.created_by !== user.id;
            return (
              <Link key={r.id} href={`/r/${r.id}`} className="card group grid gap-3 p-5 transition hover:-translate-y-0.5 hover:border-accent">
                <div className="flex items-start justify-between gap-2">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
                    {r.visibility === "private" ? <Lock size={18} aria-hidden /> : <DoorOpen size={18} aria-hidden />}
                  </span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {r.visibility === "private" && <span className="badge"><Lock size={11} aria-hidden /> Private</span>}
                    {isRunning(r.timer_started_at, r.timer_duration_sec) && <span className="badge !bg-emerald-100 !text-emerald-800"><Timer size={12} aria-hidden /> Live</span>}
                  </div>
                </div>
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="line-clamp-1 text-sm text-stone-500">{r.topic || "No topic"}</p>
                </div>
                <p className="flex items-center justify-between text-xs text-stone-500">
                  <span className="inline-flex items-center gap-3">
                    <span className="inline-flex items-center gap-1"><Timer size={13} aria-hidden /> {r.focus_minutes}/{r.break_minutes} min</span>
                    {!locked && <span className="inline-flex items-center gap-1"><MessagesSquare size={13} aria-hidden /> {count(r.id)}</span>}
                  </span>
                  <span className="inline-flex items-center gap-1 text-accent opacity-0 transition group-hover:opacity-100">{locked ? "Enter password" : "Join"} <ArrowRight size={13} aria-hidden /></span>
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
