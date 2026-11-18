"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteRoom } from "../../actions";

export function DeleteRoom({ roomId, name }: { roomId: string; name: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <button type="button" disabled={pending} className="btn-outline hover:!border-red-300 hover:!bg-red-50 hover:!text-red-700"
        onClick={() => {
          if (!confirm(`Delete “${name}”? All messages, voice notes and files in it are removed for everyone. This cannot be undone.`)) return;
          start(async () => { const r = await deleteRoom(roomId); if (r?.error) setError(r.error); });
        }}>
        <Trash2 size={15} aria-hidden /> {pending ? "Deleting…" : "Delete room"}
      </button>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </>
  );
}
