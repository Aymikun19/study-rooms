"use client";

import { useState } from "react";
import { avatarUrl, initials } from "@/lib/avatar";

/**
 * A round profile picture with an initials fallback. The initials sit underneath and the photo fades
 * in only once it loads, so people without a picture never see a broken image.
 * Pass `hasPhoto={false}` when you already know there is no picture to skip the request.
 */
export function Avatar({
  userId,
  name,
  version,
  hasPhoto = true,
  size = 32,
  className = "",
  tone = "muted",
}: {
  userId?: string | null;
  name?: string | null;
  version?: number | string | null;
  hasPhoto?: boolean;
  size?: number;
  className?: string;
  tone?: "accent" | "muted";
}) {
  const src = hasPhoto ? avatarUrl(userId, version) : null;
  const [state, setState] = useState<{ src: string | null; ok: boolean }>({ src: null, ok: false });
  const loaded = state.src === src && state.ok;
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-semibold ${tone === "accent" ? "bg-accent text-white" : "bg-stone-200 text-stone-700"} ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.36)) }}
      aria-hidden
    >
      {!loaded && initials(name)}
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onLoad={() => setState({ src, ok: true })}
          onError={() => setState({ src, ok: false })}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </span>
  );
}
