/** Small dependency-free charts that render on the server. */

export function BarChart({
  data,
  height = 160,
  format = (n: number) => String(n),
  label,
}: {
  data: { label: string; value: number; hint?: string }[];
  height?: number;
  format?: (n: number) => string;
  label: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure aria-label={label} className="grid gap-2">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
            <div
              className="min-h-[2px] rounded-t-md bg-accent/80 transition group-hover:bg-accent"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
            <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-stone-900 px-2 py-1 text-xs text-white group-hover:block">
              {d.hint ?? `${d.label}: ${format(d.value)}`}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 text-[11px] text-stone-500">
        {data.map((d, i) => (
          <span key={i} className="relative h-4 flex-1">
            {(data.length <= 8 || i % Math.ceil(data.length / 7) === 0) && (
              <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">{d.label}</span>
            )}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">
        {data.map((d) => `${d.label}: ${format(d.value)}`).join(", ")}
      </figcaption>
    </figure>
  );
}

export function Sparkline({ values, width = 120, height = 32 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const max = Math.max(1, ...values);
  const step = width / (values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(height - 2 - (v / max) * (height - 4)).toFixed(1)}`);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="text-accent">
      <polyline points={pts.join(" ")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} className="h-2 overflow-hidden rounded-full bg-stone-100">
      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
