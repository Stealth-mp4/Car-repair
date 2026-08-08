/**
 * Run: npm test
 *
 * Guards the one piece of real logic in lib/site.ts — an expired promo must
 * never reach the promo bar or /promos. Getting this wrong means advertising a
 * deal the shop won't honour, so it gets a test even though nothing else here
 * does.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { activePromos, promos } from "./site.ts";

test("expired promos are dropped", () => {
  const wayPastEveryDeadline = new Date("2999-01-01T00:00:00Z");
  assert.deepEqual(activePromos(wayPastEveryDeadline), []);
});

test("live promos come back soonest deadline first", () => {
  const beforeEveryDeadline = new Date("2000-01-01T00:00:00Z");
  const live = activePromos(beforeEveryDeadline);

  assert.equal(live.length, promos.length);
  const deadlines = live.map((p) => new Date(p.endsAt).getTime());
  assert.deepEqual(deadlines, [...deadlines].sort((a, b) => a - b));
});

test("a promo expiring mid-window drops but its later sibling stays", () => {
  const [first] = [...promos].sort((a, b) => a.endsAt.localeCompare(b.endsAt));
  // One second after the soonest deadline: that offer is over, the rest aren't.
  const justAfter = new Date(new Date(first.endsAt).getTime() + 1000);
  const live = activePromos(justAfter);

  assert.equal(live.length, promos.length - 1);
  assert.ok(!live.some((p) => p.id === first.id));
});
