import assert from "node:assert/strict";
import test from "node:test";
import { warrantyStatus, EXPIRING_WINDOW_DAYS } from "./warranty.ts";

const TODAY = "2026-08-14";

test("no warranty is null, not expired", () => {
  // The whole reason this returns null: work with no cover sold must not
  // render a red "expired" badge.
  assert.equal(warrantyStatus(null, TODAY), null);
  assert.equal(warrantyStatus(undefined, TODAY), null);
  assert.equal(warrantyStatus("", TODAY), null);
});

test("past expiry is expired", () => {
  assert.equal(warrantyStatus("2026-08-13", TODAY), "expired");
  assert.equal(warrantyStatus("2020-01-01", TODAY), "expired");
});

test("expiring today still counts as cover, not expired", () => {
  assert.equal(warrantyStatus(TODAY, TODAY), "expiring");
});

test("inside the window is expiring, outside it is active", () => {
  // Exactly on the boundary counts as expiring — the customer should get the
  // warning on the day it becomes true, not the day after.
  assert.equal(warrantyStatus("2026-10-13", TODAY), "expiring"); // 60 days
  assert.equal(warrantyStatus("2026-10-14", TODAY), "active"); // 61
  assert.equal(EXPIRING_WINDOW_DAYS, 60);
});

test("a leap day doesn't shift the boundary", () => {
  // 2028 is a leap year: Jan 1 -> Mar 1 is 60 days, not 59.
  assert.equal(warrantyStatus("2028-03-01", "2028-01-01"), "expiring");
  assert.equal(warrantyStatus("2028-03-02", "2028-01-01"), "active");
});
