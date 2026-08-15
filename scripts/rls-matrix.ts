/**
 * Signs in as one staff member per role and asks the database what it will
 * hand over. This is the enforcing layer — lib/admin/access.ts only hides
 * sidebar links.
 *
 * Read-only except for a single throwaway insert per table, which is expected
 * to be refused; anything that slips through is deleted with the secret key at
 * the end and reported loudly.
 */
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const svc = createClient(URL, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });

/**
 * Credentials come from the environment, never from this file — it is a normal
 * tracked source file and a staff password in it would be a password in git.
 *
 *   RLS_OWNER=ryan@…:pw RLS_MANAGER=… RLS_TECH=… RLS_DESK=… npx tsx --env-file=.env.local scripts/rls-matrix.ts
 */
const USERS = (
  [
    ["Super Admin", process.env.RLS_OWNER],
    ["Manager", process.env.RLS_MANAGER],
    ["Technician", process.env.RLS_TECH],
    ["Front desk", process.env.RLS_DESK],
  ] as const
)
  .filter(([, pair]) => pair)
  .map(([role, pair]) => {
    const i = pair!.indexOf(":");
    return [role, pair!.slice(0, i), pair!.slice(i + 1)] as const;
  });

/** table -> roles that SHOULD be able to read it, per lib/admin/access.ts. */
const EXPECT: Record<string, string[]> = {
  appointments: ["Super Admin", "Manager", "Technician", "Front desk"],
  projects: ["Super Admin", "Manager", "Technician", "Front desk"],
  vehicles: ["Super Admin", "Manager", "Technician", "Front desk"],
  admin_vehicles: ["Super Admin", "Manager", "Technician", "Front desk"],
  // Shop-floor, like vehicles — see staff_manages_service_records in 0013.
  service_records: ["Super Admin", "Manager", "Technician", "Front desk"],
  admin_service_records: ["Super Admin", "Manager", "Technician", "Front desk"],
  notifications: ["Super Admin", "Manager", "Technician", "Front desk"],
  customers: ["Super Admin", "Manager", "Front desk"],
  admin_customers: ["Super Admin", "Manager", "Front desk"],
  messages: ["Super Admin", "Manager", "Front desk"],
  reviews: ["Super Admin", "Manager", "Front desk"],
  invoices: ["Super Admin", "Manager", "Front desk"],
  inventory: ["Super Admin", "Manager", "Technician"],
  services: ["Super Admin", "Manager"],
  promos: ["Super Admin", "Manager"],
  // Wider than `promos`: front desk confirms the payments — see 0014/0015.
  promo_claims: ["Super Admin", "Manager", "Front desk"],
  admin_promo_claims: ["Super Admin", "Manager", "Front desk"],
  payments: ["Super Admin", "Manager"],
  finance: ["Super Admin", "Manager"],
  activity: ["Super Admin", "Manager"],
  revenue_series: ["Super Admin", "Manager"],
  revenue_breakdown: ["Super Admin", "Manager"],
};

const PROBE_ID = "__rls_probe__";
const leaked: [string, string][] = [];
const failures: string[] = [];

async function main() {
  for (const [role, email, password] of USERS) {
    const db = createClient(URL, ANON, { auth: { persistSession: false } });
    const { error: signIn } = await db.auth.signInWithPassword({ email, password });
    if (signIn) {
      failures.push(`${role}: cannot sign in — ${signIn.message}`);
      continue;
    }

    const readRow: string[] = [];
    for (const table of Object.keys(EXPECT)) {
      const allowed = EXPECT[table].includes(role);

      const { data, error } = await db.from(table).select("*").limit(1);
      // Denied reads come back as an empty set, not an error — RLS filters
      // rather than refusing, so "0 rows" and "not allowed" look identical.
      // Every table here is seeded, so empty means filtered.
      const canRead = !error && (data?.length ?? 0) > 0;
      if (canRead !== allowed) {
        failures.push(
          `READ ${table} as ${role}: expected ${allowed ? "allowed" : "denied"}, got ${canRead ? "allowed" : "denied"}${error ? ` (${error.code})` : ""}`,
        );
      }

      const { error: wErr } = await db.from(table).insert({ id: PROBE_ID });
      let write: string;
      if (!wErr) {
        write = "ALLOWED";
        leaked.push([table, role]);
      } else if (wErr.code === "42501") write = "denied";
      else write = `n/a(${wErr.code})`; // NOT NULL etc. fired before the policy

      if (write === "ALLOWED" && !allowed) {
        failures.push(`WRITE ${table} as ${role}: INSERT ACCEPTED but role has no access`);
      }
      readRow.push(`${table}:${canRead ? "R" : "-"}${write === "denied" ? "" : write === "ALLOWED" ? "W!" : "?"}`);
    }

    // Own staff row must be readable by everyone; other rows only by the owner.
    const { data: staffRows } = await db.from("staff").select("email");
    const seen = staffRows?.length ?? 0;
    const expectStaff = role === "Super Admin" ? ">1" : "1";
    if ((role === "Super Admin" && seen <= 1) || (role !== "Super Admin" && seen !== 1)) {
      failures.push(`staff visibility as ${role}: expected ${expectStaff} row(s), saw ${seen}`);
    }

    // settings is Super Admin write, everyone read (the public site reads it too).
    const { error: setErr } = await db
      .from("settings")
      .upsert({ key: "business", value: { name: "RLS PROBE" } });
    const settingsWrite = setErr ? `denied(${setErr.code})` : "ALLOWED";
    if (settingsWrite === "ALLOWED") {
      leaked.push(["settings", role]);
      if (role !== "Super Admin") failures.push(`WRITE settings as ${role}: ACCEPTED`);
    }

    console.log(`\n${role}  staffRowsVisible=${seen}  settingsWrite=${settingsWrite}`);
    console.log("  " + readRow.join("  "));
    await db.auth.signOut();
  }

  // Anonymous: nothing but the two deliberately public reads.
  const anon = createClient(URL, ANON, { auth: { persistSession: false } });
  const anonReads: string[] = [];
  for (const table of [...Object.keys(EXPECT), "staff", "settings", "passports"]) {
    const { data, error } = await anon.from(table).select("*").limit(1);
    const got = !error && (data?.length ?? 0) > 0;
    anonReads.push(`${table}:${got ? "READABLE" : "-"}`);
    // promos and settings are intentionally public (0004, 0005).
    if (got && !["promos", "settings"].includes(table)) {
      failures.push(`ANON can read ${table}`);
    }
  }
  console.log(`\nanonymous\n  ` + anonReads.join("  "));

  for (const [table, role] of leaked) {
    await svc.from(table).delete().eq("id", PROBE_ID);
    console.log(`cleaned probe row from ${table} (inserted as ${role})`);
  }
  if (leaked.some(([t]) => t === "settings")) {
    await svc.from("settings").delete().eq("key", "business");
    console.log("cleaned probe settings row");
  }

  console.log(`\n${failures.length ? "FAILURES:" : "no failures"}`);
  for (const f of failures) console.log("  ✗ " + f);
}

main().catch((e) => { console.error(e); process.exit(1); });
