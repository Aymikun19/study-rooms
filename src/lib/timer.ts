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

/** Fraction of the current phase completed, 0..1. */
export function progress(t: TimerState, now = Date.now()) {
  return t.durationSec ? 1 - remaining(t, now) / t.durationSec : 0;
}

/** Local focus log: ISO timestamps of completed focus sessions, kept per browser. */
const KEY = "studyrooms:focus-log";
export function readFocusLog(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
export function logFocusSession(at = new Date()) {
  try {
    const log = [...readFocusLog(), at.toISOString()].slice(-500);
    localStorage.setItem(KEY, JSON.stringify(log));
    return log;
  } catch {
    return [];
  }
}
export function focusCounts(log: string[], now = new Date()) {
  const day = now.toDateString();
  const weekAgo = now.getTime() - 7 * 86_400_000;
  return {
    today: log.filter((x) => new Date(x).toDateString() === day).length,
    week: log.filter((x) => new Date(x).getTime() > weekAgo).length,
  };
}

export const isRunning = (startedAt: string | null, durationSec: number, now = Date.now()) =>
  Boolean(startedAt) && Date.parse(startedAt!) + durationSec * 1000 > now;
