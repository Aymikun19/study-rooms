"use client";

import { Camera, Check, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Avatar } from "@/components/kit/Avatar";
import { AVATAR_BUCKET, toAvatarBlob } from "@/lib/avatar";
import { createClient } from "@/lib/supabase/client";

const TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AvatarForm({ userId, name, version }: { userId: string; name: string; version: number | null }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [v, setV] = useState<number | null>(version);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});

  async function upload(file: File) {
    setMsg({});
    if (!TYPES.includes(file.type)) return setMsg({ error: "Choose a JPG, PNG or WebP image." });
    if (file.size > 10 * 1024 * 1024) return setMsg({ error: "That image is over 10 MB." });
    setBusy("upload");
    try {
      const blob = await toAvatarBlob(file);
      const supabase = createClient();
      const { error } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(`${userId}/avatar.webp`, blob, { upsert: true, contentType: "image/webp", cacheControl: "300" });
      if (error) throw error;
      const now = Date.now();
      const { error: e2 } = await supabase.auth.updateUser({ data: { avatar_v: now } });
      if (e2) throw e2;
      setV(now);
      setMsg({ ok: "Profile picture updated" });
      router.refresh();
    } catch (e) {
      setMsg({ error: (e as Error).message || "Upload failed" });
    } finally {
      setBusy(null);
      if (input.current) input.current.value = "";
    }
  }

  async function remove() {
    if (!confirm("Remove your profile picture?")) return;
    setBusy("remove");
    setMsg({});
    const supabase = createClient();
    const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([`${userId}/avatar.webp`]);
    if (!error) await supabase.auth.updateUser({ data: { avatar_v: null } });
    setBusy(null);
    if (error) return setMsg({ error: error.message });
    setV(null);
    setMsg({ ok: "Profile picture removed" });
    router.refresh();
  }

  return (
    <section className="card grid gap-4 p-6" aria-labelledby="avatar-h">
      <h2 id="avatar-h" className="flex items-center gap-2 font-semibold"><Camera size={17} className="text-accent" aria-hidden /> Profile picture</h2>
      <div className="flex flex-wrap items-center gap-5">
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="group relative rounded-full ring-offset-2 focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Choose a new profile picture"
        >
          <Avatar userId={userId} name={name} version={v} hasPhoto={v !== null} size={88} tone="accent" />
          <span className="absolute inset-0 grid place-items-center rounded-full bg-stone-900/45 text-white opacity-0 transition group-hover:opacity-100">
            {busy === "upload" ? <Loader2 size={22} className="animate-spin" aria-hidden /> : <Camera size={22} aria-hidden />}
          </span>
        </button>
        <div className="grid gap-2">
          <p className="text-sm text-stone-500">JPG, PNG or WebP. We crop it to a square. It shows in every app you use with this account.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn" disabled={busy !== null} onClick={() => input.current?.click()}>
              {busy === "upload" ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Camera size={15} aria-hidden />} {v ? "Change photo" : "Upload photo"}
            </button>
            {v !== null && (
              <button type="button" className="btn-outline" disabled={busy !== null} onClick={remove}>
                <Trash2 size={15} aria-hidden /> Remove
              </button>
            )}
          </div>
        </div>
      </div>
      <input ref={input} type="file" accept={TYPES.join(",")} className="sr-only" tabIndex={-1} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      {msg.error && <p role="alert" className="text-sm text-red-600">{msg.error}</p>}
      {msg.ok && <p role="status" className="inline-flex items-center gap-1.5 text-sm text-emerald-700"><Check size={15} aria-hidden /> {msg.ok}</p>}
    </section>
  );
}
