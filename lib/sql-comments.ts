/**
 * lib/sql-comments.ts — does a .sql file's block comments balance?
 *
 * Exists because of a real failure: 0013 shipped with a header mentioning a
 * path written as content-slash-star-dot-json, and the whole migration died in
 * the SQL editor with an unterminated-comment error pointing at line 1.
 *
 * The trap is that **Postgres block comments NEST**, unlike C. A slash-star
 * sequence inside an existing comment opens a SECOND comment, so the closing
 * marker at the end of the header only gets you back to depth 1 and every
 * statement after it is silently swallowed. Glob paths in prose are the obvious
 * way to write one by accident; so is a comment explaining this bug.
 *
 * There is no migration runner here — files are pasted into Supabase's SQL
 * editor by hand (see HANDOVER.md) — so a lint in `npm test` is the only thing
 * standing between this mistake and a failed paste.
 *
 * Import-free so `node --test` can load it.
 */

export type CommentScan = {
  /** 0 when balanced; >0 means that many comments were left open. */
  depth: number;
  /** 1-based lines of the openers that were never closed. */
  unclosed: number[];
};

/**
 * A Postgres lexer, deliberately only as deep as this question needs: block
 * comments, line comments, and string literals. It tracks strings because
 * a slash-star inside one is data, not a comment — the seed values in these
 * migrations are full of prose.
 */
export function scanBlockComments(sql: string): CommentScan {
  let i = 0;
  const n = sql.length;
  let depth = 0;
  const opens: number[] = [];
  // Running newline count, so this stays O(n) rather than re-counting the
  // prefix at every marker.
  let line = 1;

  while (i < n) {
    const c = sql[i];
    const two = sql.slice(i, i + 2);

    if (depth > 0) {
      // Inside a comment nothing else is special — not quotes, not double
      // dashes. Only the two nesting markers.
      if (two === "/*") {
        depth++;
        opens.push(line);
        i += 2;
        continue;
      }
      if (two === "*/") {
        depth--;
        opens.pop();
        i += 2;
        continue;
      }
      if (c === "\n") line++;
      i++;
      continue;
    }

    if (two === "--") {
      const nl = sql.indexOf("\n", i);
      if (nl < 0) break;
      i = nl + 1;
      line++;
      continue;
    }

    if (c === "'") {
      i++;
      while (i < n) {
        if (sql[i] === "\n") line++;
        if (sql[i] === "'") {
          // '' is an escaped quote, not the end of the literal.
          if (sql.slice(i, i + 2) === "''") {
            i += 2;
            continue;
          }
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    if (two === "/*") {
      depth++;
      opens.push(line);
      i += 2;
      continue;
    }

    if (c === "\n") line++;
    i++;
  }

  return { depth, unclosed: opens };
}
