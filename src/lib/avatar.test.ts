import { describe, expect, it } from "vitest";
import { avatarUrl, initials } from "./avatar";

describe("avatar helpers", () => {
  it("builds initials from names and emails", () => {
    expect(initials("Olopade Oreoluwa")).toBe("OO");
    expect(initials("ayomikun.olopade@gmail.com")).toBe("AO");
    expect(initials("Senpai")).toBe("SE");
    expect(initials("")).toBe("?");
  });
  it("builds a versioned public URL", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    expect(avatarUrl("u1", 5)).toBe("https://x.supabase.co/storage/v1/object/public/avatars/u1/avatar.webp?v=5");
    expect(avatarUrl(null)).toBeNull();
  });
});
