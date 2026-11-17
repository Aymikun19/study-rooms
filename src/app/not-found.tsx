import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="grid justify-items-center gap-4">
        <span className="grid size-14 place-items-center rounded-2xl bg-accent/10 text-accent"><Compass size={26} aria-hidden /></span>
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="max-w-sm text-stone-500">That page doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Link href="/" className="btn">Back home</Link>
      </div>
    </div>
  );
}
