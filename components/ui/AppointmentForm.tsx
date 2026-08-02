"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { business, hours, services as serviceList } from "@/lib/site";
import { emptyLead, validateContact, submitLead, type Lead } from "@/lib/lead";

/** Shop runs 12PM to 8PM, so the last bookable start is 7PM. */
const TIMES = ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];

/** Picking this swaps the chip row for a free-text box, so nobody is boxed in. */
const OTHER = "Other";
const SERVICE_TITLES = [...serviceList.map((s) => s.title), OTHER];

const fieldClass =
  "w-full rounded-input border border-line bg-black-raised px-4 py-3 text-ink placeholder:text-muted outline-none transition-colors focus:border-red";

const today = () => new Date().toISOString().slice(0, 10);

/** "2024 Tesla Model 3" -> { year, make, model }, best effort, nothing required. */
function parseVehicle(raw: string): Lead["vehicle"] {
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return {};
  const year = /^\d{4}$/.test(parts[0]) ? parts.shift() : undefined;
  return { year, make: parts.shift(), model: parts.join(" ") || undefined };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mono-label">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-right text-sm text-ink">{value || "-"}</span>
    </div>
  );
}

/**
 * Appointment request form — one page, no steps, no account. The old six-step
 * Quote Builder tested as too technical; this asks only what the shop needs to
 * call back and confirm. Deep links from the gallery, Tesla hub and service
 * pages still prefill through ?year&make&model&service.
 */
export default function AppointmentForm() {
  const params = useSearchParams();
  const [service, setService] = useState("");
  const [detail, setDetail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const preset = [params.get("year"), params.get("make"), params.get("model")]
      .filter(Boolean)
      .join(" ");
    if (preset) setVehicle(preset);

    const slug = params.get("service");
    const match = serviceList.find((s) => s.slug === slug?.toLowerCase());
    if (match) setService(match.title);
  }, [params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (service === OTHER && !detail.trim()) {
      setError("Tell us what you need and we'll take it from there.");
      return;
    }

    const lead: Lead = {
      ...emptyLead("quote"),
      services: service ? [service] : [],
      vehicle: parseVehicle(vehicle),
      appointment: { date: date || undefined, time: time || undefined },
      contact: { name, phone, email: email || undefined },
      note: service === OTHER ? detail.trim() : undefined,
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

  if (status === "done") {
    return (
      <div className="rounded-media border border-line bg-black-raised p-8">
        <p className="mono-label text-red">Request received</p>
        <h2 className="mt-3 font-display text-3xl text-ink">
          Thanks, {name.split(" ")[0] || "we're on it"}.
        </h2>
        <p className="mt-4 max-w-xl text-cream/80">
          We&apos;ll call you back to confirm your slot
          {date ? ` on ${date}` : ""}
          {time ? ` at ${time}` : ""}. For anything urgent, call{" "}
          <a href={business.phoneHref} className="link-underline text-ink">
            {business.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Form card */}
      <form
        onSubmit={submit}
        className="rounded-media border border-line bg-black-raised p-6 sm:p-8 lg:col-span-7"
      >
        <p className="mono-label text-red">Select service</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SERVICE_TITLES.map((title) => {
            const active = service === title;
            return (
              <button
                key={title}
                type="button"
                onClick={() => setService(active ? "" : title)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  active ? "border-red bg-red/10 text-ink" : "border-line text-cream hover:border-red"
                }`}
              >
                {title}
              </button>
            );
          })}
        </div>

        {service === OTHER ? (
          <div className="mt-5">
            <label htmlFor="other-detail" className="mono-label">
              Tell us what you need
            </label>
            <textarea
              id="other-detail"
              rows={3}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Describe the service you're looking for."
              className={`mt-2 ${fieldClass} resize-y`}
            />
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Preferred date">
            <input
              type="date"
              min={today()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${fieldClass} [color-scheme:dark]`}
            />
          </Field>
          <Field label="Preferred time">
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={fieldClass}
            >
              <option value="">Choose a time</option>
              {TIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Full name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
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
          <Field label="Email (optional)">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              inputMode="email"
              autoComplete="email"
              className={fieldClass}
            />
          </Field>
          <Field label="Vehicle (year / make / model)">
            <input
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="2024 Tesla Model 3"
              className={fieldClass}
            />
          </Field>
        </div>

        <p className="mt-8 rounded-media border border-maroon/50 bg-maroon/10 px-5 py-4 text-sm text-cream/80">
          No account needed. Send the request and we&apos;ll confirm your appointment.
          Add an email above to also get it in writing.
        </p>

        {error ? <p className="mono-label mt-4 text-red">{error}</p> : null}

        <button
          type="submit"
          disabled={status === "submitting"}
          style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
          className="btn-sweep mono-label mt-6 w-full rounded-full bg-red px-6 py-4 text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "submitting" ? "Sending…" : "Request appointment →"}
        </button>
      </form>

      {/* Live summary + shop details */}
      <aside className="space-y-6 lg:col-span-5">
        <div className="rounded-media border border-line bg-black-raised p-6">
          <h2 className="font-display text-xl text-ink">Your request</h2>
          <div className="mt-4">
            <SummaryRow
              label="Service"
              value={service === OTHER && detail.trim() ? detail.trim() : service}
            />
            <SummaryRow label="Date" value={date} />
            <SummaryRow label="Time" value={time} />
            <SummaryRow label="Vehicle" value={vehicle} />
          </div>
        </div>

        <div className="rounded-media border border-line bg-black-raised p-6">
          <h2 className="font-display text-xl text-ink">Visit us</h2>
          <address className="mt-3 not-italic text-sm text-cream/80">
            {business.address.street}, {business.address.locality}, {business.address.region}{" "}
            {business.address.postalCode}
          </address>
          <ul className="mt-5 space-y-1 border-t border-line pt-4 text-sm">
            {hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-6">
                <span className="text-cream/80">{h.day}</span>
                <span className={h.value === "Closed" ? "text-red" : "text-ink"}>{h.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="rounded-media border border-line px-6 py-5 text-sm text-cream/80">
          For immediate scheduling help, call or text{" "}
          <a href={business.phoneHref} className="link-underline text-ink">
            {business.phone}
          </a>
          .
        </p>
      </aside>
    </div>
  );
}
