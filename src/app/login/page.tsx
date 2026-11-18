import { Check } from "lucide-react";
import { brand } from "@/lib/brand";
import { AuthForm } from "./AuthForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; mode?: string; error?: string }> }) {
  const { next, mode, error } = await searchParams;
  return (
    <div className="grid min-h-[75vh] place-items-center py-4">
      <div className="card grid w-full max-w-4xl overflow-hidden lg:grid-cols-2">
      <section className="hidden min-h-[560px] flex-col justify-between gap-10 bg-accent p-10 text-white lg:flex">
        <div className="flex items-center gap-3 text-lg font-semibold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="size-10 rounded-xl ring-2 ring-white/30" />
          {brand.name}
        </div>
        <div className="grid max-w-md gap-6">
          <p className="text-3xl font-semibold leading-tight tracking-tight">{brand.tagline}</p>
          <ul className="grid gap-3 text-white/90">
            {brand.features.slice(0, 3).map((f) => (
              <li key={f.title} className="flex gap-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/20"><Check size={13} aria-hidden /></span>
                {f.title}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-white/70">Built by Olopade Oreoluwa</p>
      </section>
      <section className="grid place-items-center gap-4 px-6 py-12 sm:px-12">
        {error === "link" && <p role="alert" className="w-full max-w-sm rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">That link has expired or was already used. Request a new one.</p>}
        <AuthForm next={next ?? "/"} initialMode={mode === "signup" ? "signup" : "signin"} />
      </section>
      </div>
    </div>
  );
}
