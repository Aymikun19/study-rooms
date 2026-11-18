"use client";

import { Check, Minus, Plus, Settings2, X } from "lucide-react";
import { useRef, useState } from "react";
import { BREAK_CHOICES, clampMinutes, FOCUS_CHOICES } from "@/lib/timer";

function Wheel({ label, value, onChange, choices, mode }: { label: string; value: number; onChange: (n: number) => void; choices: number[]; mode: "focus" | "break" }) {
  return (
    <div className="grid justify-items-center gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <div className="flex items-center gap-3">
        <button type="button" className="btn-outline !size-11 !rounded-full !p-0" aria-label={`Less ${label.toLowerCase()} time`} onClick={() => onChange(clampMinutes(mode, value - 1))}><Minus size={18} aria-hidden /></button>
        <label className="grid justify-items-center">
          <span className="sr-only">{label} minutes</span>
          <input type="number" inputMode="numeric" min={1} max={mode === "focus" ? 180 : 60} value={value}
            onChange={(e) => onChange(clampMinutes(mode, Number(e.target.value)))}
            className="w-24 rounded-2xl border border-stone-200 bg-stone-50 py-2 text-center font-mono text-4xl font-semibold tabular-nums outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
          <span className="mt-1 text-xs text-stone-500">minutes</span>
        </label>
        <button type="button" className="btn-outline !size-11 !rounded-full !p-0" aria-label={`More ${label.toLowerCase()} time`} onClick={() => onChange(clampMinutes(mode, value + 1))}><Plus size={18} aria-hidden /></button>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {choices.map((m) => (
          <button key={m} type="button" onClick={() => onChange(m)} aria-pressed={value === m}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${value === m ? "bg-accent text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>{m}</button>
        ))}
      </div>
    </div>
  );
}

/** Alarm-clock style editor for a room's focus and break lengths. */
export function TimerEditor({ focus, brk, onSave }: { focus: number; brk: number; onSave: (focus: number, brk: number) => Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [f, setF] = useState(focus);
  const [b, setB] = useState(brk);
  const [saving, setSaving] = useState(false);
  return (
    <>
      <button type="button" className="btn-ghost text-xs" onClick={() => { setF(focus); setB(brk); dialog.current?.showModal(); }}>
        <Settings2 size={14} aria-hidden /> {focus} / {brk} min
      </button>
      <dialog ref={dialog} className="m-auto w-[min(440px,calc(100vw-2rem))] rounded-3xl p-0 shadow-2xl backdrop:bg-stone-900/40">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <h2 className="font-semibold">Edit timer</h2>
          <button type="button" className="btn-ghost !p-2" aria-label="Close" onClick={() => dialog.current?.close()}><X size={16} aria-hidden /></button>
        </div>
        <div className="grid gap-8 px-6 py-8">
          <Wheel label="Focus" value={f} onChange={setF} choices={FOCUS_CHOICES} mode="focus" />
          <Wheel label="Break" value={b} onChange={setB} choices={BREAK_CHOICES} mode="break" />
          <p className="text-center text-xs text-stone-500">Changes apply to everyone in the room from the next session.</p>
          <button type="button" className="btn !py-3" disabled={saving}
            onClick={async () => { setSaving(true); await onSave(f, b); setSaving(false); dialog.current?.close(); }}>
            <Check size={16} aria-hidden /> {saving ? "Saving…" : "Save timer"}
          </button>
        </div>
      </dialog>
    </>
  );
}
