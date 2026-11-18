/** Only allow redirects to paths on this site: "/x" is fine, "//evil.com" and "https://…" are not. */
export function safeNext(next: unknown, fallback = "/") {
  const s = typeof next === "string" ? next : "";
  return s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\") ? s : fallback;
}
