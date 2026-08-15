import assert from "node:assert/strict";
import test from "node:test";
import { isPayable, siteOrigin } from "./site.ts";

test("an offer is payable with a price, a fixed link, or both", () => {
  assert.equal(isPayable({ priceCents: 199900 }), true);
  assert.equal(isPayable({ payUrl: "https://square.link/u/abc" }), true);
  assert.equal(isPayable({ payUrl: "", priceCents: undefined }), false);
  // A zero price is not an offer you can pay for — Square rejects $0, and the
  // 0016 check constraint says so too.
  assert.equal(isPayable({ priceCents: 0 }), false);
});

// This one is here because it actually broke a deployment: a trailing slash in
// the environment variable made the webhook signature hash a URL Square had
// never seen, and every real payment was rejected as a forgery.
test("the site origin never keeps a trailing slash", () => {
  const cases = [
    "https://car-repair-coral.vercel.app/",
    "https://car-repair-coral.vercel.app///",
    "https://car-repair-coral.vercel.app",
  ];
  for (const value of cases) {
    process.env.NEXT_PUBLIC_SITE_URL = value;
    assert.equal(siteOrigin(), "https://car-repair-coral.vercel.app");
    assert.equal(`${siteOrigin()}/api/square/webhook`.includes("//api"), false);
  }
});

test("an unset origin is empty, not the string 'undefined'", () => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
  assert.equal(siteOrigin(), "");
});
