import { ArrowRight, DoorOpen, MessagesSquare, Plus, Timer } from "lucide-react";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { Landing } from "@/components/kit/Landing";
import { EmptyState } from "@/components/kit/Stat";
import { createRoom } from "./actions";
import { RoomSearch } from "./RoomSearch";
import { isRunning } from "@/lib/timer";

type R = { id: string; name: string; topic: string | null; timer_started_at: string | null; timer_duration_sec: number; created_at: string; messages: { count: number }[] };

export default async function Lobby({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { supabase, user } = await getUser();
  if (!user) return <Landing />;
  let query = supabase.from("rooms").select("id, name, topic, timer_started_at, timer_duration_sec, created_at, messages(count)").order("created_at", { ascending: false }).limit(60);
  const term = q.replace(/[%_,()]/g, " ").trim();
  if (term) query = query.or(`name.ilike.%${term}%,topic.ilike.%${term}%`);
  const { data } = await query;
  const rooms = (data ?? []) as unknown as R[];
  const live = (r: R) => isRunning(r.timer_started_at, r.timer_duration_sec);

  return (
    <div className="grid gap-8">
      <div>
        <p className="eyebrow">Lobby</p>
        <h1 className="page-title mt-1">Study rooms</h1>
      </div>
      <form action={createRoom} className="card grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto]">
        <label className="field"><span>Room name</span><input name="name" required placeholder="CSC 301 grind" /></label>
        <label className="field"><span>Topic (optional)</span><input name="topic" placeholder="Data structures revision" /></label>
        <button className="btn self-end"><Plus size={16} aria-hidden /> Create room</button>
      </form>
      <RoomSearch q={q} />
      {rooms.length === 0 ? (
        <EmptyState icon={DoorOpen} title={q ? "No rooms match" : "No rooms yet"} text={q ? "Try another search." : "Create the first room above."} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r) => (
            <Link key={r.id} href={`/r/${r.id}`} className="card group grid gap-3 p-5 transition hover:-translate-y-0.5 hover:border-accent">
              <div className="flex items-start justify-between gap-2">
                <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent"><DoorOpen size={18} aria-hidden /></span>
                {live(r) && <span className="badge !bg-emerald-100 !text-emerald-800"><Timer size={12} aria-hidden /> Timer running</span>}
              </div>
              <div>
                <p className="font-semibold">{r.name}</p>
                <p className="line-clamp-1 text-sm text-stone-500">{r.topic || "No topic"}</p>
              </div>
              <p className="flex items-center justify-between text-xs text-stone-500">
                <span className="inline-flex items-center gap-1"><MessagesSquare size={13} aria-hidden /> {r.messages[0]?.count ?? 0} messages</span>
                <span className="inline-flex items-center gap-1 text-accent opacity-0 transition group-hover:opacity-100">Join <ArrowRight size={13} aria-hidden /></span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
