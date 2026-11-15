export type TimerState = { mode: "focus" | "break"; durationSec: number; startedAt: string | null };

/** Seconds remaining for a shared timer, derived from the server start time (so every client agrees). */
export function remaining(t: TimerState, now = Date.now()) {
  if (!t.startedAt) return t.durationSec;
  const elapsed = Math.floor((now - Date.parse(t.startedAt)) / 1000);
  return Math.max(0, t.durationSec - elapsed);
}

export function mmss(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const PRESETS = { focus: 25 * 60, break: 5 * 60 } as const;
