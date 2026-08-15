import assert from "node:assert/strict";
import test from "node:test";
import { firstName, lastName, fullName } from "./name.ts";

test("splits an ordinary two-part name", () => {
  assert.equal(firstName({ name: "Marcus Delgado" }), "Marcus");
  assert.equal(lastName({ name: "Marcus Delgado" }), "Delgado");
});

test("keeps every part of a longer surname", () => {
  assert.equal(lastName({ name: "Ana Maria Delgado Ruiz" }), "Maria Delgado Ruiz");
});

test("a one-word name has no surname, and that is not an error", () => {
  assert.equal(firstName({ name: "Cher" }), "Cher");
  assert.equal(lastName({ name: "Cher" }), "");
});

test("tolerates the whitespace a text column actually holds", () => {
  assert.equal(firstName({ name: "  Marcus   Delgado " }), "Marcus");
  assert.equal(lastName({ name: "  Marcus   Delgado " }), "Delgado");
});

test("round-trips, including through a blank surname", () => {
  for (const name of ["Marcus Delgado", "Cher", "Ana Maria Delgado Ruiz"]) {
    assert.equal(fullName(firstName({ name }), lastName({ name })), name);
  }
});
