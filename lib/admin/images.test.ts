import assert from "node:assert/strict";
import test from "node:test";
import { isUploaded, objectPath } from "./images.ts";

const UPLOADED =
  "https://hmmwqszqfapjskryufvs.supabase.co/storage/v1/object/public/promo-images/promo-abc/9f1.jpg";

test("recognises a file we uploaded", () => {
  assert.equal(isUploaded(UPLOADED), true);
  assert.equal(objectPath(UPLOADED), "promo-abc/9f1.jpg");
});

// The important half: these are files in the repo, and deleting one on the
// shop's behalf breaks the site with no way back through the console.
test("leaves images that ship with the site alone", () => {
  for (const src of ["/VINYL_WRAP.webp", "/PPF.webp", "", null, undefined]) {
    assert.equal(isUploaded(src), false, `${src} should not look uploaded`);
    assert.equal(objectPath(src), null);
  }
});

test("ignores another bucket's files", () => {
  const other =
    "https://hmmwqszqfapjskryufvs.supabase.co/storage/v1/object/public/passport-photos/cust-1/a.jpg";
  assert.equal(isUploaded(other), false);
  assert.equal(objectPath(other), null);
});

test("decodes an escaped key and drops a query string", () => {
  assert.equal(objectPath(`${UPLOADED}?v=2`), "promo-abc/9f1.jpg");
  assert.equal(
    objectPath(UPLOADED.replace("9f1.jpg", "my%20photo.jpg")),
    "promo-abc/my photo.jpg",
  );
});
