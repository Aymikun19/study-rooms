import { describe, expect, it } from "vitest";
import { prettySize, safeName } from "./files";

describe("files", () => {
  it("formats sizes", () => {
    expect(prettySize(512)).toBe("512 B");
    expect(prettySize(2048)).toBe("2 KB");
    expect(prettySize(3.5 * 1024 * 1024)).toBe("3.5 MB");
  });
  it("makes storage-safe names", () => {
    expect(safeName("My Notes (final).pdf")).toBe("My-Notes-final-.pdf");
    expect(safeName("../../etc/passwd")).toBe("..-..-etc-passwd");
    expect(safeName("")).toBe("file");
  });
});
