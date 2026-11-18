"use client";

import { Flame, Loader2, Lock, SendHorizontal, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DB_SCHEMA } from "@/lib/supabase/config";
import { Avatar } from "@/components/kit/Avatar";
import { createClient } from "@/lib/supabase/client";
import { focusCounts, logFocusSession, readFocusLog, remaining, type TimerPatch, type TimerState } from "@/lib/timer";
import { BUCKET, roomPath } from "@/lib/files";
import { AttachmentView, FilePicker, VoiceRecorder, type Attachment } from "./Media";
import { TimerCard } from "./TimerCard";
import { DeleteRoom } from "./DeleteRoom";
import { useRouter } from "next/navigation";
import { CopyButton } from "@/components/kit/CopyButton";

type Msg = {
  id: number; user_id: string; author: string; body: string; created_at: string;
  kind?: "text" | "voice" | "file"; attachment_path?: string | null; attachment_name?: string | null;
  attachment_type?: string | null; attachment_size?: number | null; duration_sec?: number | null;
};
type RoomRow = {
  id: string; name: string; topic: string | null; visibility?: "public" | "private"; focus_minutes?: number; break_minutes?: number;
  timer_mode: "focus" | "break"; timer_duration_sec: number; timer_started_at: string | null;
  focus_remaining_sec?: number | null; created_by?: string;
};

const attachmentOf = (m: Msg): Attachment | null =>
  m.kind && m.kind !== "text" && m.attachment_path
    ? { kind: m.kind, path: m.attachment_path, name: m.attachment_name ?? "file", type: m.attachment_type ?? "", size: m.attachment_size ?? 0, duration: m.duration_sec ?? undefined }
    : null;
type Me = { id: string; name: string; v?: number | null };

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
};

function beep() {
  try {
    const ctx = new AudioContext();
    [0, 0.25, 0.5].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.2);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.22);
    });
  } catch {
    /* audio unavailable */
  }
}

export function Room({ room, initialMessages, me, link }: { room: RoomRow; initialMessages: Msg[]; me: Me; link: string }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [online, setOnline] = useState<Me[]>([]);
  const versionOf = (id: string) => (id === me.id ? me.v : online.find((u) => u.id === id)?.v);
  const [typing, setTyping] = useState<Record<string, { name: string; at: number }>>({});
  const [timer, setTimer] = useState<TimerState>({ mode: room.timer_mode, durationSec: room.timer_duration_sec, startedAt: room.timer_started_at });
  const [now, setNow] = useState(() => Date.now());
  const [text, setText] = useState("");
  const [alerts, setAlerts] = useState(false);
  const [counts, setCounts] = useState({ today: 0, week: 0 });
  const [lengths, setLengths] = useState({ focus: room.focus_minutes ?? 25, brk: room.break_minutes ?? 5 });
  const [focusRemaining, setFocusRemaining] = useState<number | null>(room.focus_remaining_sec ?? null);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastTyping = useRef(0);
  const prevLeft = useRef<number | null>(null);

  useEffect(() => {
    // Read browser-only state after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCounts(focusCounts(readFocusLog()));
    setAlerts(typeof Notification !== "undefined" && Notification.permission === "granted");
  }, []);

  // Realtime: messages, timer, presence and typing on one channel.
  useEffect(() => {
    const channel = supabase
      .channel(`room:${room.id}`, { config: { presence: { key: me.id } } })
      .on("postgres_changes", { event: "INSERT", schema: DB_SCHEMA, table: "messages", filter: `room_id=eq.${room.id}` }, (p) => {
        const m = p.new as Msg;
        setMessages((list) => (list.some((x) => x.id === m.id) ? list : [...list, m]));
        setTyping((t) => {
          const next = { ...t };
          delete next[m.user_id];
          return next;
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: DB_SCHEMA, table: "rooms", filter: `id=eq.${room.id}` }, (p) => {
        const r = p.new as RoomRow;
        setTimer({ mode: r.timer_mode, durationSec: r.timer_duration_sec, startedAt: r.timer_started_at });
        if (r.focus_minutes && r.break_minutes) setLengths((l) => (l.focus === r.focus_minutes && l.brk === r.break_minutes ? l : { focus: r.focus_minutes!, brk: r.break_minutes! }));
        setFocusRemaining(r.focus_remaining_sec ?? null);
      })
      .on("postgres_changes", { event: "DELETE", schema: DB_SCHEMA, table: "rooms", filter: `id=eq.${room.id}` }, () => {
        if (room.created_by !== me.id) router.replace("/?deleted=1");
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const p = payload as Me;
        if (p.id !== me.id) setTyping((t) => ({ ...t, [p.id]: { name: p.name, at: Date.now() } }));
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<Me>();
        setOnline(Object.values(state).map((v) => v[0]));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel.track(me);
      });
    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, room.id, me, router]);

  const timerRef = useRef(timer);
  const alertsRef = useRef(alerts);
  useEffect(() => {
    timerRef.current = timer;
    alertsRef.current = alerts;
  }, [timer, alerts]);

  // One clock drives the countdown and fires phase alerts once when a running timer hits zero.
  useEffect(() => {
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      const cur = timerRef.current;
      const left = remaining(cur, n);
      const prev = prevLeft.current;
      prevLeft.current = left;
      if (prev !== null && prev > 0 && left === 0 && cur.startedAt) {
        beep();
        if (cur.mode === "focus") setCounts(focusCounts(logFocusSession()));
        if (alertsRef.current && document.hidden) {
          new Notification(cur.mode === "focus" ? "Focus session done" : "Break is over", {
            body: cur.mode === "focus" ? `Nice work in ${room.name}. Time for a break.` : `Back to it in ${room.name}.`,
            icon: "/logo.svg",
          });
        }
      }
    }, 1000);
    return () => clearInterval(t);
  }, [room.name]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);


  // Signed URLs for voice notes and files (the bucket is private; links expire after an hour).
  useEffect(() => {
    const missing = messages.map((m) => m.attachment_path).filter((p): p is string => Boolean(p) && !urls[p as string]);
    if (!missing.length) return;
    supabase.storage.from(BUCKET).createSignedUrls(missing, 3600).then(({ data }) => {
      if (!data) return;
      setUrls((u) => ({ ...u, ...Object.fromEntries(data.filter((d) => d.signedUrl && d.path).map((d) => [d.path as string, d.signedUrl as string])) }));
    });
  }, [messages, urls, supabase]);

  async function sendAttachment(kind: "voice" | "file", blob: Blob, name: string, duration?: number) {
    setSendError(null);
    setUploading(kind === "voice" ? "Sending voice note…" : `Uploading ${name}…`);
    const path = roomPath(room.id, me.id, name);
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || "application/octet-stream" });
    if (upErr) {
      setUploading(null);
      setSendError(`Upload failed: ${upErr.message}`);
      return;
    }
    const { error } = await supabase.from("messages").insert({
      room_id: room.id, author: me.name, body: "", kind, attachment_path: path, attachment_name: name,
      attachment_type: blob.type || "application/octet-stream", attachment_size: blob.size, duration_sec: duration ?? null,
    });
    setUploading(null);
    if (error) setSendError(error.message);
  }

  async function saveLengths(l: { focus: number; brk: number }) {
    const patch: Record<string, unknown> = { focus_minutes: l.focus, break_minutes: l.brk };
    if (!timer.startedAt) patch.timer_duration_sec = (timer.mode === "focus" ? l.focus : l.brk) * 60;
    setLengths(l);
    await supabase.from("rooms").update(patch).eq("id", room.id);
  }

  async function patchTimer(p: TimerPatch) {
    setTimer({ mode: p.timer_mode, durationSec: p.timer_duration_sec, startedAt: p.timer_started_at });
    setFocusRemaining(p.focus_remaining_sec);
    await supabase.from("rooms").update(p).eq("id", room.id);
  }

  const sendTyping = useCallback(() => {
    if (Date.now() - lastTyping.current < 2000) return;
    lastTyping.current = Date.now();
    channelRef.current?.send({ type: "broadcast", event: "typing", payload: me });
  }, [me]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    await supabase.from("messages").insert({ room_id: room.id, author: me.name, body });
  }

  async function toggleAlerts() {
    if (alerts) return setAlerts(false);
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setAlerts(p === "granted");
  }

  const typers = Object.values(typing).filter((t) => now - t.at < 4000).map((t) => t.name);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-stone-500 hover:text-accent">All rooms</Link>
          <h1 className="page-title mt-1 flex items-center gap-2">{room.name}{room.visibility === "private" && <span className="badge"><Lock size={12} aria-hidden /> Private</span>}</h1>
          {room.topic && <p className="mt-1 text-sm text-stone-500">{room.topic}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton value={link} label="Copy invite link" />
          {room.created_by === me.id && <DeleteRoom roomId={room.id} name={room.name} />}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="card flex h-[68vh] min-h-[460px] flex-col" aria-label="Room chat">
          <div className="flex-1 overflow-y-auto px-5 py-4" aria-live="polite">
            {messages.length === 0 && <p className="grid h-full place-items-center text-sm text-stone-500">Say hello to get the room started.</p>}
            {messages.map((m, i) => {
              const prev = messages[i - 1];
              const newDay = !prev || dayLabel(prev.created_at) !== dayLabel(m.created_at);
              const grouped = prev && !newDay && prev.user_id === m.user_id && Date.parse(m.created_at) - Date.parse(prev.created_at) < 5 * 60_000;
              const mine = m.user_id === me.id;
              return (
                <div key={m.id}>
                  {newDay && (
                    <div className="my-4 flex items-center gap-3 text-xs text-stone-400" suppressHydrationWarning>
                      <span className="h-px flex-1 bg-stone-200" /> {dayLabel(m.created_at)} <span className="h-px flex-1 bg-stone-200" />
                    </div>
                  )}
                  <div className={`flex gap-2.5 ${mine ? "flex-row-reverse" : ""} ${grouped ? "mt-1" : "mt-4"}`}>
                    <Avatar userId={m.user_id} name={m.author} version={versionOf(m.user_id)} hasPhoto={versionOf(m.user_id) !== null} size={32} tone={mine ? "accent" : "muted"} className={grouped ? "invisible" : ""} />
                    <div className={`grid max-w-[75%] gap-1 ${mine ? "justify-items-end" : ""}`}>
                      {!grouped && (
                        <p className="text-xs text-stone-500" suppressHydrationWarning><span className="font-medium text-stone-700">{mine ? "You" : m.author}</span> · {time(m.created_at)}</p>
                      )}
                      {attachmentOf(m) ? (
                        <div className={`rounded-2xl p-1.5 ${mine ? "rounded-tr-md bg-accent text-white" : "rounded-tl-md bg-stone-100"}`}>
                          <AttachmentView a={attachmentOf(m)!} url={urls[m.attachment_path!]} mine={mine} />
                        </div>
                      ) : (
                        <p className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${mine ? "rounded-tr-md bg-accent text-white" : "rounded-tl-md bg-stone-100"}`}>{m.body}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottom} />
          </div>
          <p className="h-5 px-5 text-xs italic text-stone-500" aria-live="polite">
            {typers.length > 0 && `${typers.slice(0, 2).join(" and ")}${typers.length > 2 ? " and others" : ""} ${typers.length > 1 ? "are" : "is"} typing…`}
          </p>
          {(uploading || sendError) && (
            <p className={`flex items-center gap-2 px-5 pb-1 text-xs ${sendError ? "text-red-600" : "text-stone-500"}`} role="status">
              {uploading && <Loader2 size={13} className="animate-spin" aria-hidden />} {sendError ?? uploading}
            </p>
          )}
          <form onSubmit={send} className="relative flex items-center gap-1 border-t border-stone-100 p-3">
            <FilePicker disabled={Boolean(uploading)} onPick={(f) => sendAttachment("file", f, f.name)} />
            <label className="sr-only" htmlFor="msg">Message</label>
            <input id="msg" value={text} onChange={(e) => { setText(e.target.value); sendTyping(); }} maxLength={1000} placeholder="Message the room…" className="input mx-1" autoComplete="off" />
            {text.trim() ? (
              <button className="btn shrink-0" aria-label="Send message"><SendHorizontal size={16} aria-hidden /></button>
            ) : (
              <VoiceRecorder disabled={Boolean(uploading)} onDone={(blob, secs) => sendAttachment("voice", blob, `voice-note.${blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm"}`, secs)} />
            )}
          </form>
        </section>

        <aside className="grid h-fit gap-4">
          <TimerCard
            timer={timer}
            focusRemaining={focusRemaining}
            lengths={lengths}
            now={now}
            alerts={alerts}
            onToggleAlerts={toggleAlerts}
            onPatch={patchTimer}
            onSaveLengths={saveLengths}
          />

          <section className="card p-5" aria-label="Your focus stats">
            <p className="flex items-center gap-1.5 text-sm font-semibold"><Flame size={16} className="text-accent" aria-hidden /> Your focus</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-stone-50 p-3"><p className="text-2xl font-semibold">{counts.today}</p><p className="text-xs text-stone-500">sessions today</p></div>
              <div className="rounded-xl bg-stone-50 p-3"><p className="text-2xl font-semibold">{counts.week}</p><p className="text-xs text-stone-500">this week</p></div>
            </div>
            <p className="mt-2 text-[11px] text-stone-400">Counted on this device when a focus timer finishes.</p>
          </section>

          <section className="card p-5" aria-label="Who is online">
            <p className="flex items-center gap-1.5 text-sm font-semibold"><Users size={16} aria-hidden /> Online now ({online.length})</p>
            <ul className="mt-3 grid gap-2 text-sm">
              {online.map((u) => (
                <li key={u.id} className="flex items-center gap-2.5">
                  <span className="relative">
                    <Avatar userId={u.id} name={u.name} version={u.v} hasPhoto={u.v !== null} size={28} />
                    <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
                  </span>
                  {u.name}{u.id === me.id && <span className="text-stone-400">(you)</span>}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
