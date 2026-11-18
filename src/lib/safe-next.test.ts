import { describe, expect, it } from "vitest";
import { safeNext } from "./safe-next";

describe("safeNext", () => {
  it("keeps local paths", () => {
    expect(safeNext("/r/123?x=1")).toBe("/r/123?x=1");
  });
  it("blocks off-site redirects", () => {
    expect(safeNext("//evil.com")).toBe("/");
    expect(safeNext("/\\evil.com")).toBe("/");
    expect(safeNext("https://evil.com")).toBe("/");
    expect(safeNext(null, "/account")).toBe("/account");
  });
});
