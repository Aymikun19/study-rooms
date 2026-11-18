"use client";

import { Globe, Lock, Plus } from "lucide-react";
import { useActionState, useState } from "react";
import { PasswordInput } from "@/components/kit/PasswordInput";
import { BREAK_CHOICES, FOCUS_CHOICES } from "@/lib/timer";
import { createRoom, type FormState } from "./actions";

export function CreateRoomForm() {
  const [state, action, pending] = useActionState(createRoom, {} as FormState);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  return (
    <form action={action} className="card grid gap-4 p-5 sm:p-6">
      <h2 className="font-semibold">Create a room</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="field"><span>Room name</span><input name="name" required maxLength={60} placeholder="CSC 301 grind" /></label>
        <label className="field"><span>Topic (optional)</span><input name="topic" maxLength={120} placeholder="Data structures revision" /></label>
      </div>
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium text-stone-700">Who can join?</legend>
        <input type="hidden" name="visibility" value={visibility} />
        <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
          {([
            ["public", Globe, "Public", "Anyone signed in can join and chat."],
            ["private", Lock, "Private", "People need the room password to get in."],
          ] as const).map(([v, Icon, title, text]) => (
            <button key={v} type="button" role="radio" aria-checked={visibility === v} onClick={() => setVisibility(v)}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${visibility === v ? "border-accent bg-accent/5 ring-2 ring-accent/20" : "border-stone-200 hover:border-stone-300"}`}>
              <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${visibility === v ? "bg-accent text-white" : "bg-stone-100 text-stone-500"}`}><Icon size={17} aria-hidden /></span>
              <span><span className="block text-sm font-semibold">{title}</span><span className="text-xs text-stone-500">{text}</span></span>
            </button>
          ))}
        </div>
      </fieldset>
      {visibility === "private" && (
        <label className="field">
          <span>Room password</span>
          <PasswordInput name="password" required minLength={4} maxLength={64} autoComplete="new-password" placeholder="At least 4 characters" />
          <small className="text-xs text-stone-500">Share it only with people you want in the room. It is stored hashed, so nobody can read it back.</small>
        </label>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="field">
          <span>Focus length</span>
          <select name="focus" defaultValue="25">{FOCUS_CHOICES.map((m) => <option key={m} value={m}>{m} minutes</option>)}</select>
        </label>
        <label className="field">
          <span>Break length</span>
          <select name="break" defaultValue="5">{BREAK_CHOICES.map((m) => <option key={m} value={m}>{m} minutes</option>)}</select>
        </label>
      </div>
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <button className="btn justify-self-start" disabled={pending}><Plus size={16} aria-hidden /> {pending ? "Creating…" : "Create room"}</button>
    </form>
  );
}
