"use client";

import { Download, FileText, Mic, Paperclip, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MAX_FILE_BYTES, MAX_VOICE_SECONDS, prettySize } from "@/lib/files";
import { mmss } from "@/lib/timer";

export type Attachment = { kind: "voice" | "file"; path: string; name: string; type: string; size: number; duration?: number };

/** Records a voice note with MediaRecorder; hands back a Blob when the user stops. */
export function VoiceRecorder({ onDone, disabled }: { onDone: (blob: Blob, seconds: number) => void; disabled?: boolean }) {
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [secs, setSecs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const chunks = useRef<Blob[]>([]);
  const cancelled = useRef(false);
  const started = useRef(0);

  useEffect(() => {
    if (!rec) return;
    const t = setInterval(() => {
      const s = Math.floor((Date.now() - started.current) / 1000);
      setSecs(s);
      if (s >= MAX_VOICE_SECONDS) rec.stop();
    }, 250);
    return () => clearInterval(t);
  }, [rec]);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t));
      const r = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      chunks.current = [];
      cancelled.current = false;
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const seconds = Math.max(1, Math.round((Date.now() - started.current) / 1000));
        setRec(null);
        setSecs(0);
        if (!cancelled.current && chunks.current.length) onDone(new Blob(chunks.current, { type: r.mimeType || "audio/webm" }), seconds);
      };
      started.current = Date.now();
      r.start(250);
      setRec(r);
    } catch {
      setError("Microphone access was blocked. Allow it in your browser settings to send voice notes.");
    }
  }

  if (rec) {
    return (
      <div className="flex flex-1 items-center gap-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="status">
        <span className="size-2.5 animate-pulse rounded-full bg-red-600" aria-hidden />
        Recording {mmss(secs)} <span className="text-xs text-red-500">/ {mmss(MAX_VOICE_SECONDS)}</span>
        <span className="flex-1" />
        <button type="button" className="btn-ghost !p-2" aria-label="Discard voice note" onClick={() => { cancelled.current = true; rec.stop(); }}><Trash2 size={16} aria-hidden /></button>
        <button type="button" className="btn !py-1.5" onClick={() => rec.stop()}><Square size={14} aria-hidden /> Send</button>
      </div>
    );
  }
  return (
    <>
      <button type="button" disabled={disabled} onClick={start} className="btn-ghost !p-2.5" aria-label="Record a voice note" title="Record a voice note"><Mic size={18} aria-hidden /></button>
      {error && <p role="alert" className="absolute -top-8 left-3 text-xs text-red-600">{error}</p>}
    </>
  );
}

export function FilePicker({ onPick, disabled }: { onPick: (file: File) => void; disabled?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <button type="button" disabled={disabled} onClick={() => input.current?.click()} className="btn-ghost !p-2.5" aria-label="Share a file" title="Share a file (up to 10 MB)"><Paperclip size={18} aria-hidden /></button>
      <input ref={input} type="file" className="sr-only" tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          if (f.size > MAX_FILE_BYTES) { setError(`That file is ${prettySize(f.size)}. The limit is 10 MB.`); return; }
          setError(null);
          onPick(f);
        }} />
      {error && <p role="alert" className="absolute -top-8 left-3 text-xs text-red-600">{error}</p>}
    </>
  );
}

export function AttachmentView({ a, url, mine }: { a: Attachment; url?: string; mine: boolean }) {
  if (a.kind === "voice") {
    return url ? (
      <audio controls preload="metadata" src={url} className="h-10 w-64 max-w-full" aria-label={`Voice note, ${a.duration ?? 0} seconds`} />
    ) : <span className="text-xs opacity-70">Loading voice note…</span>;
  }
  if (a.type.startsWith("image/") && url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={a.name} className="max-h-64 w-auto max-w-full object-cover" loading="lazy" />
      </a>
    );
  }
  return (
    <a href={url} download={a.name} target="_blank" rel="noreferrer"
      className={`flex max-w-72 items-center gap-3 rounded-xl border p-2.5 text-sm ${mine ? "border-white/30 text-white" : "border-stone-200 bg-white text-stone-800"}`}>
      <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${mine ? "bg-white/20" : "bg-accent/10 text-accent"}`}><FileText size={17} aria-hidden /></span>
      <span className="min-w-0 flex-1"><span className="block truncate font-medium">{a.name}</span><span className="text-xs opacity-75">{prettySize(a.size)}</span></span>
      <Download size={15} aria-hidden className="shrink-0 opacity-75" />
    </a>
  );
}
