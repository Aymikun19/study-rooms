import type { LucideIcon } from "lucide-react";

export function Stat({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon?: LucideIcon }) {
  return (
    <div className="card flex items-start justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
        <p className="mt-1 truncate text-xl font-semibold tabular-nums tracking-tight lg:text-2xl" title={value}>{value}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-stone-500">{hint}</p>}
      </div>
      {Icon && (
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
          <Icon size={18} aria-hidden />
        </span>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, children }: { icon: LucideIcon; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="card grid place-items-center gap-3 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent">
        <Icon size={22} aria-hidden />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        {text && <p className="mt-1 max-w-sm text-sm text-stone-500">{text}</p>}
      </div>
      {children}
    </div>
  );
}
