/**
 * StatusPill — the console's one status device: hairline pill, tinted text,
 * 8% tinted border. No filled backgrounds and no dots, so a table of twenty
 * rows never turns into a traffic-light wall. Tones are assigned centrally in
 * lib/admin/sections.tsx (`toneFor`), never per call site.
 */

export type Tone = "ok" | "warn" | "bad" | "accent" | "muted";

const toneClass: Record<Tone, string> = {
  ok: "border-ok/35 text-ok",
  warn: "border-warn/40 text-warn",
  bad: "border-red/45 text-red",
  accent: "border-maroon text-cream",
  muted: "border-line text-muted",
};

export default function StatusPill({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`mono-label inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 capitalize ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}
