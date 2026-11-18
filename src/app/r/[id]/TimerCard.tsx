"use client";

import { Bell, BellOff, Brain, Coffee, Minus, Pause, Play, Plus, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { clampMinutes, mmss, pausePatch, progress, remaining, resetPatch, resumePatch, startPatch, type Lengths, type TimerPatch, type TimerState } from "@/lib/timer";
import { TimerEditor } from "./TimerEditor";

function Stepper({ label, mode, value, onChange }: { label: string; mode: "focus" | "break"; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-stone-50 px-3 py-2">
      <span className="flex items-center gap-1.5 text-sm font-medium">
        {mode === "focus" ? <Brain size={15} className="text-accent" aria-hidden /> : <Coffee size={15} className="text-accent" aria-hidden />} {label}
      </span>
      <span className="flex items-center gap-1">
        <button type="button" onClick={() => onChange(clampMinutes(mode, value - 1))} className="grid size-8 place-items-center rounded-lg border border-stone-200 bg-white hover:border-stone-300" aria-label={`Less ${label.toLowerCase()} time`}><Minus size={14} aria-hidden /></button>
        <label className="sr-only" htmlFor={`len-${mode}`}>{label} minutes</label>
        <input id={`len-${mode}`} type="number" inputMode="numeric" min={1} max={mode === "focus" ? 180 : 60} value={value}
          onChange={(e) => onChange(clampMinutes(mode, Number(e.target.value)))}
          className="w-12 rounded-lg border border-stone-200 bg-white py-1 text-center font-mono text-sm font-semibold tabular-nums outline-none focus:border-accent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
        <button type="button" onClick={() => onChange(clampMinutes(mode, value + 1))} className="grid size-8 place-items-center rounded-lg border border-stone-200 bg-white hover:border-stone-300" aria-label={`More ${label.toLowerCase()} time`}><Plus size={14} aria-hidden /></button>
        <span className="w-7 text-xs text-stone-500">min</span>
      </span>
    </div>
  );
}

export function TimerCard({
  timer, focusRemaining, lengths, now, alerts, onToggleAlerts, onPatch, onSaveLengths,
}: {
  timer: TimerState;
  focusRemaining: number | null;
  lengths: Lengths;
  now: number;
  alerts: boolean;
  onToggleAlerts: () => void;
  onPatch: (p: TimerPatch) => Promise<void>;
  onSaveLengths: (l: Lengths) => Promise<void>;
}) {
  const [draft, setDraft] = useState(lengths);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Follow changes made by other people in the room.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(lengths);
  }, [lengths]);

  function edit(next: Lengths) {
    setDraft(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => onSaveLengths(next), 500);
  }

  const left = remaining(timer, now);
  const idle = !timer.startedAt;
  const running = !idle && left > 0;
  const pausedFocus = focusRemaining && focusRemaining > 0 ? focusRemaining : null;
  const pct = idle ? 0 : progress(timer, now);
  const R = 78;
  const C = 2 * Math.PI * R;
  const shown = idle ? (timer.mode === "focus" ? draft.focus : draft.brk) * 60 : left;

  return (
    <section className="card grid justify-items-center gap-4 p-6" aria-label="Shared timer">
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        {timer.mode === "focus" ? <Brain size={14} aria-hidden /> : <Coffee size={14} aria-hidden />}
        {timer.mode === "focus" ? "Focus" : pausedFocus ? "Break · focus paused" : "Break"}
      </p>
      <div className="relative grid size-44 place-items-center">
        <svg viewBox="0 0 180 180" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="90" cy="90" r={R} fill="none" stroke="#f5f5f4" strokeWidth="10" />
          <circle cx="90" cy="90" r={R} fill="none" stroke={timer.mode === "focus" ? "var(--accent)" : "#10b981"} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - pct)} className="transition-[stroke-dashoffset] duration-1000 ease-linear" />
        </svg>
        <div className="text-center">
          <p className="font-mono text-4xl font-semibold tabular-nums" role="timer" aria-live="off">{mmss(shown)}</p>
          <p className="text-xs text-stone-500">{running ? "Synced live" : idle ? "Ready" : "Time's up"}</p>
        </div>
      </div>

      {pausedFocus && (
        <p className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">Focus paused with {mmss(pausedFocus)} left</p>
      )}

      {idle && (
        <div className="grid w-full gap-2">
          <Stepper label="Focus" mode="focus" value={draft.focus} onChange={(focus) => edit({ ...draft, focus })} />
          <Stepper label="Break" mode="break" value={draft.brk} onChange={(brk) => edit({ ...draft, brk })} />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {timer.mode === "focus" && running && (
          <button onClick={() => { const p = pausePatch(timer, draft); if (p) onPatch(p); }} className="btn !py-2 text-xs">
            <Pause size={14} aria-hidden /> Pause for a {draft.brk}-min break
          </button>
        )}
        {pausedFocus && (
          <button onClick={() => { const p = resumePatch(pausedFocus); if (p) onPatch(p); }} className="btn !py-2 text-xs">
            <Play size={14} aria-hidden /> Resume focus
          </button>
        )}
        {!(timer.mode === "focus" && running) && !pausedFocus && (
          <>
            <button onClick={() => onPatch(startPatch("focus", draft))} className="btn !py-2 text-xs"><Brain size={14} aria-hidden /> Start focus</button>
            <button onClick={() => onPatch(startPatch("break", draft))} className="btn-outline !py-2 text-xs"><Coffee size={14} aria-hidden /> Start break</button>
          </>
        )}
        {!idle && (
          <button onClick={() => onPatch(resetPatch(draft))} className="btn-outline !py-2 text-xs" aria-label="Stop and reset the timer"><RotateCcw size={14} aria-hidden /></button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-1">
        {!idle && <TimerEditor focus={draft.focus} brk={draft.brk} onSave={(f, b) => onSaveLengths({ focus: f, brk: b })} />}
        <button onClick={onToggleAlerts} className="btn-ghost text-xs" aria-pressed={alerts}>
          {alerts ? <Bell size={14} aria-hidden /> : <BellOff size={14} aria-hidden />} {alerts ? "Alerts on" : "Turn on alerts"}
        </button>
      </div>
    </section>
  );
}
