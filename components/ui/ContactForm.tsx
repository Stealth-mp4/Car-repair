"use client";

import { useState } from "react";
import { services } from "@/lib/site";
import { emptyLead, validateContact, submitLead } from "@/lib/lead";

const inputClass =
  "w-full rounded-input border border-line bg-black-raised px-4 py-3 text-ink placeholder:text-muted outline-none transition-colors focus:border-red";

/**
 * ContactForm — Name / Email / Phone / Service / Message, submitted through
 * the same shared lead pipeline as the Quote Builder and Chat Assistant
 * (source: "contact") — not a second contact pipeline. See lib/lead.ts.
 */
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const lead = {
      ...emptyLead("contact" as const),
      services: service ? [service] : [],
      contact: { name, phone, email: email || undefined, method: "email" as const },
      note: message || undefined,
    };

    const validationError = validateContact(lead);
    if (validationError) {
      setError(validationError);
      setStatus("error");
      return;
    }

    setStatus("sending");
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
      <div className="rounded-media border border-line p-8">
        <p className="mono-label text-red">Message sent</p>
        <h3 className="mt-3 font-display text-2xl text-ink">
          Thanks, {name.split(" ")[0] || "we're on it"}.
        </h3>
        <p className="mt-3 max-w-md text-cream/80">
          We&apos;ll get back to you shortly. For anything urgent, call{" "}
          <a href="tel:+18322081071" className="link-underline text-ink">
            (832) 208-1071
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="sr-only">Full name</span>
        <input
          required
          className={inputClass}
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="sr-only">Email address</span>
        <input
          type="email"
          className={inputClass}
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="sr-only">Phone number</span>
        <input
          required
          type="tel"
          className={inputClass}
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="sr-only">Service interested in</span>
        <select
          className={`${inputClass} appearance-none`}
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          <option value="">Service interested in (optional)</option>
          {services.map((s) => (
            <option key={s.slug} value={s.title}>
              {s.title}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="sr-only">Tell us about your project</span>
        <textarea
          className={inputClass}
          rows={4}
          placeholder="Tell us about your project…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>

      {status === "error" && error ? <p className="mono-label text-red">{error}</p> : null}

      <button
        type="submit"
        disabled={status === "sending"}
        style={{ ["--sweep" as string]: "var(--color-maroon)" }}
        className="btn-sweep mono-label w-full bg-red px-6 py-3.5 text-ink disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>

      <p className="text-xs text-muted">We respect your privacy. Your information is never shared.</p>
    </form>
  );
}
