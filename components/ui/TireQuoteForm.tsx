"use client";

import { useState } from "react";
import { business } from "@/lib/site";
import { emptyLead, validateContact, submitLead, type Lead } from "@/lib/lead";

const fieldClass =
  "w-full rounded-input border border-line bg-black px-4 py-3 text-ink placeholder:text-muted outline-none transition-colors focus:border-red";

const BUDGETS = ["Under $800", "$800 - $1,500", "$1,500 - $3,000", "$3,000+", "Not sure yet"];

const POINTS = [
  "Personalised recommendations",
  "Competitive options",
  "Fast response",
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mono-label">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

/**
 * Tire recommendation request — a narrower ask than the full appointment form:
 * the vehicle, what they're after, and how to reach them. Feeds the same
 * /api/lead pipeline as every other form on the site (see lib/lead.ts), with
 * the tire specifics carried in the note so nothing needs a second schema.
 */
export default function TireQuoteForm() {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [size, setSize] = useState("");
  const [preferred, setPreferred] = useState("");
  const [budget, setBudget] = useState("");
  const [addOns, setAddOns] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const note = [
      size && `Tire size: ${size}`,
      preferred && `Preferred brand: ${preferred}`,
      budget && `Budget: ${budget}`,
      addOns && `Add-ons: ${addOns}`,
    ]
      .filter(Boolean)
      .join(" · ");

    const lead: Lead = {
      ...emptyLead("quote"),
      services: ["Wheels & Tires"],
      vehicle: { year: year || undefined, make: make || undefined, model: model || undefined },
      contact: { name, phone, email: email || undefined },
      note: note || undefined,
    };

    const invalid = validateContact(lead);
    if (invalid) {
      setError(invalid);
      return;
    }

    setStatus("submitting");
    setError(null);
    const res = await submitLead(lead);
    if (res.ok) {
      setStatus("done");
    } else {
      setStatus("error");
      setError(res.error ?? "Something went wrong.");
    }
  };

  return (
    <section className="py-20 md:py-28" style={{ paddingInline: "var(--gutter)" }}>
      <div className="media-frame grid grid-cols-1 border border-line bg-black-raised lg:grid-cols-12">
        {/* Pitch panel */}
        <div className="relative flex flex-col justify-between overflow-hidden p-8 sm:p-10 lg:col-span-5">
          <div className="relative z-10">
            <p className="mono-label text-red">Not sure what you need?</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Get your custom tire recommendation
            </h2>
            <p className="mt-4 max-w-sm text-cream/80">
              Tell us about your vehicle and how you drive. We&apos;ll come back with the
              right tire for it — fitment, load rating, and price all accounted for.
            </p>
            <ul className="mt-6 space-y-2">
              {POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm text-cream/80">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Form panel */}
        <div className="border-t border-line p-8 sm:p-10 lg:col-span-7 lg:border-l lg:border-t-0">
          {status === "done" ? (
            <div>
              <p className="mono-label text-red">Request received</p>
              <h3 className="mt-3 font-display text-2xl text-ink">
                Thanks, {name.split(" ")[0] || "we're on it"}.
              </h3>
              <p className="mt-4 max-w-md text-cream/80">
                We&apos;ll come back with a tire recommendation for your{" "}
                {[year, make, model].filter(Boolean).join(" ") || "vehicle"}. For anything
                urgent, call{" "}
                <a href={business.phoneHref} className="link-underline text-ink">
                  {business.phone}
                </a>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Field label="Year">
                  <input
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 2022"
                    inputMode="numeric"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Make">
                  <input
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g. Toyota"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Model">
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Supra"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Tire size (optional)">
                  <input
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. 275/40R20"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Preferred brand">
                  <input
                    value={preferred}
                    onChange={(e) => setPreferred(e.target.value)}
                    placeholder="Any brand, or no preference"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Budget">
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">What&apos;s your budget?</option>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Add-ons / notes">
                  <input
                    value={addOns}
                    onChange={(e) => setAddOns(e.target.value)}
                    placeholder="Alignment, TPMS, powder coat, road-noise concerns…"
                    className={fieldClass}
                  />
                </Field>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Field label="Full name">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Email">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    inputMode="email"
                    autoComplete="email"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Phone">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={business.phone}
                    inputMode="tel"
                    autoComplete="tel"
                    className={fieldClass}
                  />
                </Field>
              </div>

              {error ? <p className="mono-label mt-4 text-red">{error}</p> : null}

              <button
                type="submit"
                disabled={status === "submitting"}
                style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
                className="btn-sweep mono-label mt-6 w-full rounded-full bg-red px-6 py-4 text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === "submitting" ? "Sending…" : "Get my tire quote →"}
              </button>

              <p className="mt-4 text-center text-xs text-muted">
                Our information is used only to respond to your request.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
