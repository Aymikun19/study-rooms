import { describe, expect, it } from "vitest";
import { mmss, remaining } from "./timer";

describe("timer", () => {
  const start = "2026-11-15T10:00:00.000Z";
  it("returns full duration when not started", () => {
    expect(remaining({ mode: "focus", durationSec: 1500, startedAt: null })).toBe(1500);
  });
  it("counts down from the shared start time", () => {
    expect(remaining({ mode: "focus", durationSec: 1500, startedAt: start }, Date.parse(start) + 90_000)).toBe(1410);
  });
  it("never goes negative", () => {
    expect(remaining({ mode: "break", durationSec: 300, startedAt: start }, Date.parse(start) + 3_600_000)).toBe(0);
  });
  it("formats mm:ss", () => {
    expect(mmss(1500)).toBe("25:00");
    expect(mmss(61)).toBe("01:01");
  });
});

describe("progress and focus counts", () => {
  it("reports progress through a phase", async () => {
    const { progress } = await import("./timer");
    const start = Date.parse("2026-11-17T10:00:00Z");
    expect(progress({ mode: "focus", durationSec: 1500, startedAt: new Date(start).toISOString() }, start + 750_000)).toBeCloseTo(0.5);
  });
  it("counts today's and this week's sessions", async () => {
    const { focusCounts } = await import("./timer");
    const now = new Date("2026-11-17T12:00:00");
    const log = [new Date("2026-11-17T09:00:00").toISOString(), new Date("2026-11-14T09:00:00").toISOString(), new Date("2026-10-01T09:00:00").toISOString()];
    expect(focusCounts(log, now)).toEqual({ today: 1, week: 2 });
  });
});

describe("clampMinutes", () => {
  it("keeps focus and break inside their ranges", async () => {
    const { clampMinutes } = await import("./timer");
    expect(clampMinutes("focus", 0)).toBe(1);
    expect(clampMinutes("focus", 500)).toBe(180);
    expect(clampMinutes("break", 75)).toBe(60);
    expect(clampMinutes("break", Number.NaN)).toBe(1);
  });
});

describe("pause, resume and reset", () => {
  const lengths = { focus: 25, brk: 5 };
  const t0 = Date.parse("2026-11-18T10:00:00Z");

  it("pausing focus starts the break and keeps the focus time left", async () => {
    const { pausePatch } = await import("./timer");
    const p = pausePatch({ mode: "focus", durationSec: 1500, startedAt: new Date(t0).toISOString() }, lengths, t0 + 600_000);
    expect(p).toEqual({ timer_mode: "break", timer_duration_sec: 300, timer_started_at: new Date(t0 + 600_000).toISOString(), focus_remaining_sec: 900 });
  });

  it("does not pause a break, an idle timer or a finished focus", async () => {
    const { pausePatch } = await import("./timer");
    expect(pausePatch({ mode: "break", durationSec: 300, startedAt: new Date(t0).toISOString() }, lengths, t0)).toBeNull();
    expect(pausePatch({ mode: "focus", durationSec: 1500, startedAt: null }, lengths, t0)).toBeNull();
    expect(pausePatch({ mode: "focus", durationSec: 1500, startedAt: new Date(t0).toISOString() }, lengths, t0 + 2_000_000)).toBeNull();
  });

  it("resumes focus with exactly what was left", async () => {
    const { resumePatch } = await import("./timer");
    expect(resumePatch(900, t0)).toEqual({ timer_mode: "focus", timer_duration_sec: 900, timer_started_at: new Date(t0).toISOString(), focus_remaining_sec: null });
    expect(resumePatch(null, t0)).toBeNull();
  });

  it("start and reset use the room lengths", async () => {
    const { startPatch, resetPatch } = await import("./timer");
    expect(startPatch("break", lengths, t0).timer_duration_sec).toBe(300);
    expect(resetPatch(lengths)).toEqual({ timer_mode: "focus", timer_duration_sec: 1500, timer_started_at: null, focus_remaining_sec: null });
  });
});
