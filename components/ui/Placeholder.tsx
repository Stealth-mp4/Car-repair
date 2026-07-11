/**
 * Placeholder — consistent scaffold body for routes whose full section content
 * is built later. Uses the real type + token system so pages are on-brand now.
 */
export default function Placeholder({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className="min-h-[70vh] pb-24 pt-36"
      style={{ paddingInline: "var(--gutter)" }}
    >
      <p className="mono-label">{label}</p>
      <h1 className="display mt-4 max-w-4xl text-ink">{title}</h1>
      {children ? <div className="mt-6 max-w-2xl text-muted">{children}</div> : null}
      <p className="mono-label mt-12 text-muted/60">Scaffold — section build pending</p>
    </section>
  );
}
