import assert from "node:assert/strict";
import test from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { scanBlockComments } from "./sql-comments.ts";

const MIGRATIONS = join(import.meta.dirname, "..", "supabase", "migrations");

/**
 * The one that matters: every migration must actually be pasteable. This is a
 * regression test for 0013, which died in the SQL editor with an unterminated
 * comment because its header mentioned a glob path.
 */
test("every migration's block comments balance", () => {
  const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql"));
  assert.ok(files.length > 0, "no migrations found — has the path moved?");

  for (const file of files) {
    const { depth, unclosed } = scanBlockComments(readFileSync(join(MIGRATIONS, file), "utf8"));
    assert.equal(
      depth,
      0,
      `${file}: ${depth} unterminated block comment(s), opened at line(s) ${unclosed.join(", ")}. ` +
        `Postgres block comments nest — a slash-star inside a comment opens another one.`,
    );
  }
});

test("balanced input scans clean", () => {
  assert.deepEqual(scanBlockComments("/* hi */ select 1;"), { depth: 0, unclosed: [] });
  assert.deepEqual(scanBlockComments("select 1; -- /* not a comment\n"), {
    depth: 0,
    unclosed: [],
  });
});

test("nesting is counted, which is the whole point", () => {
  // C would call this balanced. Postgres does not.
  const { depth, unclosed } = scanBlockComments("/* outer /* inner */\nselect 1;");
  assert.equal(depth, 1);
  assert.deepEqual(unclosed, [1]);

  assert.equal(scanBlockComments("/* outer /* inner */ */ select 1;").depth, 0);
});

test("the exact shape that broke 0013", () => {
  const header = `/* a comment mentioning content/service-records/*.json
 * ------- */
select 1;`;
  const { depth, unclosed } = scanBlockComments(header);
  assert.equal(depth, 1, "the glob path opens a nested comment the closer doesn't reach");
  assert.deepEqual(unclosed, [1]);
});

test("a slash-star inside a string literal is data, not a comment", () => {
  // The seed inserts are full of prose; a false positive here would be worse
  // than no check at all.
  assert.equal(scanBlockComments("insert into t values ('see /* this */ path');").depth, 0);
  assert.equal(scanBlockComments("select 'it''s /* fine */';").depth, 0);
});

test("reports the line of the opener, not the end of the file", () => {
  const { unclosed } = scanBlockComments("select 1;\nselect 2;\n/* opened here\nselect 3;");
  assert.deepEqual(unclosed, [3]);
});
