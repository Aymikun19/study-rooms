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
