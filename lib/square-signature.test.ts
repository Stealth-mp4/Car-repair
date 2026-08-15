import assert from "node:assert/strict";
import test from "node:test";
import { createHmac } from "node:crypto";
import { verifySignature } from "./square-signature.ts";

const KEY = "test-signature-key";
const URL = "https://example.com/api/square/webhook";
const BODY = '{"type":"payment.created","data":{"id":"pay_1"}}';

const sign = (url: string, body: string, key = KEY) =>
  createHmac("sha256", key).update(url + body).digest("base64");

test("accepts a signature Square would have sent", () => {
  assert.equal(verifySignature(BODY, sign(URL, BODY), URL, KEY), true);
});

test("rejects a body that was tampered with in flight", () => {
  const forged = BODY.replace("pay_1", "pay_2");
  assert.equal(verifySignature(forged, sign(URL, BODY), URL, KEY), false);
});

test("rejects a signature made with the wrong key", () => {
  assert.equal(verifySignature(BODY, sign(URL, BODY, "someone-elses-key"), URL, KEY), false);
});

// The subscription's URL is part of the signed string, so these are the
// configuration slips that look like "the webhook just doesn't work".
test("rejects when the notification URL doesn't match the subscription exactly", () => {
  const sig = sign(URL, BODY);
  assert.equal(verifySignature(BODY, sig, URL + "/", KEY), false);
  assert.equal(verifySignature(BODY, sig, URL.replace("https", "http"), KEY), false);
});

test("re-serialising the JSON breaks it — the route must use the raw body", () => {
  // Same object, different bytes: key order isn't preserved by a parse/stringify
  // round trip, and the hash is over bytes.
  const reserialised = JSON.stringify({ data: { id: "pay_1" }, type: "payment.created" });
  assert.notEqual(reserialised, BODY);
  assert.equal(verifySignature(reserialised, sign(URL, BODY), URL, KEY), false);
});

test("a missing header or missing key is a rejection, not a crash", () => {
  assert.equal(verifySignature(BODY, null, URL, KEY), false);
  assert.equal(verifySignature(BODY, sign(URL, BODY), URL, undefined), false);
  // Wrong length would make timingSafeEqual throw if it weren't guarded.
  assert.equal(verifySignature(BODY, "short", URL, KEY), false);
});
