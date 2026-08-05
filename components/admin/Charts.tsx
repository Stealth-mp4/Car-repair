"use client";

import { useState } from "react";
import {
  useAdmin,
  projectBreakdown,
  topServices,
  type ChartPeriod,
} from "@/lib/admin/store";
import { revenueSeries, revenueBreakdown, deltas } from "@/lib/admin/data";
import { compact, currency } from "@/lib/admin/format";
import { Panel, ScrollX } from "@/components/admin/Panel";
import { ArrowUpIcon, ChevronIcon } from "@/components/admin/icons";

/* ---- Shared period select ------------------------------------------------ */

const periodLabel: Record<ChartPeriod, string> = {
  week: "This Week",
  month: "This Month",
  year: "This Year",
};

export function PeriodSelect({
  value,
  onChange,
  label,
}: {
  value: ChartPeriod;
  onChange: (p: ChartPeriod) => void;
  label: string;
}) {
  return (
    <span className="relative inline-flex items-center">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as ChartPeriod)}
        className="mono-label appearance-none rounded-input border border-line bg-black py-2 pl-3 pr-8 text-cream outline-none transition-colors hover:border-maroon focus:border-red"
      >
        {(Object.keys(periodLabel) as ChartPeriod[]).map((p) => (
          <option key={p} value={p} className="bg-black">
            {periodLabel[p]}
          </option>
        ))}
      </select>
      <ChevronIcon className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted" />
    </span>
  );
}

/* ---- Revenue line chart --------------------------------------------------
 * Hand-rolled SVG rather than a charting dependency: it's one polyline, one
 * area fill, and five gridlines. A library would add ~100KB to ship the same
 * seven points.
 * ------------------------------------------------------------------------- */

const W = 720;
const H = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 46 };

export function RevenueChart() {
  const period = useAdmin((s) => s.ui.chartPeriod);
  const setPeriod = useAdmin((s) => s.setChartPeriod);
  const [hover, setHover] = useState<number | null>(null);

  const points = revenueSeries[period];
  const max = Math.ceil(Math.max(...points.map((p) => p.value)) / 5000) * 5000;
  const total = points.reduce((sum, p) => sum + p.value, 0);

  const x = (i: number) =>
    PAD.left + (i * (W - PAD.left - PAD.right)) / Math.max(1, points.length - 1);
  const y = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom);

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`)
    .join(" ");
  const area = `${line} L${x(points.length - 1)},${H - PAD.bottom} L${x(0)},${H - PAD.bottom} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

  return (
    <Panel
      title="Revenue Overview"
      action={<PeriodSelect value={period} onChange={setPeriod} label="Revenue period" />}
    >
      <ScrollX min="min-w-[34rem]">
        <div className="px-5 pt-5">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
              {currency(total)}
            </p>
            <p className="mono-label flex items-center gap-1 text-ok">
              <ArrowUpIcon className="h-3 w-3" />
              {deltas.revenueVsPrior}% vs prior {period}
            </p>
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mt-4 w-full"
            role="img"
            aria-label={`Revenue by ${period}, total ${currency(total)}`}
            onMouseLeave={() => setHover(null)}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y(t)}
                  y2={y(t)}
                  stroke="var(--color-line)"
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 8}
                  y={y(t) + 4}
                  textAnchor="end"
                  className="fill-muted font-mono text-[10px]"
                >
                  {compact(t)}
                </text>
              </g>
            ))}

            <defs>
              <linearGradient id="revfill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-red)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--color-red)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#revfill)" />
            <path d={line} fill="none" stroke="var(--color-red)" strokeWidth="2" />

            {points.map((p, i) => (
              <g key={p.label}>
                <text
                  x={x(i)}
                  y={H - 8}
                  textAnchor="middle"
                  className="fill-muted font-mono text-[10px]"
                >
                  {p.label}
                </text>
                {/* generous invisible hit area — the 4px dot is far too small to aim at */}
                <rect
                  x={x(i) - 22}
                  y={PAD.top}
                  width={44}
                  height={H - PAD.top - PAD.bottom}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                />
                <circle
                  cx={x(i)}
                  cy={y(p.value)}
                  r={hover === i ? 5 : 3.5}
                  fill="var(--color-red)"
                  stroke="var(--color-black-raised)"
                  strokeWidth="2"
                />
                {hover === i && (
                  <text
                    x={x(i)}
                    y={y(p.value) - 12}
                    textAnchor="middle"
                    className="fill-cream font-mono text-[11px]"
                  >
                    {compact(p.value)}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
      </ScrollX>

      <dl className="grid grid-cols-2 gap-3 border-t border-line p-5 xl:grid-cols-4">
        {[
          ["Total Sales", revenueBreakdown.totalSales],
          ["Service Revenue", revenueBreakdown.serviceRevenue],
          ["Product Sales", revenueBreakdown.productSales],
          ["Avg. Order Value", revenueBreakdown.avgOrderValue],
        ].map(([label, value]) => (
          <div
            key={label as string}
            className="rounded-input border border-line px-4 py-3 text-center"
          >
            <dt className="mono-label">{label}</dt>
            <dd className="mt-1 font-display text-lg tracking-tight text-ink">
              {currency(value as number)}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

/* ---- Projects donut ------------------------------------------------------ */

const segmentColor: Record<string, string> = {
  "in-progress": "var(--color-red)",
  pending: "var(--color-warn)",
  completed: "var(--color-ok)",
  "on-hold": "var(--color-muted)",
};

const segmentLabel: Record<string, string> = {
  "in-progress": "In Progress",
  pending: "Pending",
  completed: "Completed",
  "on-hold": "On Hold",
};

export function ProjectsDonut() {
  const { total, segments } = projectBreakdown(useAdmin());

  const R = 54;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <Panel title="Projects Overview" className="h-full">
      <div className="flex flex-col items-center gap-6 p-5 sm:flex-row sm:justify-center">
        <div className="relative shrink-0">
          <svg viewBox="0 0 140 140" className="h-40 w-40 -rotate-90">
            <circle
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke="var(--color-line)"
              strokeWidth="16"
            />
            {segments.map((s) => {
              const len = total ? (s.count / total) * C : 0;
              const dash = `${len} ${C - len}`;
              const el = (
                <circle
                  key={s.status}
                  cx="70"
                  cy="70"
                  r={R}
                  fill="none"
                  stroke={segmentColor[s.status]}
                  strokeWidth="16"
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                />
              );
              offset += len;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl tracking-tight text-ink">{total}</span>
            <span className="mono-label mt-0.5">Total Projects</span>
          </div>
        </div>

        <ul className="w-full max-w-[13rem] space-y-2.5">
          {segments.map((s) => (
            <li key={s.status} className="flex items-center gap-2.5 text-sm">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: segmentColor[s.status] }}
              />
              <span className="flex-1 text-cream">{segmentLabel[s.status]}</span>
              <span className="mono-label text-ink">{s.count}</span>
              <span className="mono-label w-10 text-right">({s.pct}%)</span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

/* ---- Top services -------------------------------------------------------- */

export function TopServices() {
  const period = useAdmin((s) => s.ui.servicesPeriod);
  const setPeriod = useAdmin((s) => s.setServicesPeriod);
  const rows = topServices(useAdmin());
  const max = Math.max(1, ...rows.map((r) => r.bookings));

  return (
    <Panel
      title="Top Services"
      className="h-full"
      action={
        <PeriodSelect value={period} onChange={setPeriod} label="Top services period" />
      }
    >
      <ul className="space-y-4 p-5">
        {rows.map((s) => (
          <li key={s.slug} className="flex items-center gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-input border border-line text-muted">
              <span className="mono-label">{s.title.slice(0, 2).toUpperCase()}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-cream">{s.title}</span>
              <span className="mt-2 block h-1 rounded-full bg-line">
                <span
                  className="block h-1 rounded-full bg-red"
                  style={{ width: `${(s.bookings / max) * 100}%` }}
                />
              </span>
            </span>
            <span className="mono-label w-6 text-right text-ink">{s.bookings}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
