import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brand } from "@/lib/brand";

export function Landing() {
  return (
    <div className="-mt-8 grid gap-24">
      <section className="relative grid items-center gap-12 pt-12 lg:grid-cols-[1.05fr_1fr]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-[420px] [background-image:radial-gradient(circle,rgb(214_211_209)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div className="grid gap-6">
          <p className="eyebrow">{brand.eyebrow}</p>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">{brand.tagline}</h1>
          <p className="max-w-xl text-lg leading-relaxed text-stone-600 text-pretty">{brand.description}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={brand.cta.href} className="btn !px-5 !py-3 !text-base">
              {brand.cta.label} <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/login" className="btn-outline !px-5 !py-3 !text-base">I already have an account</Link>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-500">
            {brand.proof.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" aria-hidden /> {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-900/10">
          <div className="flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-4 py-3" aria-hidden>
            <span className="size-2.5 rounded-full bg-stone-300" />
            <span className="size-2.5 rounded-full bg-stone-300" />
            <span className="size-2.5 rounded-full bg-stone-300" />
          </div>
          {brand.preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.preview} alt={`${brand.name} app screen`} className="aspect-[16/10] w-full object-cover object-top" />
          ) : (
            <div className="grid aspect-[16/10] place-items-center bg-accent/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" className="size-28" />
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-10" aria-labelledby="features">
        <div className="grid max-w-2xl gap-3">
          <p className="eyebrow">Features</p>
          <h2 id="features" className="text-3xl font-semibold tracking-tight">Everything you need, nothing you don&apos;t</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brand.features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card grid gap-3 p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon size={20} aria-hidden />
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-stone-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-10" aria-labelledby="how">
        <div className="grid max-w-2xl gap-3">
          <p className="eyebrow">How it works</p>
          <h2 id="how" className="text-3xl font-semibold tracking-tight">Up and running in three steps</h2>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {brand.steps.map(([title, text], i) => (
            <li key={title} className="grid gap-3 border-t-2 border-accent pt-5">
              <span className="font-mono text-sm font-semibold text-accent">0{i + 1}</span>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-stone-600">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 rounded-3xl bg-stone-900 px-8 py-14 text-center text-white sm:px-16">
        <h2 className="text-3xl font-semibold tracking-tight text-balance">{brand.closing}</h2>
        <div>
          <Link href={brand.cta.href} className="btn !px-6 !py-3 !text-base">
            {brand.cta.label} <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
