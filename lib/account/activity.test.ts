import assert from "node:assert/strict";
import test from "node:test";
import { activityFeed } from "./activity.ts";

const customer = { joined: "2025-01-18", name: "Marcus Delgado" };
const empty = { customer, serviceRecords: [], appointments: [], claims: [] };

test("a brand-new account still has one entry, not an empty feed", () => {
  const feed = activityFeed(empty);
  assert.equal(feed.length, 1);
  assert.equal(feed[0].label, "Account created");
  assert.equal(feed[0].date, "2025-01-18");
});

test("newest first, across all four sources", () => {
  const feed = activityFeed({
    customer,
    serviceRecords: [{ id: "sr-1", service: "PPF", date: "2025-03-04" }],
    appointments: [
      { id: "apt-1", service: "Tint", createdAt: "2026-08-01T09:30:00Z", status: "pending" },
    ],
    claims: [{ id: "c-1", headline: "$1,999 wrap", claimedAt: "2026-08-02T14:00:00Z" }],
  });
  assert.deepEqual(
    feed.map((e) => e.date),
    ["2026-08-02", "2026-08-01", "2025-03-04", "2025-01-18"],
  );
});

test("timestamps are cut to the day the feed groups by", () => {
  const [entry] = activityFeed({
    ...empty,
    claims: [{ id: "c-1", headline: "x", claimedAt: "2026-08-02T23:59:59.999Z" }],
  });
  assert.equal(entry.date, "2026-08-02");
});

test("an appointment reports the status it reached, not 'requested' forever", () => {
  const label = (status: string) =>
    activityFeed({
      ...empty,
      appointments: [{ id: "a", service: "Tint", createdAt: "2026-08-01T09:00:00Z", status }],
    })[0].label;

  assert.equal(label("pending"), "Appointment requested");
  assert.equal(label("confirmed"), "Appointment confirmed");
  assert.equal(label("completed"), "Appointment completed");
  assert.equal(label("cancelled"), "Appointment cancelled");
});

test("same-day entries keep a stable order between renders", () => {
  // Marcus really does have two services fitted on one day, so this is the
  // normal case, not a contrived one.
  const sources = {
    customer,
    serviceRecords: [
      { id: "sr-002", service: "Ceramic Tint", date: "2025-01-22" },
      { id: "sr-001", service: "PPF", date: "2025-01-22" },
    ],
    appointments: [],
    claims: [],
  };
  const once = activityFeed(sources).map((e) => e.id);
  const twice = activityFeed({ ...sources, serviceRecords: [...sources.serviceRecords].reverse() });
  assert.deepEqual(once, twice.map((e) => e.id));
});

test("entry ids are unique, so React keys don't collide", () => {
  const feed = activityFeed({
    customer,
    serviceRecords: [{ id: "1", service: "PPF", date: "2025-01-22" }],
    // Same bare id as the service record above — the prefixes are what keep
    // these apart.
    appointments: [{ id: "1", service: "Tint", createdAt: "2025-01-22T09:00:00Z", status: "pending" }],
    claims: [{ id: "1", headline: "x", claimedAt: "2025-01-22T09:00:00Z" }],
  });
  assert.equal(new Set(feed.map((e) => e.id)).size, feed.length);
});
