export const BUCKET = "room-files";
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_VOICE_SECONDS = 120;

export function prettySize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Storage-safe file name: keeps letters, digits, dot, dash and underscore. */
export function safeName(name: string) {
  const cleaned = name.normalize("NFKD").replace(/[^\w.\-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return (cleaned || "file").slice(-80);
}

export const roomPath = (roomId: string, userId: string, name: string) => `${roomId}/${userId}/${crypto.randomUUID()}-${safeName(name)}`;
