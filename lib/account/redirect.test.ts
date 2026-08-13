import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNext } from "./redirect.ts";

test("safeNext keeps site-relative paths", () => {
  assert.equal(safeNext("/promos"), "/promos");
  assert.equal(safeNext("/account/billing"), "/account/billing");
});

test("safeNext refuses anything that leaves the site", () => {
  // The open-redirect cases: protocol-relative, absolute, and scheme URLs all
  // fall back to the dashboard rather than sending a signed-in customer off-site.
  assert.equal(safeNext("//evil.example"), "/account");
  assert.equal(safeNext("https://evil.example"), "/account");
  assert.equal(safeNext("javascript:alert(1)"), "/account");
  assert.equal(safeNext(null), "/account");
  assert.equal(safeNext(""), "/account");
});
