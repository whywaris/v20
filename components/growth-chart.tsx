import { compact } from "@/lib/format";

type Point = { date: string; value: number };

// Server-rendered SVG line chart. Hover a dot for its value; "Show the numbers" gives the table.
export function GrowthChart({ points, label }: { points: Point[]; label: string }) {
  const W = 600, H = 200, L = 48, B = 22, T = 8;
  const values = points.map((p) => p.value);
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const x = (i: number) => L + (i / Math.max(points.length - 1, 1)) * (W - L - 4);
  const y = (v: number) => T + (1 - (v - min) / span) * (H - T - B);
  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");
  const ticks = [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${label} from ${compact(points[0].value)} on ${points[0].date} to ${compact(values.at(-1))} on ${points.at(-1)!.date}`}>
        {[max, (max + min) / 2, min].map((v) => (
          <g key={v} className="text-neutral-400">
            <line x1={L} x2={W} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity="0.25" />
            <text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="currentColor">{compact(v)}</text>
          </g>
        ))}
        {ticks.map((i) => (
          <text key={i} x={x(i)} y={H - 4} textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"} fontSize="11" className="fill-neutral-400">
            {points[i].date.slice(5)}
          </text>
        ))}
        <polygon points={`${L},${H - B} ${line} ${x(points.length - 1)},${H - B}`} className="fill-blue-500/10" />
        <polyline points={line} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={p.date} cx={x(i)} cy={y(p.value)} r={points.length > 60 ? 1.5 : 3} className="fill-blue-600 dark:fill-blue-400">
            <title>{`${p.date}: ${p.value.toLocaleString("en")}`}</title>
          </circle>
        ))}
      </svg>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-neutral-500">Show the numbers</summary>
        <table className="mt-2 w-full max-w-sm text-left">
          <thead className="text-neutral-500"><tr><th>Date</th><th className="text-right">{label}</th></tr></thead>
          <tbody>{[...points].reverse().map((p) => <tr key={p.date} className="border-t"><td className="py-1">{p.date}</td><td className="text-right">{p.value.toLocaleString("en")}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}
