"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mmss, PRESETS, remaining, type TimerState } from "@/lib/timer";

type Msg = { id: number; user_id: string; author: string; body: string; created_at: string };
type RoomRow = { id: string; name: string; topic: string | null; timer_mode: "focus" | "break"; timer_duration_sec: number; timer_started_at: string | null };
type Me = { id: string; name: string };

export function Room({ room, initialMessages, me }: { room: RoomRow; initialMessages: Msg[]; me: Me }) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState(initialMessages);
  const [online, setOnline] = useState<Me[]>([]);
  const [timer, setTimer] = useState<TimerState>({ mode: room.timer_mode, durationSec: room.timer_duration_sec, startedAt: room.timer_started_at });
  const [, tick] = useState(0);
  const [text, setText] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  // Realtime: new messages, timer changes and presence on one channel.
  useEffect(() => {
    const channel = supabase
      .channel(`room:${room.id}`, { config: { presence: { key: me.id } } })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${room.id}` }, (p) =>
        setMessages((m) => (m.some((x) => x.id === (p.new as Msg).id) ? m : [...m, p.new as Msg])),
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${room.id}` }, (p) => {
        const r = p.new as RoomRow;
        setTimer({ mode: r.timer_mode, durationSec: r.timer_duration_sec, startedAt: r.timer_started_at });
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<Me>();
        setOnline(Object.values(state).map((v) => v[0]));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel.track(me);
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, room.id, me]);

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    await supabase.from("messages").insert({ room_id: room.id, author: me.name, body });
  }

  async function setTimerRemote(mode: "focus" | "break", start: boolean) {
    await supabase
      .from("rooms")
      .update({ timer_mode: mode, timer_duration_sec: PRESETS[mode], timer_started_at: start ? new Date().toISOString() : null })
      .eq("id", room.id);
  }

  const left = remaining(timer);
  const running = Boolean(timer.startedAt) && left > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <section className="card flex h-[70vh] flex-col">
        <div className="border-b border-stone-100 p-4">
          <h1 className="font-semibold">{room.name}</h1>
          {room.topic && <p className="text-sm text-stone-500">{room.topic}</p>}
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[80%] ${m.user_id === me.id ? "ml-auto text-right" : ""}`}>
              <p className="text-xs text-stone-500">{m.author}</p>
              <p className={`inline-block rounded-2xl px-3 py-2 text-sm ${m.user_id === me.id ? "bg-accent text-white" : "bg-stone-100"}`}>{m.body}</p>
            </div>
          ))}
          <div ref={bottom} />
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-stone-100 p-3">
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Message the room…" className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm" />
          <button className="btn">Send</button>
        </form>
      </section>

      <aside className="grid h-fit gap-4">
        <div className="card p-5 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-stone-500">{timer.mode === "focus" ? "Focus" : "Break"}</p>
          <p className="my-2 font-mono text-5xl font-bold tabular-nums">{mmss(left)}</p>
          <p className="mb-3 text-xs text-stone-500">{running ? "Synced for everyone in the room" : left === 0 ? "Time's up! 🎉" : "Paused"}</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => setTimerRemote("focus", true)} className="btn !py-1.5 text-xs">Focus 25</button>
            <button onClick={() => setTimerRemote("break", true)} className="btn-outline !py-1.5 text-xs">Break 5</button>
            <button onClick={() => setTimerRemote(timer.mode, false)} className="btn-outline !py-1.5 text-xs">Reset</button>
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium">Online now ({online.length})</p>
          <ul className="mt-2 grid gap-1 text-sm">
            {online.map((u) => (
              <li key={u.id} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {u.name}{u.id === me.id && " (you)"}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
