import assert from "node:assert/strict";
import test from "node:test";
import { leadChannel, leadPreview, leadSubject, vehicleLabel } from "./lead-summary.ts";

const full = {
  source: "quote",
  vehicle: { year: "2023", make: "Tesla", model: "Model 3", vin: "5YJ3E1EB4PF119284" },
  services: ["Paint Protection Film", "Ceramic Coating"],
  details: { colorFinish: "Satin black", timeline: "Next month" },
  appointment: { date: "2026-08-20", time: "10:00" },
  photos: ["front.jpg", "rear.jpg"],
  contact: { name: "Ada Bell", phone: "(713) 555-0188", email: "ada@example.com", method: "text" },
  note: "Wants it done before a wedding.",
};

test("subject names the source and the car", () => {
  assert.equal(leadSubject(full), "Quote request — 2023 Tesla Model 3");
});

test("subject survives a lead with no vehicle", () => {
  assert.equal(leadSubject({ source: "chat" }), "Chat enquiry");
  assert.equal(leadSubject({}), "Website enquiry");
});

test("vehicleLabel skips the parts that weren't filled in", () => {
  assert.equal(vehicleLabel({ vehicle: { make: "Tesla" } }), "Tesla");
  assert.equal(vehicleLabel({}), "");
});

test("preview leads with how to reach them", () => {
  const first = leadPreview(full).split("\n")[0];
  assert.match(first, /\(713\) 555-0188/);
  assert.match(first, /ada@example\.com/);
  assert.match(first, /prefers text/);
});

test("preview carries every field the form collected", () => {
  const body = leadPreview(full);
  for (const expected of [
    "Paint Protection Film, Ceramic Coating",
    "5YJ3E1EB4PF119284",
    "Satin black",
    "Next month",
    "2026-08-20 at 10:00",
    "2 photo(s)",
    "wedding",
  ]) {
    assert.ok(body.includes(expected), `missing from preview: ${expected}`);
  }
});

test("blank fields are omitted, not printed as empty labels", () => {
  const body = leadPreview({ contact: { name: "Ada", phone: "5551234" } });
  assert.equal(body, "5551234");
  assert.ok(!body.includes("Wants:"));
  assert.ok(!body.includes("Timeline"));
});

test("a phone-only lead still produces a usable line", () => {
  assert.equal(leadPreview({ contact: { phone: "5551234" } }), "5551234");
});

test("channel distinguishes the chat widget from the forms", () => {
  assert.equal(leadChannel("chat"), "Chat");
  assert.equal(leadChannel("quote"), "Web form");
  assert.equal(leadChannel(undefined), "Web form");
});
