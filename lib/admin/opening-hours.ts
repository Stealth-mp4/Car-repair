/**
 * Structured opening hours — the schema.org side of the settings page.
 *
 * Deliberately import-free so `node --test` can load it directly: this is the
 * one settings group nobody proof-reads, because it renders into JSON-LD rather
 * than onto a page a human looks at, so a bad value gets published to search
 * engines and sits there.
 */

export type OpeningHours = { days: string[]; opens: string; closes: string }[];

/** Monday-first, matching how the schema and every rota in the world reads. */
export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** Parse the OpeningHoursForm's post into the shape stored in settings. */
export function parseOpeningHours(
  form: FormData,
): { value: OpeningHours; error?: undefined } | { error: string; value?: undefined } {
  const count = Number(form.get("rowCount") ?? 0);
  const value: OpeningHours = [];

  for (let i = 0; i < count; i++) {
    // Whitelisted against WEEKDAYS rather than taken as posted: these strings
    // go straight into schema.org output, where "Funday" is not a thing.
    const days = form
      .getAll(`days-${i}`)
      .map(String)
      .filter((d) => (WEEKDAYS as readonly string[]).includes(d));
    const opens = String(form.get(`opens-${i}`) ?? "");
    const closes = String(form.get(`closes-${i}`) ?? "");

    // A row with no days is how you delete one.
    if (days.length === 0) continue;

    if (!/^\d{2}:\d{2}$/.test(opens) || !/^\d{2}:\d{2}$/.test(closes)) {
      return { error: "Every block needs an opening and a closing time." };
    }
    if (closes <= opens) {
      // Zero-length and backwards ranges are the classic way to tell Google
      // you're never open. Overnight hours would need a second block.
      return { error: `Closing time must be after opening time (${opens}–${closes}).` };
    }
    value.push({ days, opens, closes });
  }

  const claimed = value.flatMap((v) => v.days);
  if (new Set(claimed).size !== claimed.length) {
    return { error: "A day appears in more than one block." };
  }
  return { value };
}
