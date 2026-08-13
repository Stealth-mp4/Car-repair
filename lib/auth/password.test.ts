import assert from "node:assert/strict";
import test from "node:test";
import { MIN_PASSWORD_LENGTH, validatePassword } from "./password.ts";

test("accepts a long enough matching pair", () => {
  assert.equal(validatePassword("correct-horse-battery", "correct-horse-battery"), null);
});

test("rejects anything under the minimum", () => {
  const short = "a".repeat(MIN_PASSWORD_LENGTH - 1);
  assert.match(validatePassword(short, short)!, /at least/);
});

test("rejects a mismatch even when both are long enough", () => {
  assert.match(validatePassword("a".repeat(12), "b".repeat(12))!, /don't match/);
});

test("length is checked before the match, so a short pair says so", () => {
  // Both wrong: the length message is the more useful one to lead with.
  assert.match(validatePassword("short", "different")!, /at least/);
});
