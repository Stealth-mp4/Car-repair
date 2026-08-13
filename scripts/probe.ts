import { createClient } from "@supabase/supabase-js";
const svc = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });

const MODE = process.argv[2]; // write | clear

async function main() {
  if (MODE === "clear") {
    const { error } = await svc.from("settings").delete().eq("key", "openingHours");
    console.log(error ? `clear failed: ${error.message}` : "cleared");
    return;
  }
  const { error } = await svc.from("settings").upsert({
    key: "openingHours",
    value: [
      { days: ["Tuesday", "Wednesday"], opens: "07:15", closes: "13:45" },
      { days: ["Saturday"], opens: "10:30", closes: "23:15" },
    ],
    updatedAt: new Date().toISOString(),
    updatedBy: "probe",
  });
  console.log(error ? `write failed: ${error.code} ${error.message}` : "written");
}
main().catch((e) => { console.error(e); process.exit(1); });
