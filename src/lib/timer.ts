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

export const FOCUS_CHOICES = [15, 25, 30, 45, 50, 60, 90];
export const BREAK_CHOICES = [3, 5, 10, 15, 20];

/** Keep a minutes value inside the allowed range for a phase. */
export function clampMinutes(mode: "focus" | "break", m: number) {
  const max = mode === "focus" ? 180 : 60;
  return Math.min(max, Math.max(1, Math.round(Number.isFinite(m) ? m : 1)));
}

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

/** Database columns that drive the shared timer. */
export type TimerPatch = {
  timer_mode: "focus" | "break";
  timer_duration_sec: number;
  timer_started_at: string | null;
  focus_remaining_sec: number | null;
};

export type Lengths = { focus: number; brk: number };

export function startPatch(mode: "focus" | "break", lengths: Lengths, now = Date.now()): TimerPatch {
  return {
    timer_mode: mode,
    timer_duration_sec: (mode === "focus" ? lengths.focus : lengths.brk) * 60,
    timer_started_at: new Date(now).toISOString(),
    focus_remaining_sec: null,
  };
}

/** Pausing focus starts the break straight away and remembers how much focus time was left. */
export function pausePatch(t: TimerState, lengths: Lengths, now = Date.now()): TimerPatch | null {
  if (t.mode !== "focus" || !t.startedAt) return null;
  const left = remaining(t, now);
  if (left <= 0) return null;
  return {
    timer_mode: "break",
    timer_duration_sec: lengths.brk * 60,
    timer_started_at: new Date(now).toISOString(),
    focus_remaining_sec: left,
  };
}

/** Back to focus with exactly the time that was left when it was paused. */
export function resumePatch(focusRemaining: number | null, now = Date.now()): TimerPatch | null {
  if (!focusRemaining || focusRemaining <= 0) return null;
  return {
    timer_mode: "focus",
    timer_duration_sec: focusRemaining,
    timer_started_at: new Date(now).toISOString(),
    focus_remaining_sec: null,
  };
}

export function resetPatch(lengths: Lengths): TimerPatch {
  return { timer_mode: "focus", timer_duration_sec: lengths.focus * 60, timer_started_at: null, focus_remaining_sec: null };
}
