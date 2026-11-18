/**
 * Profile pictures live in one public Supabase Storage bucket shared by every app on this account:
 * avatars/<user id>/avatar.webp. The user's own metadata carries `avatar_v` (a timestamp) so a new
 * upload shows up immediately; other people's pictures refresh within a few minutes.
 */
export const AVATAR_BUCKET = "avatars";

export function avatarUrl(userId: string | null | undefined, version?: number | string | null): string | null {
  if (!userId) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${AVATAR_BUCKET}/${userId}/avatar.webp${version ? `?v=${version}` : ""}`;
}

export function initials(name: string | null | undefined): string {
  const words = (name ?? "").replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  if (!words.length) return "?";
  return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0]).toUpperCase();
}

/** Square-crops and shrinks an image file to a WebP blob in the browser. */
export async function toAvatarBlob(file: File, size = 320): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.86));
  if (!blob) throw new Error("This browser could not process the image");
  return blob;
}
