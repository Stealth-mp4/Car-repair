"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, currentUser } from "@/lib/account/store";
import { business, hours, services as serviceList } from "@/lib/site";
import {
  Panel,
  Row,
  Field,
  fieldClass,
  PrimaryButton,
  formatDate,
} from "@/components/account/ui";
import {
  CalendarIcon,
  ClockIcon,
  WrenchIcon,
  CarIcon,
  PhoneIcon,
  CheckCircleIcon,
} from "@/components/account/icons";

/** Shop runs 12PM to 8PM, so the last bookable start is 7PM — same as /quote. */
const TIMES = ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];

const OTHER = "Other";
const SERVICE_TITLES = [...serviceList.map((s) => s.title), OTHER];

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Member booking. Deliberately NOT the public AppointmentForm: that one has to
 * collect a name, phone, and vehicle from a stranger, and all three are already
 * on the account. This asks for the service and the slot, shows what it knows,
 * and records the request on the member instead of posting a cold lead.
 */
export default function AccountBookPage() {
  const user = useAccount(currentUser);
  const requestAppointment = useAccount((s) => s.requestAppointment);

  const [service, setService] = useState("");
  const [detail, setDetail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(TIMES[0]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const vehicle = user.vehicle.makeModel;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) {
      setError("Pick a service so we know what we're quoting.");
      return;
    }
    if (service === OTHER && !detail.trim()) {
      setError("Tell us what you need and we'll take it from there.");
      return;
    }

    requestAppointment({
      service: service === OTHER ? detail.trim() : service,
      date: date || undefined,
      time: time || undefined,
      vehicle: vehicle || undefined,
      note: service === OTHER ? detail.trim() : undefined,
    });
    setError(null);
    setDone(true);
  };

  if (done) {
    return (
      <Panel>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon/25">
          <CheckCircleIcon className="h-5 w-5 text-red" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-ink">Request received.</h2>
        <p className="mt-3 max-w-lg text-cream/80">
          We&apos;ll call you back on {user.phone || "your number on file"} to confirm
          {date ? ` ${formatDate(date)}` : ""}
          {time ? ` at ${time}` : ""}. It&apos;s on your overview now. For anything urgent,
          call{" "}
          <a href={business.phoneHref} className="link-underline text-ink">
            {business.phone}
          </a>
          .
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/account"
            style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
            className="btn-sweep mono-label bg-red px-5 py-3 text-ink"
          >
            Back to overview
          </Link>
          <button
            type="button"
            onClick={() => {
              setDone(false);
              setService("");
              setDate("");
            }}
            className="mono-label rounded-full border border-line px-5 py-3 text-cream transition-colors hover:border-red hover:text-ink"
          >
            Book another
          </button>
        </div>
      </Panel>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <form onSubmit={submit} className="lg:col-span-7">
        <Panel>
          <p className="mono-label flex items-center gap-2 text-red">
            <WrenchIcon className="h-3.5 w-3.5" />
            Select service
          </p>
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
                    active
                      ? "border-red bg-red/10 text-ink"
                      : "border-line text-cream hover:border-red"
                  }`}
                >
                  {title}
                </button>
              );
            })}
          </div>

          {service === OTHER ? (
            <div className="mt-5">
              <Field label="Tell us what you need">
                <textarea
                  rows={3}
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Chrome delete, caliper paint, starlight headliner…"
                  className={`${fieldClass} resize-y`}
                />
              </Field>
            </div>
          ) : null}

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Preferred date" icon={CalendarIcon}>
              <input
                type="date"
                min={today()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${fieldClass} [color-scheme:dark]`}
              />
            </Field>
            <Field label="Preferred time" icon={ClockIcon}>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={fieldClass}
              >
                {TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-8">
            <p className="mono-label flex items-center gap-2 text-red">
              <CarIcon className="h-3.5 w-3.5" />
              Vehicle
            </p>
            <div className="mt-3 rounded-media border border-dashed border-line px-5 py-4">
              {vehicle ? (
                <p className="text-sm text-ink">{vehicle}</p>
              ) : (
                <>
                  <p className="text-sm text-cream/70">
                    You haven&apos;t added a vehicle yet. Add one so we know what
                    we&apos;re working on.
                  </p>
                  <Link
                    href="/account/profile"
                    className="mono-label mt-3 inline-block rounded-full border border-line px-4 py-2 text-cream transition-colors hover:border-red hover:text-ink"
                  >
                    + Add a vehicle
                  </Link>
                </>
              )}
            </div>
          </div>

          {error ? <p className="mono-label mt-5 text-red">{error}</p> : null}

          <PrimaryButton type="submit" className="mt-7 w-full rounded-full">
            Request appointment →
          </PrimaryButton>
        </Panel>
      </form>

      <aside className="space-y-6 lg:col-span-5">
        <Panel title="Your request">
          <Row
            label="Service"
            value={(service === OTHER ? detail.trim() : service) || "—"}
          />
          <Row label="Date" value={date ? formatDate(date) : "—"} />
          <Row label="Time" value={time || "—"} />
          <Row label="Vehicle" value={vehicle || "—"} />
          <Row label="Contact" value={user.phone || "—"} />
        </Panel>

        <div className="rounded-media border border-maroon/60 bg-burgundy p-6">
          <h2 className="font-display text-lg text-ink">Visit us</h2>
          <address className="mt-3 not-italic text-sm text-cream/85">
            {business.address.street}, {business.address.locality},{" "}
            {business.address.region} {business.address.postalCode}
          </address>
          <ul className="mt-5 space-y-1 border-t border-maroon/50 pt-4 text-sm">
            {hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-6">
                <span className="text-cream/80">{h.day}</span>
                <span className={h.value === "Closed" ? "text-red" : "text-ink"}>
                  {h.value}
                </span>
              </li>
            ))}
          </ul>
          <a
            href={business.phoneHref}
            className="mono-label mt-5 inline-flex items-center gap-2 rounded-full border border-maroon/70 px-4 py-2.5 text-ink transition-colors hover:border-red"
          >
            <PhoneIcon className="h-3.5 w-3.5" />
            {business.phone}
          </a>
        </div>

      </aside>
    </div>
  );
}
