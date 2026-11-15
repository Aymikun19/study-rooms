import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { createRoom } from "./actions";

export default async function Lobby() {
  const { supabase } = await requireUser();
  const { data: rooms } = await supabase.from("rooms").select("id, name, topic").order("created_at", { ascending: false }).limit(50);
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Study rooms</h1>
      <form action={createRoom} className="card grid gap-2 p-4 sm:grid-cols-[1fr_1fr_auto]">
        <input name="name" required placeholder="Room name, e.g. CSC 301 grind" className="rounded-xl border border-stone-300 px-3 py-2 text-sm" />
        <input name="topic" placeholder="Topic (optional)" className="rounded-xl border border-stone-300 px-3 py-2 text-sm" />
        <button className="btn">Create room</button>
      </form>
      <div className="grid gap-3 sm:grid-cols-2">
        {(rooms ?? []).map((r) => (
          <Link key={r.id} href={`/r/${r.id}`} className="card p-4 hover:border-accent">
            <p className="font-medium">{r.name}</p>
            {r.topic && <p className="text-sm text-stone-500">{r.topic}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
