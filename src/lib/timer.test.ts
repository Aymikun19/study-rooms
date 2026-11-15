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
