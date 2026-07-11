"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { services as serviceList, makes } from "@/lib/site";
import {
  emptyLead,
  validateContact,
  submitLead,
  type ContactMethod,
  type Lead,
} from "@/lib/lead";

const STEPS = ["Vehicle", "Services", "Details", "Photos", "Contact", "Review"];
const STORAGE_KEY = "iqballaz_quote_v1";
const TIMELINES = ["ASAP", "2–4 weeks", "Flexible", "Just pricing"];
const CONTACT_METHODS: ContactMethod[] = ["phone", "text", "email"];

const inputClass =
  "w-full rounded-input border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted outline-none transition-colors focus:border-ember";

/* Buttons — sweep fill, no scale (build.md hover law). Actions, so <button> not Link. */
function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ["--sweep" as string]: "#b8481f" } as React.CSSProperties}
      className="btn-sweep mono-label bg-ember px-6 py-3 text-graphite disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ["--sweep" as string]: "var(--color-surface)" } as React.CSSProperties}
      className="btn-sweep mono-label border border-line px-6 py-3 text-ink"
    >
      {children}
    </button>
  );
}

export default function QuoteWizard() {
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [lead, setLead] = useState<Lead>(() => emptyLead("quote"));
  const [files, setFiles] = useState<File[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Hydrate from localStorage, then merge any ?make&model&year prefill (gallery/Tesla CTAs)
  useEffect(() => {
    let base = emptyLead("quote");
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) base = { ...base, ...(JSON.parse(saved) as Lead) };
    } catch {
      /* ignore corrupt storage */
    }
    const make = params.get("make");
    const model = params.get("model");
    const year = params.get("year");
    if (make || model || year) {
      base = {
        ...base,
        vehicle: {
          ...base.vehicle,
          make: make ?? base.vehicle.make,
          model: model ?? base.vehicle.model,
          year: year ?? base.vehicle.year,
        },
      };
    }
    // Prefill service from a /services/* CTA (?service=slug)
    const serviceSlug = params.get("service");
    if (serviceSlug) {
      const match = serviceList.find((s) => s.slug === serviceSlug.toLowerCase());
      if (match && !base.services.includes(match.title)) {
        base = { ...base, services: [...base.services, match.title] };
      }
    }
    setLead(base);
    setHydrated(true);
  }, [params]);

  // Autosave so a refresh doesn't lose progress
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lead));
    } catch {
      /* storage may be unavailable */
    }
  }, [lead, hydrated]);

  const setVehicle = (patch: Partial<Lead["vehicle"]>) =>
    setLead((l) => ({ ...l, vehicle: { ...l.vehicle, ...patch } }));
  const setDetails = (patch: Partial<Lead["details"]>) =>
    setLead((l) => ({ ...l, details: { ...l.details, ...patch } }));
  const setContact = (patch: Partial<Lead["contact"]>) =>
    setLead((l) => ({ ...l, contact: { ...l.contact, ...patch } }));
  const toggleService = (title: string) =>
    setLead((l) => ({
      ...l,
      services: l.services.includes(title)
        ? l.services.filter((s) => s !== title)
        : [...l.services, title],
    }));

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 8));
  };

  const contactError = validateContact(lead);
  const canContinue = step !== 4 || !contactError;

  const submit = async () => {
    setStatus("submitting");
    setError(null);
    const res = await submitLead({ ...lead, photos: files.map((f) => f.name) });
    if (res.ok) {
      setStatus("done");
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    } else {
      setStatus("error");
      setError(res.error ?? "Something went wrong.");
    }
  };

  if (status === "done") {
    return (
      <div className="rounded-media border border-line p-8">
        <p className="mono-label text-ember">Request received</p>
        <h2 className="mt-3 font-display text-3xl text-ink">
          Thanks, {lead.contact.name.split(" ")[0] || "we're on it"}.
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          We&apos;ll reach out
          {lead.contact.method ? ` by ${lead.contact.method}` : ""} to talk through
          your {lead.services.join(", ") || "build"}. For anything urgent, call{" "}
          <a href="tel:+18322081071" className="link-underline text-ink">
            (832) 208-1071
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress — mono step counter + thin rules (not dots) */}
      <div>
        <p className="mono-label">
          Step {step + 1} / {STEPS.length} — {STEPS[step]}
        </p>
        <div className="mt-3 flex gap-2">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-px flex-1 transition-colors duration-300 ${
                i <= step ? "bg-ink" : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-10 min-h-[22rem]">
        {step === 0 ? (
          <div className="grid max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mono-label">Year</span>
              <input
                className={`mt-2 ${inputClass}`}
                inputMode="numeric"
                placeholder="2024"
                value={lead.vehicle.year ?? ""}
                onChange={(e) => setVehicle({ year: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mono-label">Make</span>
              <input
                className={`mt-2 ${inputClass}`}
                list="makes"
                placeholder="Tesla"
                value={lead.vehicle.make ?? ""}
                onChange={(e) => setVehicle({ make: e.target.value })}
              />
              <datalist id="makes">
                {makes.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </label>
            <label className="block">
              <span className="mono-label">Model</span>
              <input
                className={`mt-2 ${inputClass}`}
                placeholder="Model 3"
                value={lead.vehicle.model ?? ""}
                onChange={(e) => setVehicle({ model: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mono-label">VIN (optional)</span>
              <input
                className={`mt-2 ${inputClass}`}
                placeholder="5YJ3E1EA…"
                value={lead.vehicle.vin ?? ""}
                onChange={(e) => setVehicle({ vin: e.target.value })}
              />
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {serviceList.map((s) => {
              const selected = lead.services.includes(s.title);
              return (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => toggleService(s.title)}
                  aria-pressed={selected}
                  className={`media-frame group relative block aspect-4/5 text-left ${
                    selected ? "ring-2 ring-ember" : ""
                  }`}
                >
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 30vw"
                    className="graded object-cover transition-transform duration-600 ease-brand group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-0 bg-linear-to-t from-graphite/85 to-transparent" />
                  <span className="absolute inset-x-3 bottom-3">
                    <span className="block font-display text-lg text-ink">{s.title}</span>
                    <span className="mono-label text-ember">
                      {selected ? "Selected" : "Tap to add"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="max-w-2xl space-y-6">
            <label className="block">
              <span className="mono-label">Colour / finish preference</span>
              <input
                className={`mt-2 ${inputClass}`}
                placeholder="Satin black, stealth PPF, chrome delete…"
                value={lead.details.colorFinish ?? ""}
                onChange={(e) => setDetails({ colorFinish: e.target.value })}
              />
            </label>
            <div>
              <span className="mono-label">Timeline</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {TIMELINES.map((t) => {
                  const active = lead.details.timeline === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDetails({ timeline: t })}
                      className={`mono-label rounded-full border px-3 py-1.5 transition-colors ${
                        active ? "border-ember text-ember" : "border-line text-ink hover:border-ember"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="max-w-2xl">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInput.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-media border border-dashed px-6 py-14 text-center transition-colors ${
                dragOver ? "border-ember bg-surface" : "border-line"
              }`}
            >
              <p className="mono-label">Drop photos here</p>
              <p className="mt-2 text-sm text-muted">
                or click to browse — optional, up to 8
              </p>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>
            {files.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="mono-label flex items-center gap-2 rounded-full border border-line px-3 py-1.5"
                  >
                    {f.name.length > 22 ? f.name.slice(0, 20) + "…" : f.name}
                    <button
                      type="button"
                      onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                      className="text-ember"
                      aria-label={`Remove ${f.name}`}
                    >
                      remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="max-w-2xl space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mono-label">Name</span>
                <input
                  className={`mt-2 ${inputClass}`}
                  placeholder="Full name"
                  value={lead.contact.name}
                  onChange={(e) => setContact({ name: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="mono-label">Phone</span>
                <input
                  className={`mt-2 ${inputClass}`}
                  inputMode="tel"
                  placeholder="(832) 208-1071"
                  value={lead.contact.phone}
                  onChange={(e) => setContact({ phone: e.target.value })}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mono-label">Email (optional)</span>
                <input
                  className={`mt-2 ${inputClass}`}
                  inputMode="email"
                  placeholder="you@email.com"
                  value={lead.contact.email ?? ""}
                  onChange={(e) => setContact({ email: e.target.value })}
                />
              </label>
            </div>
            <div>
              <span className="mono-label">Preferred contact</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {CONTACT_METHODS.map((m) => {
                  const active = lead.contact.method === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setContact({ method: m })}
                      className={`mono-label rounded-full border px-3 py-1.5 capitalize transition-colors ${
                        active ? "border-ember text-ember" : "border-line text-ink hover:border-ember"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <dl className="max-w-2xl divide-y divide-line border-y border-line">
            {[
              [
                "Vehicle",
                [lead.vehicle.year, lead.vehicle.make, lead.vehicle.model]
                  .filter(Boolean)
                  .join(" ") || "—",
              ],
              ["Services", lead.services.join(", ") || "—"],
              ["Colour / finish", lead.details.colorFinish || "—"],
              ["Timeline", lead.details.timeline || "—"],
              ["Photos", files.length ? `${files.length} attached` : "None"],
              [
                "Contact",
                `${lead.contact.name || "—"} · ${lead.contact.phone || "—"}${
                  lead.contact.method ? ` · ${lead.contact.method}` : ""
                }`,
              ],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3">
                <dt className="mono-label">{k}</dt>
                <dd className="text-right text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      {/* Inline errors */}
      {step === 4 && contactError ? (
        <p className="mono-label mt-4 text-ember">{contactError}</p>
      ) : null}
      {status === "error" && error ? (
        <p className="mono-label mt-4 text-ember">{error}</p>
      ) : null}

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between">
        {step > 0 ? (
          <GhostButton onClick={() => setStep((s) => s - 1)}>Back</GhostButton>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <PrimaryButton
            onClick={() => canContinue && setStep((s) => s + 1)}
            disabled={!canContinue}
          >
            Continue
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={submit} disabled={status === "submitting"}>
            {status === "submitting" ? "Sending…" : "Submit request"}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
