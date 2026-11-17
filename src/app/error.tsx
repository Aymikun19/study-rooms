"use client";

import { TriangleAlert } from "lucide-react";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="grid justify-items-center gap-4">
        <span className="grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600"><TriangleAlert size={26} aria-hidden /></span>
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="max-w-sm text-stone-500">Please try again. If it keeps happening, refresh the page.</p>
        <button onClick={reset} className="btn">Try again</button>
      </div>
    </div>
  );
}
