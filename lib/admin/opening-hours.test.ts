import assert from "node:assert/strict";
import test from "node:test";
import { parseOpeningHours } from "./opening-hours.ts";

/** Build the FormData the OpeningHoursForm posts. */
function form(rows: { days: string[]; opens: string; closes: string }[]) {
  const f = new FormData();
  f.set("rowCount", String(rows.length));
  rows.forEach((r, i) => {
    r.days.forEach((d) => f.append(`days-${i}`, d));
    f.set(`opens-${i}`, r.opens);
    f.set(`closes-${i}`, r.closes);
  });
  return f;
}

test("keeps valid blocks", () => {
  const { value } = parseOpeningHours(
    form([
      { days: ["Monday", "Tuesday"], opens: "09:00", closes: "17:00" },
      { days: ["Saturday"], opens: "10:30", closes: "23:15" },
    ]),
  );
  assert.deepEqual(value, [
    { days: ["Monday", "Tuesday"], opens: "09:00", closes: "17:00" },
    { days: ["Saturday"], opens: "10:30", closes: "23:15" },
  ]);
});

test("drops a block with no days rather than erroring", () => {
  const { value } = parseOpeningHours(form([{ days: [], opens: "09:00", closes: "17:00" }]));
  assert.deepEqual(value, []);
});

test("rejects a day that isn't a weekday", () => {
  const { value } = parseOpeningHours(form([{ days: ["Funday"], opens: "09:00", closes: "17:00" }]));
  assert.deepEqual(value, [], "unknown day must not reach schema.org output");
});

test("rejects a missing or malformed time", () => {
  assert.match(
    parseOpeningHours(form([{ days: ["Monday"], opens: "", closes: "17:00" }])).error!,
    /opening and a closing time/,
  );
  assert.match(
    parseOpeningHours(form([{ days: ["Monday"], opens: "9am", closes: "17:00" }])).error!,
    /opening and a closing time/,
  );
});

test("rejects closing at or before opening", () => {
  assert.match(
    parseOpeningHours(form([{ days: ["Monday"], opens: "17:00", closes: "09:00" }])).error!,
    /must be after/,
  );
  assert.match(
    parseOpeningHours(form([{ days: ["Monday"], opens: "09:00", closes: "09:00" }])).error!,
    /must be after/,
  );
});

test("rejects a day claimed by two blocks", () => {
  assert.match(
    parseOpeningHours(
      form([
        { days: ["Monday"], opens: "09:00", closes: "12:00" },
        { days: ["Monday"], opens: "13:00", closes: "17:00" },
      ]),
    ).error!,
    /more than one block/,
  );
});
