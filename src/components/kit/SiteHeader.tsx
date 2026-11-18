import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { brand } from "@/lib/brand";

export function SiteHeader({ email }: { email?: string | null }) {
  const nav = brand.nav.filter((n) => email || n.public);
  const initials = (email ?? "?").slice(0, 2).toUpperCase();
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-white/80 backdrop-blur print:hidden">
      <nav className={`mx-auto flex h-16 items-center justify-between gap-4 px-4 ${brand.width}`}>
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={28} height={28} className="size-7" />
          {brand.name}
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <div className="hidden items-center gap-1 sm:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-stone-600 transition hover:bg-stone-100 hover:text-stone-900">
                {n.label}
              </Link>
            ))}
          </div>
          {email ? (
            <details className="relative ml-1">
              <summary
                aria-label="Account menu"
                className="grid size-9 cursor-pointer list-none place-items-center rounded-full bg-accent text-xs font-semibold text-white ring-offset-2 transition hover:ring-2 hover:ring-accent/40 [&::-webkit-details-marker]:hidden"
              >
                {initials}
              </summary>
              <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl">
                <p className="truncate px-3 py-2 text-xs text-stone-500">Signed in as<br /><span className="text-sm font-medium text-stone-800">{email}</span></p>
                <div className="my-1 border-t border-stone-100 sm:hidden" />
                {nav.map((n) => (
                  <Link key={n.href} href={n.href} className="block rounded-lg px-3 py-2 hover:bg-stone-100 sm:hidden">
                    {n.label}
                  </Link>
                ))}
                <div className="my-1 border-t border-stone-100" />
                <Link href="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-stone-100"><Settings size={15} aria-hidden /> Account settings</Link>
                <form action="/auth/signout" method="post">
                  <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50">
                    <LogOut size={15} aria-hidden /> Sign out
                  </button>
                </form>
              </div>
            </details>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900">Sign in</Link>
              <Link href="/login?mode=signup" className="btn !py-2">Get started</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-stone-200/70 print:hidden">
      <div className={`mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-stone-500 ${brand.width}`}>
        <p className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={18} height={18} className="size-[18px]" />
          {brand.name} · built by{" "}
          <a href="https://oreoluwa-olopade.vercel.app" className="font-medium text-stone-700 hover:text-accent">Olopade Oreoluwa</a>
        </p>
        <a href={brand.repo} className="hover:text-accent">Source on GitHub</a>
      </div>
    </footer>
  );
}
